import { createHash } from "crypto"
import { NextRequest, NextResponse } from "next/server"

const CATCHFORM_DIRECT_FORM_BASE_URL = "https://catchform.vercel.app/form"

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

function normalizeBrand(raw: string) {
  const value = (raw || "").toUpperCase()
  return value === "SF" || value === "SS" ? "SNIPERFACTORY" : value === "IO" ? "INSIDEOUT" : value === "SP" ? "SFACSPACE" : value
}

function decodeCompactFormId(value: string) {
  if (!value) return ""
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) return value
  if (!/^[A-Za-z0-9_-]{20,24}$/.test(value)) return ""
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=")
    const hex = Buffer.from(padded, "base64").toString("hex")
    if (!/^[0-9a-f]{32}$/i.test(hex)) return ""
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  } catch {
    return ""
  }
}

function formUrlFromSlug(req: NextRequest, slug: string, brandOverride = "") {
  const rawBrand = brandOverride || req.nextUrl.searchParams.get("brand") || req.nextUrl.searchParams.get("b") || ""
  const brand = normalizeBrand(rawBrand)
  if (brand === "SNIPERFACTORY" || brand === "SFACSPACE") {
    return new URL(`${CATCHFORM_DIRECT_FORM_BASE_URL}/${encodeURIComponent(slug)}`)
  }
  const base = process.env.NEXT_PUBLIC_FORM_BASE_URL || ""

  if (base) {
    const url = new URL(base)
    url.searchParams.set("slug", slug)
    return url
  }

  return new URL(`/form/${encodeURIComponent(slug)}`, req.url)
}

type FormConfigRow = {
  id?: string
  slug?: string
  brand?: string
  config?: { brand?: string; integrations?: { qrLinks?: Array<{ code?: string; url?: string }> } }
}

function qrTargetFromConfig(row: FormConfigRow | null, code: string) {
  const links = row?.config?.integrations?.qrLinks || []
  const target = links.find((item) => item?.code === code)?.url || ""
  return /^https?:\/\//i.test(target) ? target : ""
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

async function findFormById(formId: string): Promise<FormConfigRow | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  if (!supabaseUrl || !supabaseAnonKey || !formId) return null

  try {
    const response = await fetch(
      `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/form_configs?select=id,slug,brand,config&id=eq.${encodeURIComponent(formId)}&limit=1`,
      {
        headers: {
          apikey: supabaseAnonKey,
          authorization: `Bearer ${supabaseAnonKey}`,
        },
        cache: "no-store",
      },
    )
    if (!response.ok) return null
    const rows = (await response.json()) as FormConfigRow[]
    return rows[0] || null
  } catch {
    return null
  }
}

async function findQrTargetBySlug(slug: string, code: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  if (!supabaseUrl || !supabaseAnonKey || !slug || !code) return ""

  try {
    const response = await fetch(
      `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/form_configs?select=config&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      {
        headers: {
          apikey: supabaseAnonKey,
          authorization: `Bearer ${supabaseAnonKey}`,
        },
        cache: "no-store",
      },
    )
    if (!response.ok) return ""
    const rows = (await response.json()) as FormConfigRow[]
    return qrTargetFromConfig(rows[0] || null, code)
  } catch {
    return ""
  }
}

async function recordQrScan(req: NextRequest, targetUrl: string, resolved: { formId?: string; formSlug?: string; qrLabel?: string } = {}) {
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
  const formSlug = search.get("slug") || search.get("s") || resolved.formSlug || ""
  const compactFormId = decodeCompactFormId(search.get("i") || "")
  const formId = search.get("fid") || search.get("f") || compactFormId || resolved.formId || (await findFormIdBySlug(formSlug))
  const qrType = search.get("type") || (search.get("d") ? "detail" : "form")
  const qrLabel = search.get("label") || search.get("l") || resolved.qrLabel || ""
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
      cf_form_id: formId,
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
  const qrCode = req.nextUrl.searchParams.get("q") || ""
  const compactFormId = decodeCompactFormId(req.nextUrl.searchParams.get("i") || "")
  const formRow = compactFormId ? await findFormById(compactFormId) : null
  const resolvedSlug = slug || formRow?.slug || ""
  const resolvedFormId = formRow?.id || compactFormId || (resolvedSlug ? await findFormIdBySlug(resolvedSlug) : "") || ""
  const resolvedBrand = formRow?.config?.brand || formRow?.brand || ""
  const storedTarget = target ? "" : qrTargetFromConfig(formRow, qrCode) || (await findQrTargetBySlug(resolvedSlug, qrCode))
  let targetUrl: URL
  try {
    targetUrl = target || storedTarget ? new URL(target || storedTarget) : formUrlFromSlug(req, resolvedSlug, resolvedBrand)
    if (!["http:", "https:"].includes(targetUrl.protocol)) throw new Error("invalid protocol")
  } catch {
    targetUrl = new URL("/", req.url)
  }

  const qrType = req.nextUrl.searchParams.get("type") || (req.nextUrl.searchParams.get("d") ? "detail" : "form")
  const qrLabel = req.nextUrl.searchParams.get("label") || req.nextUrl.searchParams.get("l") || resolvedSlug || qrType
  const redirectUrl = appendQrParams(targetUrl.toString(), {
    cf_qr: "1",
    cf_qr_redirected: "1",
    cf_form_id: resolvedFormId,
    qr_type: qrType,
    qr_label: qrLabel,
    qr_target: targetUrl.toString(),
    utm_source: "qr",
    utm_medium: "qrcode",
    utm_campaign: qrLabel,
  })

  await recordQrScan(req, targetUrl.toString(), { formId: resolvedFormId, formSlug: resolvedSlug, qrLabel })
  return NextResponse.redirect(redirectUrl, 302)
}
