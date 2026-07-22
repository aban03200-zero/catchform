import { notFound } from "next/navigation"
import { publicEnv } from "@/lib/env"

export const dynamic = "force-dynamic"

type ConsentConfig = {
  enabled?: boolean
  title?: string
  policyMode?: "brand" | "custom"
  customPolicyTitle?: string
  customPolicyBody?: string
}

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function mdToHtml(text: string): string {
  if (!text) return ""
  const source = String(text || "").replace(/&quot;|&#34;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&#42;|&ast;/gi, "*")
  const esc = (s: string) => escapeHtml(s)
  const attr = (s: string) => esc(s).replace(/"/g, "&quot;").replace(/'/g, "&#39;")
  const safeHref = (raw: string) => {
    const href = String(raw || "").trim()
    if (!href || /[\s"'<>]/.test(href)) return "#"
    try {
      const url = new URL(href, "https://catchform.local")
      if (["http:", "https:", "mailto:", "tel:"].includes(url.protocol)) return attr(href)
    } catch {}
    return "#"
  }
  const tokens: string[] = []
  const tokenFor = (html: string) => {
    const token = `\uE000${tokens.length}\uE000`
    tokens.push(html)
    return token
  }
  const richText = (body: string) => esc(body).replace(/\n/g, "<br>")
  const sourceWithRich = source
    .replace(/\*\*__([\s\S]+?)__\*\*/g, (_match, body) => tokenFor(`<strong><span style="text-decoration:underline">${richText(body)}</span></strong>`))
    .replace(/__\*\*([\s\S]+?)\*\*__/g, (_match, body) => tokenFor(`<strong><span style="text-decoration:underline">${richText(body)}</span></strong>`))
    .replace(/\*\*([\s\S]+?)\*\*/g, (_match, body) => tokenFor(`<strong>${richText(body)}</strong>`))
    .replace(/__([\s\S]+?)__/g, (_match, body) => tokenFor(`<span style="text-decoration:underline">${richText(body)}</span>`))
  const restoreTokens = (html: string) => html.replace(/\uE000(\d+)\uE000/g, (_match, idx) => tokens[Number(idx)] || "")
  const fmt = (s: string) => {
    const e = esc(s)
    return restoreTokens(e
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label, href) => `<a href="${safeHref(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`)
    )
  }
  const lines = sourceWithRich.split("\n")
  let html = ""
  let inList = false
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    if (raw.trim() === "---") {
      if (inList) { html += "</ul>"; inList = false }
      html += '<hr style="border:none;border-top:1px solid currentColor;opacity:0.14;margin:18px 0"/>'
    } else if (/^- /.test(raw)) {
      if (!inList) { html += "<ul>"; inList = true }
      html += `<li>${fmt(raw.slice(2))}</li>`
    } else {
      if (inList) { html += "</ul>"; inList = false }
      html += fmt(raw) + (i < lines.length - 1 ? "<br>" : "")
    }
  }
  if (inList) html += "</ul>"
  return html
}

async function getPolicy(slug: string, index: number) {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey || !slug || !Number.isInteger(index) || index < 0) return null
  const baseUrl = publicEnv.supabaseUrl.replace(/\/+$/, "")
  const url = `${baseUrl}/rest/v1/form_configs?select=name,config&slug=eq.${encodeURIComponent(slug)}&limit=1`
  const res = await fetch(url, {
    headers: {
      apikey: publicEnv.supabaseAnonKey,
      authorization: `Bearer ${publicEnv.supabaseAnonKey}`,
    },
    cache: "no-store",
  })
  if (!res.ok) return null
  const rows = (await res.json()) as Array<{ name?: string; config?: any }>
  const row = rows[0]
  const consents = Array.isArray(row?.config?.consents) ? row.config.consents.filter((item: ConsentConfig) => item?.enabled) : []
  const consent = consents[index] as ConsentConfig | undefined
  const body = String(consent?.customPolicyBody || "").trim()
  if (!consent || consent.policyMode !== "custom" || !body) return null
  return {
    formName: String(row?.name || row?.config?.header?.title || "CatchForm"),
    title: String(consent.customPolicyTitle || consent.title || "법적 문서"),
    body,
  }
}

export default async function CustomPolicyPage({
  params,
}: {
  params: Promise<{ slug: string; index: string }>
}) {
  const { slug, index } = await params
  const policy = await getPolicy(slug, Number(index))
  if (!policy) notFound()

  return (
    <main className="policy-wrap">
      <style>{`
        .policy-wrap{min-height:100vh;background:#f7f8fa;color:#191919;font-family:'Pretendard Variable','Pretendard','Noto Sans KR',-apple-system,BlinkMacSystemFont,sans-serif;padding:52px 22px 72px;box-sizing:border-box}
        .policy-card{max-width:760px;margin:0 auto;background:#fff;border:1px solid #e5e8eb;border-radius:16px;padding:34px 30px;box-shadow:0 12px 32px rgba(0,0,0,.06);box-sizing:border-box}
        .policy-source{margin:0 0 8px;color:#8b95a1;font-size:13px;font-weight:600}
        .policy-title{margin:0 0 24px;font-size:26px;line-height:1.35;font-weight:700;white-space:pre-line}
        .policy-body{font-size:15px;line-height:1.85;color:#333;word-break:keep-all;overflow-wrap:anywhere}
        .policy-body strong{font-weight:700}
        .policy-body ul{margin:8px 0;padding-left:22px}
        .policy-body li{margin:4px 0}
        .policy-body a{color:#3182f6;text-decoration:underline;text-underline-offset:2px}
        @media(max-width:640px){.policy-wrap{padding:24px 14px 48px}.policy-card{padding:26px 20px;border-radius:12px}.policy-title{font-size:22px}.policy-body{font-size:14px;line-height:1.8}}
      `}</style>
      <article className="policy-card">
        <p className="policy-source">{policy.formName}</p>
        <h1 className="policy-title">{policy.title}</h1>
        <div className="policy-body" dangerouslySetInnerHTML={{ __html: mdToHtml(policy.body) }} />
      </article>
    </main>
  )
}
