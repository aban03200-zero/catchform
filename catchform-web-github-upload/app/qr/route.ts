import { createHash } from "crypto"
import { NextRequest, NextResponse } from "next/server"

function readHeader(headers: Headers, names: string[]) {
  for (const name of names) {
    const value = headers.get(name)
    if (value) {
      try {
        return decodeURIComponent(value)
      } catch {
        return value
      }
    }
  }
  return ""
}

function detectOS(userAgent: string) {
  if (/android/i.test(userAgent)) return "Android"
  if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS"
  if (/windows/i.test(userAgent)) return "Windows"
  if (/mac os|macintosh/i.test(userAgent)) return "macOS"
  if (/cros/i.test(userAgent)) return "Chrome OS"
  if (/linux/i.test(userAgent)) return "Linux"
  return "기타"
}

function appendQrParams(target: string, params: Record<string, string>) {
  const url = new URL(target)
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value)
  })
  return url.toString()
}

function formUrlFromSlug(req: NextRequest, slug: string) {
  const rawBrand = (req.nextUrl.searchParams.get("brand") || req.nextUrl.searchParams.get("b") || "").toUpperCase()
  const brand = rawBrand === "SF" ? "SNIPERFACTORY" : rawBrand === "IO" ? "INSIDEOUT" : rawBrand
  const base = (
    brand === "SNIPERFACTORY"
      ? process.env.NEXT_PUBLIC_SF_FORM_BASE_URL
      : process.env.NEXT_PUBLIC_FORM_BASE_URL
  ) || ""

  if (base) {
    const url = new URL(base)
    url.searchParams.set("slug", slug)
    return url
  }

  return new URL(`/form/${encodeURIComponent(slug)}`, req.url)
}

async function findFormIdBySlug(slug: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  if (!supabaseUrl || !supabaseAnonKey || !slug) return null

  try {
    const response = await fetch(
      `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/form_configs?select=id&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      {
        headers: {
          apikey: supabaseAnonKey,
          authorization: `Bearer ${supabaseAnonKey}`,
        },
        cache: "no-store",
      },
    )
    if (!response.ok) return null
    const rows = (await response.json()) as Array<{ id?: string }>
    return rows[0]?.id || null
  } catch {
    return null
  }
}

async function recordQrScan(req: NextRequest, targetUrl: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  if (!supabaseUrl || !supabaseAnonKey) return

  const search = req.nextUrl.searchParams
  const headers = req.headers
  const userAgent = headers.get("user-agent") || ""
  const ip = readHeader(headers, ["x-forwarded-for", "x-real-ip", "cf-connecting-ip"]).split(",")[0]?.trim() || ""
  const country = readHeader(headers, ["x-vercel-ip-country", "cf-ipcountry", "x-country"])
  const region = readHeader(headers, ["x-vercel-ip-country-region", "x-vercel-ip-region", "x-region"])
  const city = readHeader(headers, ["x-vercel-ip-city", "x-city"])
  const formSlug = search.get("slug") || search.get("s") || ""
  const formId = search.get("fid") || search.get("f") || (await findFormIdBySlug(formSlug))
  const qrType = search.get("type") || (search.get("d") ? "detail" : "form")
  const qrLabel = search.get("label") || search.get("l") || ""
  const fingerprint = createHash("sha256")
    .update([formId || "", formSlug, qrType, targetUrl, ip, userAgent].join("|"))
    .digest("hex")
    .slice(0, 24)

  const payload = {
    form_id: formId,
    form_slug: formSlug,
    session_id: `qr_${fingerprint}`,
    event_type: "qr_scan",
    page: 1,
    metadata: {
      cf_qr: "1",
      qr_type: qrType,
      qr_label: qrLabel,
      qr_target: targetUrl,
      source: "QR",
      utm_source: "qr",
      utm_medium: "qrcode",
      utm_campaign: qrLabel || formSlug || qrType,
      country,
      region,
      city,
      language: headers.get("accept-language") || "",
      timezone: "",
      platform: "",
      device_os: detectOS(userAgent),
      user_agent: userAgent,
      referrer: headers.get("referer") || "",
    },
  }

  try {
    await fetch(`${supabaseUrl.replace(/\/+$/, "")}/rest/v1/form_response_events`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        authorization: `Bearer ${supabaseAnonKey}`,
        "content-type": "application/json",
        prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    })
  } catch {}
}

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("to") || req.nextUrl.searchParams.get("u") || ""
  const slug = req.nextUrl.searchParams.get("slug") || req.nextUrl.searchParams.get("s") || ""
  let targetUrl: URL
  try {
    targetUrl = target ? new URL(target) : formUrlFromSlug(req, slug)
    if (!["http:", "https:"].includes(targetUrl.protocol)) throw new Error("invalid protocol")
  } catch {
    targetUrl = new URL("/", req.url)
  }

  const qrType = req.nextUrl.searchParams.get("type") || (req.nextUrl.searchParams.get("d") ? "detail" : "form")
  const qrLabel = req.nextUrl.searchParams.get("label") || req.nextUrl.searchParams.get("l") || req.nextUrl.searchParams.get("slug") || req.nextUrl.searchParams.get("s") || qrType
  const redirectUrl = appendQrParams(targetUrl.toString(), {
    cf_qr: "1",
    cf_qr_redirected: "1",
    qr_type: qrType,
    qr_label: qrLabel,
    qr_target: targetUrl.toString(),
    utm_source: "qr",
    utm_medium: "qrcode",
    utm_campaign: qrLabel,
  })

  await recordQrScan(req, targetUrl.toString())
  return NextResponse.redirect(redirectUrl, 302)
}
