"use client"

// CatchForm.tsx — CatchForm 배포용 폼 컴포넌트
// Next.js Client Component — FormAdmin_v3 config 구조 완전 호환
// URL ?slug=xxx 로 form_configs 테이블에서 config 자동 로드

import * as React from "react"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const runtimeEnv = (key: string) => {
    try {
        const env = (globalThis as any)?.process?.env
        const value = env?.[key]
        return typeof value === "string" ? value : ""
    } catch {
        return ""
    }
}
const runtimeGlobal = (key: string) => {
    try {
        const value = (globalThis as any)?.[key]
        return typeof value === "string" ? value : ""
    } catch {
        return ""
    }
}
const pickConfigValue = (...values: Array<string | undefined>) => values.map(v => String(v || "").trim()).find(Boolean) || ""
const publicEnv = {
    supabaseUrl: runtimeEnv("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: runtimeEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    googleSheetsWebhookUrl: runtimeEnv("NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL"),
}

// ─── Types ────────────────────────────────────────────────────────────────
type Opt = { label: string; value: string; isEtc: boolean; nextPage?: number }
type HelperItem = { text: string; callout?: boolean }
type RecruitmentPeriodMode = "pre"|"formal"
type FieldType = "text"|"name"|"email"|"phone"|"referral"|"date"|"time"|"dropdown"|"button_select"|"checkbox"|"textarea"|"info"|"file"
type FormField = {
    id: string; type: FieldType; label: string; placeholder?: string
    helper?: string; helpers?: HelperItem[]; required?: boolean
    opts?: Opt[]; etcPh?: string; dupCheck?: boolean; page?: number; cols?: number
    imageUrl?: string; imageCaption?: string; imageFit?: "contain"|"cover"; imagePosX?: number; imagePosY?: number
    imageCropX?: number; imageCropY?: number; imageCropW?: number; imageCropH?: number; imageNaturalW?: number; imageNaturalH?: number
}
type KdtField = {
    id: string; label: string; type: string; required?: boolean
    page?: number; options?: string[]; opts?: Opt[]
    placeholder?: string; desc?: string
}
type Cfg = {
    header: {
        imageUrl: string; programId?: string; programUnlinked?: boolean; recruitmentPeriodMode?: RecruitmentPeriodMode; overline: string; title: string
        educationStart: string; educationEnd: string
        tuitionFree: boolean; tuitionFreeText: string; tuitionAmount: string; stipend: string
        noticeEnabled: boolean; noticeIconEnabled: boolean; noticeIconText: string; noticeText: string
        noticeShape?: "pill"|"rect"
        applicationType?: string
        imageFit?: "contain"|"cover"; imagePosX?: number; imagePosY?: number
        imageCropX?: number; imageCropY?: number; imageCropW?: number; imageCropH?: number; imageNaturalW?: number; imageNaturalH?: number
    }
    form: { fields: FormField[]; showNum: boolean; dupText: string; pages: number; pageLabels?: string[] }
    consents: { enabled: boolean; required: boolean; title: string; consentType?: string; body: string; checkLabel: string; policyUrl: string }[]
    cta: { label: string; loadLabel: string; height: number; bg: string; color: string }
    modal: { title: string; body: string; btnLabel: string; btnUrl: string; btnReplace: boolean }
    styles: { theme: "dark"|"light"; fieldH: number; qGap: number; maxW: number; labelGap?: number }
    auth: { enabled: boolean; loginUrl: string; errText: string }
    integrations?: { googleSheets?: { enabled: boolean; mode: "existing"|"new"; accountEmail: string; sheetUrl: string; sheetName: string; webhookUrl: string; lastSyncStatus?: "idle"|"sent"|"error"; lastSyncAt?: string; lastSyncMessage?: string } }
    dashboard?: { isPublished?: boolean; publishedAt?: string; operationStart?: string; operationEnd?: string; alwaysOpen?: boolean }
    brand: string
    formType?: "alert"|"kdt"|"blank"|"edu_biz"|"company"|"recruit"
    kdtFields?: KdtField[]
}

// ─── Supabase ─────────────────────────────────────────────────────────────
let _sb: SupabaseClient | null = null
function getSB(url: string, key: string): SupabaseClient | null {
    const u = url.trim(), k = key.trim()
    if (!u || !k) return null
    if (_sb && (_sb as any).__sig === `${u}::${k}`) return _sb
    _sb = createClient(u, k); (_sb as any).__sig = `${u}::${k}`
    return _sb
}

function dbBrandValue(brand: string) {
    const normalized = String(brand || "").trim().toUpperCase()
    if (!normalized) return ""
    if (normalized === "INSIDEOUT") return "INSIDEOUT"
    if (normalized === "SFACSPACE") return "SFACSPACE"
    return "SNIPERFACTORY"
}
function isCompanyApplicationConfig(config: any) {
    const formType = String(config?.formType || "")
    if (["edu_biz", "company", "recruit"].includes(formType)) return true
    const fields = Array.isArray(config?.form?.fields) ? config.form.fields : []
    const fieldIds = new Set(fields.map((field: any) => String(field?.id || "")))
    if (fieldIds.has("company_name") && (fieldIds.has("industry") || fieldIds.has("program_type") || fieldIds.has("business_type"))) return true
    const titleText = `${config?.header?.overline || ""} ${config?.header?.title || ""}`
    return titleText.includes("참여기업") || titleText.includes("참여 기업")
}

const SNIPERFACTORY_AUTH_SUFFIX = ".sniperfactory"

function authLoginEmail(email: string, brand: string) {
    const raw = email.trim()
    const normalizedBrand = String(brand || "").trim().toUpperCase()
    if (!raw || normalizedBrand !== "SNIPERFACTORY") return raw
    if (raw.toLowerCase().endsWith(SNIPERFACTORY_AUTH_SUFFIX)) return raw
    return `${raw}${SNIPERFACTORY_AUTH_SUFFIX}`
}

function optionsToOpts(options: any[] = []): Opt[] {
    return options.map((option: any) => {
        const label = String(option?.label ?? option?.value ?? option)
        const value = String(option?.value ?? option?.label ?? option)
        const key = value.trim().toLowerCase()
        const isEtc = !!option?.isEtc || label.includes("기타") || label.includes("직접") || value.includes("기타") || value.includes("직접") || key === "etc" || key === "other"
        return { label, value, isEtc }
    })
}

function kdtFieldsToFormFields(fields: any[] = []): any[] {
    return fields.map((field: any) => {
        const id = String(field.id || `field_${Date.now()}`)
        const rawType = String(field.type || "text")
        const type = rawType === "section_desc"
            ? "section_desc"
            : rawType === "text" && id.toLowerCase().includes("phone")
                ? "phone"
                : rawType === "text" && id.toLowerCase().includes("email")
                    ? "email"
                    : rawType
        const next: any = {
            ...field,
            id,
            type,
            label: field.label || "새 질문",
            page: field.page || 1,
            required: !!field.required,
            placeholder: rawType === "section_desc" ? (field.desc || field.placeholder || "") : field.placeholder,
        }
        if (Array.isArray(field.opts) && field.opts.length) next.opts = optionsToOpts(field.opts)
        else if (Array.isArray(field.options) && field.options.length) next.opts = optionsToOpts(field.options)
        delete next.options
        return next
    })
}

function normalizeRuntimeConfig(config: Cfg): Cfg {
    if (config.formType !== "kdt") return config
    const legacyFields = Array.isArray(config.kdtFields) && config.kdtFields.length
        ? kdtFieldsToFormFields(config.kdtFields)
        : (config.form?.fields || [])
    const pages = Math.max(config.form?.pages || 1, legacyFields.length ? Math.max(...legacyFields.map((field: any) => field.page || 1)) : 1)
    return {
        ...config,
        header: { ...config.header, applicationType: config.header?.applicationType || "formal" },
        form: {
            ...(config.form || {}),
            showNum: config.form?.showNum !== false,
            dupText: config.form?.dupText || "",
            pages,
            pageLabels: config.form?.pageLabels || ["기본 정보", "상세 정보", "자격 요건 및 동의"],
            fields: legacyFields.map((field: any) => ({ ...field, page: field.page || 1 })),
        },
        formType: "blank",
        kdtFields: undefined,
    }
}

// ─── Color tokens ─────────────────────────────────────────────────────────
const DARK = { bg: "#13151C", fieldBg: "#1E2230", fieldBorder: "#2C3148", t1: "#F0F3FF", t2: "#8B91A8", t3: "#555E7A", red: "#FF4747" }
const LIGHT = { bg: "#FFFFFF", fieldBg: "#F7F8FA", fieldBorder: "#E2E5EA", t1: "#1A1D27", t2: "#4A5068", t3: "#9EA8C0", red: "#FF4747" }
const FONT = "'Pretendard Variable','Pretendard','Noto Sans KR',-apple-system,sans-serif"
const FILE_MAX_COUNT = 5
const FILE_MAX_SIZE_MB = 10
const FILE_MAX_SIZE = FILE_MAX_SIZE_MB * 1024 * 1024
const FILE_LIMIT_TEXT = `최대 ${FILE_MAX_COUNT}개, 파일당 ${FILE_MAX_SIZE_MB}MB`
const imageFit = (img: any) => img?.imageFit === "cover" ? "cover" : "contain"
const imagePos = (img: any) => `${img?.imagePosX ?? 50}% ${img?.imagePosY ?? 50}%`
const cropNumber = (v: any, d: number, min: number, max: number) => Math.max(min, Math.min(max, Number.isFinite(Number(v)) ? Number(v) : d))
function detectDeviceOS() {
    if (typeof navigator === "undefined") return ""
    const ua = navigator.userAgent || ""
    const platform = navigator.platform || ""
    if (/android/i.test(ua)) return "Android"
    if (/iphone|ipad|ipod/i.test(ua) || (/Mac/i.test(platform) && (navigator as any).maxTouchPoints > 1)) return "iOS"
    if (/windows/i.test(ua) || /Win/i.test(platform)) return "Windows"
    if (/mac os|macintosh/i.test(ua) || /Mac/i.test(platform)) return "macOS"
    if (/cros/i.test(ua)) return "Chrome OS"
    if (/linux/i.test(ua) || /Linux/i.test(platform)) return "Linux"
    return "기타"
}
function postAppsScriptPayload(url: string, payload: any, opts: { allowDirectFallback?: boolean } = {}) {
    const allowDirectFallback = opts.allowDirectFallback !== false
    const directPost = () => fetch(url, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams({ payload: JSON.stringify(payload) }).toString(),
        headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
    }).then(() => {})

    return fetch("/api/google-sheets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ webhookUrl: url, payload }),
    }).then(async (res) => {
        if (res.ok) {
            const data = await res.json().catch(() => null)
            const result = data?.appsScriptResponse || data
            if (result?.ok === false) {
                throw Object.assign(new Error(result?.message || result?.error || "Apps Script 전송 실패"), { noDirectFallback: true })
            }
            return result
        }
        if (res.status === 404 && allowDirectFallback) return directPost()
        let message = "Google Sheets 전송 요청에 실패했어요."
        try {
            const data = await res.json()
            if (data?.error) message = data.error
        } catch {}
        throw Object.assign(new Error(message), { noDirectFallback: true })
    }).catch((err) => {
        if (allowDirectFallback && !(err as any)?.noDirectFallback && typeof window !== "undefined") return directPost()
        throw err
    })
}
function imageCropBox(img: any) {
    const w = cropNumber(img?.imageCropW, 100, 8, 100)
    const h = cropNumber(img?.imageCropH, 100, 8, 100)
    const x = cropNumber(img?.imageCropX, 0, 0, 100 - w)
    const y = cropNumber(img?.imageCropY, 0, 0, 100 - h)
    return { x, y, w, h }
}
const hasImageCrop = (img: any) => imageFit(img) === "cover" && Number.isFinite(Number(img?.imageCropW)) && Number.isFinite(Number(img?.imageCropH))
function imageCropAspect(img: any) {
    const b = imageCropBox(img)
    const nw = Number(img?.imageNaturalW) || 100
    const nh = Number(img?.imageNaturalH) || 100
    return Math.max(0.25, Math.min(5, (b.w * nw) / (b.h * nh)))
}
function croppedImageStyle(img: any): React.CSSProperties {
    const b = imageCropBox(img)
    return {
        position: "absolute" as const,
        width: `${10000 / b.w}%`,
        height: `${10000 / b.h}%`,
        left: `-${(b.x / b.w) * 100}%`,
        top: `-${(b.y / b.h) * 100}%`,
        objectFit: "fill" as const,
        display: "block",
    }
}
function imageBoxStyle(img: any, coverHeight: number, radius: number | string, bg: string): React.CSSProperties {
    return hasImageCrop(img)
        ? { width: "100%", aspectRatio: String(imageCropAspect(img)), borderRadius: radius, overflow: "hidden", position: "relative" as const, background: bg }
        : { width: "100%", height: imageFit(img) === "cover" ? coverHeight : "auto", borderRadius: radius, overflow: "hidden", position: "relative" as const, background: bg }
}
function imageImgStyle(img: any): React.CSSProperties {
    return hasImageCrop(img)
        ? croppedImageStyle(img)
        : { width: "100%", height: imageFit(img) === "cover" ? "100%" : "auto", display: "block", objectFit: imageFit(img), objectPosition: imagePos(img) }
}

// ─── Markdown → HTML ──────────────────────────────────────────────────────
function mdToHtml(text: string): string {
    if (!text) return ""
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    const fmt = (s: string) => {
        const e = esc(s)
        return e
            .replace(/\*\*__([^]*?)__\*\*/g, '<strong style="font-weight:600"><span style="text-decoration:underline">$1</span></strong>')
            .replace(/__\*\*([^]*?)\*\*__/g, '<strong style="font-weight:600"><span style="text-decoration:underline">$1</span></strong>')
            .replace(/\*\*([^]*?)\*\*/g, '<strong style="font-weight:600">$1</strong>')
            .replace(/__([^]*?)__/g, '<span style="text-decoration:underline">$1</span>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--link-color,#3182F6);text-decoration:underline" target="_blank" rel="noopener">$1</a>')
    }
    const lines = text.split("\n")
    let html = ""
    let inList = false
    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i]
        if (raw.trim() === "---") {
            if (inList) { html += "</ul>"; inList = false }
            html += '<hr style="border:none;border-top:1px solid currentColor;opacity:0.15;margin:8px 0"/>'
        } else if (/^- /.test(raw)) {
            if (!inList) { html += '<ul style="margin:4px 0;padding-left:18px;list-style:disc">'; inList = true }
            html += `<li style="margin:2px 0">${fmt(raw.slice(2))}</li>`
        } else {
            if (inList) { html += "</ul>"; inList = false }
            html += fmt(raw) + (i < lines.length - 1 ? "<br>" : "")
        }
    }
    if (inList) html += "</ul>"
    return html
}

function fmtDateKo(d: string) {
    if (!d) return ""
    const dt = new Date(d + "T00:00:00")
    const days = ["일", "월", "화", "수", "목", "금", "토"]
    return `${String(dt.getFullYear()).slice(2)}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}(${days[dt.getDay()]})`
}
function isValidEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) }
function isValidPhone(v: string) { return /^01[0-9]-\d{3,4}-\d{4}$/.test(v) }
function fmtPhone(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 11)
    if (d.length <= 3) return d
    if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
}
function operationTimeMs(value?: string, edge: "start" | "end" = "start") {
    const raw = String(value || "").trim()
    if (!raw) return 0
    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(raw)
        ? `${raw}T${edge === "end" ? "23:59:59" : "00:00:00"}`
        : raw
    const time = new Date(normalized).getTime()
    return Number.isFinite(time) ? time : 0
}
function firstDateValue(source: any, keys: string[]) {
    for (const key of keys) {
        const value = source?.[key]
        if (typeof value === "string" && value.trim()) return value.trim()
    }
    return ""
}
const FORMAL_RECRUITMENT_START_KEYS = [
    "formal_recruitment_start", "formal_recruitment_start_at", "formal_recruitment_start_date",
    "formal_recruit_start", "formal_recruit_start_at", "formal_recruit_start_date",
    "formal_application_start", "formal_application_start_at", "formal_application_start_date",
    "formal_apply_start", "formal_apply_start_at", "formal_apply_start_date",
    "regular_recruitment_start", "regular_recruitment_start_at", "regular_recruitment_start_date",
    "official_recruitment_start", "official_recruitment_start_at", "official_recruitment_start_date",
    "recruitment_start", "recruitment_start_at", "recruitment_start_date",
    "recruit_start", "recruit_start_at", "recruit_start_date",
    "application_start", "application_start_at", "application_start_date",
    "apply_start", "apply_start_at",
]
const FORMAL_RECRUITMENT_END_KEYS = [
    "formal_recruitment_end", "formal_recruitment_end_at", "formal_recruitment_end_date",
    "formal_recruit_end", "formal_recruit_end_at", "formal_recruit_end_date",
    "formal_application_end", "formal_application_end_at", "formal_application_end_date",
    "formal_apply_end", "formal_apply_end_at", "formal_apply_end_date",
    "regular_recruitment_end", "regular_recruitment_end_at", "regular_recruitment_end_date",
    "official_recruitment_end", "official_recruitment_end_at", "official_recruitment_end_date",
    "recruitment_end", "recruitment_end_at", "recruitment_end_date",
    "recruit_end", "recruit_end_at", "recruit_end_date",
    "application_end", "application_end_at", "application_end_date",
    "apply_end", "apply_end_at",
]
const PRE_RECRUITMENT_START_KEYS = [
    "pre_recruitment_start", "pre_recruitment_start_at", "pre_recruitment_start_date",
    "pre_recruitment_period_start", "pre_recruitment_period_start_at", "pre_recruitment_period_start_date",
    "pre_recruit_start", "pre_recruit_start_at", "pre_recruit_start_date",
    "pre_application_start", "pre_application_start_at", "pre_application_start_date",
    "pre_apply_start", "pre_apply_start_at", "pre_apply_start_date",
    "pre_registration_start", "pre_registration_start_at", "pre_registration_start_date",
    "early_recruitment_start", "early_recruitment_start_at", "early_recruitment_start_date",
    "early_application_start", "early_application_start_at", "early_application_start_date",
    "notice_start", "notice_start_at", "notice_start_date",
    "notification_start", "notification_start_at", "notification_start_date",
    "pre_start", "pre_start_at", "pre_start_date",
]
const PRE_RECRUITMENT_END_KEYS = [
    "pre_recruitment_end", "pre_recruitment_end_at", "pre_recruitment_end_date",
    "pre_recruitment_period_end", "pre_recruitment_period_end_at", "pre_recruitment_period_end_date",
    "pre_recruit_end", "pre_recruit_end_at", "pre_recruit_end_date",
    "pre_application_end", "pre_application_end_at", "pre_application_end_date",
    "pre_apply_end", "pre_apply_end_at", "pre_apply_end_date",
    "pre_registration_end", "pre_registration_end_at", "pre_registration_end_date",
    "early_recruitment_end", "early_recruitment_end_at", "early_recruitment_end_date",
    "early_application_end", "early_application_end_at", "early_application_end_date",
    "notice_end", "notice_end_at", "notice_end_date",
    "notification_end", "notification_end_at", "notification_end_date",
    "pre_end", "pre_end_at", "pre_end_date",
]
function recruitmentPeriodModeOf(config: any): RecruitmentPeriodMode {
    return config?.header?.recruitmentPeriodMode === "pre" ? "pre" : "formal"
}
function recruitmentPeriodOf(program?: any, mode: RecruitmentPeriodMode = "formal") {
    if (!program) return { start: "", end: "" }
    const startKeys = mode === "pre" ? PRE_RECRUITMENT_START_KEYS : FORMAL_RECRUITMENT_START_KEYS
    const endKeys = mode === "pre" ? PRE_RECRUITMENT_END_KEYS : FORMAL_RECRUITMENT_END_KEYS
    return {
        start: firstDateValue(program, startKeys),
        end: firstDateValue(program, endKeys),
    }
}
function getOperationGate(cfg: Cfg) {
    if (cfg.dashboard?.alwaysOpen) return null
    const start = cfg.dashboard?.operationStart || ""
    const end = cfg.dashboard?.operationEnd || ""
    if (!start && !end) return null
    const now = Date.now()
    const startAt = operationTimeMs(start, "start")
    const endAt = operationTimeMs(end, "end")
    if (startAt && now < startAt) {
        return {
            kind: "before" as const,
            title: "아직 모집이 시작되지 않았어요.",
            body: "운영 시작 시간 이후에 신청할 수 있습니다.",
        }
    }
    if (endAt && now > endAt) {
        return {
            kind: "ended" as const,
            title: "모집이 종료되었습니다.",
            body: "운영 기간이 지나 더 이상 신청을 받을 수 없습니다.",
        }
    }
    return null
}

// ─── Main Component ───────────────────────────────────────────────────────
export function CatchForm(props: {
    supabaseUrl?: string
    supabaseAnonKey?: string
    slug?: string
    formId?: string
    configJson?: string
    googleSheetsWebhookUrl?: string
}) {
    const {
        supabaseUrl: propSupabaseUrl = "",
        supabaseAnonKey: propSupabaseAnonKey = "",
        slug: propSlug = "",
        formId: propFormId = "",
        configJson = "",
        googleSheetsWebhookUrl: propGoogleSheetsWebhookUrl = "",
    } = props
    const supabaseUrl = pickConfigValue(propSupabaseUrl, publicEnv.supabaseUrl, runtimeGlobal("CATCHFORM_SUPABASE_URL"))
    const supabaseAnonKey = pickConfigValue(propSupabaseAnonKey, publicEnv.supabaseAnonKey, runtimeGlobal("CATCHFORM_SUPABASE_ANON_KEY"))
    const googleSheetsWebhookUrl = pickConfigValue(propGoogleSheetsWebhookUrl, publicEnv.googleSheetsWebhookUrl, runtimeGlobal("CATCHFORM_GOOGLE_SHEETS_WEBHOOK_URL"))
    const supa = React.useMemo(() => getSB(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey])

    const [cfg, setCfg] = React.useState<Cfg | null>(null)
    const [loadErr, setLoadErr] = React.useState("")
    const [loading, setLoading] = React.useState(true)
    const [loadedFormId, setLoadedFormId] = React.useState(propFormId)

    React.useEffect(() => {
        if (configJson) {
            try {
                setCfg(JSON.parse(configJson))
                setLoadedFormId(propFormId || "")
                setLoading(false)
                return
            } catch {}
        }
        let slug = propSlug
        try {
            const params = new URLSearchParams(window.location.search)
            const urlSlug = params.get("slug")
            if (urlSlug) slug = urlSlug
        } catch {}
        if (!slug) { setLoadErr("폼 슬러그가 지정되지 않았어요."); setLoading(false); return }
        if (!supa) { setLoadErr("Supabase 연결 정보가 없어요. Framer에서는 오른쪽 패널의 Supabase URL과 Anon Key를 입력해주세요."); setLoading(false); return }
        const cacheKey = `catchform_config_${slug}`
        let hasCachedConfig = false
        try {
            const cached = sessionStorage.getItem(cacheKey)
            if (cached) {
                const parsed = JSON.parse(cached)
                if (parsed?.config && Date.now() - Number(parsed.ts || 0) < 5 * 60 * 1000) {
                    hasCachedConfig = true
                    setLoadedFormId(parsed.id || "")
                    setCfg(parsed.config as Cfg)
                    setLoading(false)
                }
            }
        } catch {}
        ;(async () => {
            const { data, error } = await supa.from("form_configs").select("id,config").eq("slug", slug).maybeSingle()
            if (error || !data) {
                if (!hasCachedConfig) {
                    setLoadErr("폼을 불러오지 못했어요.")
                    setLoading(false)
                }
                return
            }
            let nextConfig = data.config as Cfg
            const programId = nextConfig?.header?.programUnlinked ? "" : String(nextConfig?.header?.programId || "")
            if (programId) {
                let program: any = null
                try {
                    const programRes = await supa.from("programs").select("*").eq("id", programId).maybeSingle()
                    program = programRes.data
                } catch {}
                const period = recruitmentPeriodOf(program, recruitmentPeriodModeOf(nextConfig))
                if (period.start || period.end) {
                    nextConfig = {
                        ...nextConfig,
                        dashboard: {
                            ...(nextConfig.dashboard || {}),
                            operationStart: period.start || nextConfig.dashboard?.operationStart || "",
                            operationEnd: period.end || nextConfig.dashboard?.operationEnd || "",
                        },
                    }
                }
            }
            setLoadedFormId(data.id || "")
            setCfg(nextConfig)
            try { sessionStorage.setItem(cacheKey, JSON.stringify({ id: data.id || "", config: nextConfig, ts: Date.now() })) } catch {}
            setLoading(false)
        })()
    }, [supa, propSlug, propFormId, configJson])

    if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, fontFamily: FONT, fontSize: 14, color: "#9EA8C0" }}>불러오는 중...</div>
    if (loadErr) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, fontFamily: FONT, fontSize: 14, color: "#FF4747" }}>{loadErr}</div>
    if (!cfg) return null
    const normalizedCfg = normalizeRuntimeConfig(cfg)
    if (normalizedCfg.dashboard?.isPublished === false) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 240, padding: 24, fontFamily: FONT, fontSize: 14, color: "#9EA8C0", textAlign: "center" }}>아직 공개되지 않은 폼이에요.</div>

    const resolvedSlug = (() => {
        try { const p=new URLSearchParams(window.location.search); return p.get("slug")||propSlug } catch { return propSlug }
    })()
    return <FormRenderer cfg={normalizedCfg} supa={supa} formSlug={resolvedSlug} formId={loadedFormId} supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} googleSheetsWebhookUrl={googleSheetsWebhookUrl} />
}

// ─── Form Renderer ────────────────────────────────────────────────────────
function FormRenderer({ cfg, supa, formSlug, formId, supabaseUrl, supabaseAnonKey, googleSheetsWebhookUrl }: { cfg: Cfg; supa: SupabaseClient | null; formSlug?: string; formId?: string; supabaseUrl?: string; supabaseAnonKey?: string; googleSheetsWebhookUrl?: string }) {
    const isDark = cfg.styles.theme === "dark"
    const FC = isDark ? DARK : LIGHT
    const accentBg = cfg.cta.bg || "#3182F6"
    const fh = cfg.styles.fieldH || 44
    const qg = cfg.styles.qGap || 20
    const lg = cfg.styles.labelGap ?? 8
    const fr = "10px"
    const isKdt = cfg.formType === "kdt" && !!cfg.kdtFields
    const formPages = isKdt
        ? Math.max(3, ...(cfg.kdtFields || []).map(f => f.page || 1))
        : (cfg.form.pages || 1)
    const isMultiPage = formPages > 1

    // State
    const [page, setPage] = React.useState(1)
    const [vals, setVals] = React.useState<Record<string, string>>({})
    const [checked, setChecked] = React.useState<Record<string, string[]>>({})
    const [errors, setErrors] = React.useState<Record<string, string>>({})
    const [consentOk, setConsentOk] = React.useState<boolean[]>([])
    const [consentOpen, setConsentOpen] = React.useState<boolean[]>([])
    const [dropOpen, setDropOpen] = React.useState<Record<string, boolean>>({})
    const [dpOpen, setDpOpen] = React.useState<Record<string, boolean>>({})
    const [dpY, setDpY] = React.useState<Record<string, number>>({})
    const [dpM, setDpM] = React.useState<Record<string, number>>({})
    const [submitting, setSubmitting] = React.useState(false)
    const [showModal, setShowModal] = React.useState(false)
    const [shareCopied, setShareCopied] = React.useState(false)
    const [shareMenuOpen, setShareMenuOpen] = React.useState(false)
    const [dupErr, setDupErr] = React.useState("")
    const [showDupModal, setShowDupModal] = React.useState(false)
    const [fileNames, setFileNames] = React.useState<Record<string, string[]>>({})
    const [fileObjects, setFileObjects] = React.useState<Record<string, File[]>>({})
    const [authUser, setAuthUser] = React.useState<any>(null)
    const [showAuthModal, setShowAuthModal] = React.useState(false)
    const [authEmail, setAuthEmail] = React.useState("")
    const [authPw, setAuthPw] = React.useState("")
    const [authErr, setAuthErr] = React.useState("")
    const [authLoading, setAuthLoading] = React.useState(false)
    const [geoMeta, setGeoMeta] = React.useState<Record<string, string>>({})
    const [geoLoaded, setGeoLoaded] = React.useState(false)
    const trackingSessionRef = React.useRef("")
    const touchedFieldRef = React.useRef<Record<string, boolean>>({})
    const lastTouchedFieldRef = React.useRef<any>(null)
    const startedTrackedRef = React.useRef(false)
    const qrScanTrackedRef = React.useRef(false)
    const draftLoadedRef = React.useRef(false)
    const remoteDraftTimerRef = React.useRef<any>(null)
    const statusEventIdsRef = React.useRef<Record<string, string>>({})
    const [draftLastFieldId, setDraftLastFieldId] = React.useState("")
    const operationGate = React.useMemo(() => getOperationGate(cfg), [cfg.dashboard?.operationStart, cfg.dashboard?.operationEnd, cfg.dashboard?.alwaysOpen])
    const formDisabled = !!operationGate
    const [showOperationModal, setShowOperationModal] = React.useState(!!operationGate)

    const draftKey = React.useMemo(() => {
        const raw = formId || formSlug || cfg.header?.programId || cfg.header?.title || "form"
        const safe = String(raw).trim().replace(/[^A-Za-z0-9가-힣._-]/g, "_").slice(0, 120) || "form"
        return `catchform_draft_v2_${safe}`
    }, [formId, formSlug, cfg.header?.programId, cfg.header?.title])

    React.useEffect(() => {
        if (operationGate) setShowOperationModal(true)
    }, [operationGate?.kind])

    const setVal = (id: string, v: string) => setVals(p => ({ ...p, [id]: v }))
    const setErr = (id: string, msg: string) => setErrors(p => ({ ...p, [id]: msg }))
    const clearErr = (id: string) => setErrors(p => { const n = { ...p }; delete n[id]; return n })

    const persistLocalDraft = React.useCallback((nextPage = page) => {
        if (typeof window === "undefined") return
        try {
            window.localStorage.setItem(draftKey, JSON.stringify({
                vals,
                checked,
                consentOk,
                page: nextPage,
                lastFieldId: draftLastFieldId,
                updatedAt: new Date().toISOString(),
            }))
        } catch {}
    }, [draftKey, vals, checked, consentOk, page, draftLastFieldId])

    const clearDraft = React.useCallback(() => {
        try { window.localStorage.removeItem(draftKey) } catch {}
    }, [draftKey])

    const getTrackingSessionId = () => {
        if (trackingSessionRef.current) return trackingSessionRef.current
        const key = `catchform_session_${formSlug || formId || "draft"}`
        try {
            const prev = window.sessionStorage.getItem(key)
            if (prev) { trackingSessionRef.current = prev; return prev }
            const next = `cf_${Date.now()}_${Math.random().toString(36).slice(2)}`
            window.sessionStorage.setItem(key, next)
            trackingSessionRef.current = next
            return next
        } catch {
            const next = `cf_${Date.now()}_${Math.random().toString(36).slice(2)}`
            trackingSessionRef.current = next
            return next
        }
    }

    const getTrackingMeta = () => {
        if (typeof window === "undefined") return {}
        const params = new URLSearchParams(window.location.search || "")
        const ref = typeof document !== "undefined" ? document.referrer || "" : ""
        const refHost = (() => { try { return ref ? new URL(ref).hostname.replace(/^www\./, "") : "" } catch { return "" } })()
        const explicitSource = params.get("utm_source") || params.get("source") || params.get("ref") || ""
        const sourceRaw = explicitSource || refHost || "direct"
        const sourceMap: Record<string, string> = {
            google: "Google", naver: "Naver", medium: "Medium", twitter: "Twitter", x: "Twitter",
            bing: "Bing", kakao: "KakaoTalk", kakaotalk: "KakaoTalk", facebook: "Facebook",
            instagram: "Instagram", qr: "QR", qrcode: "QR", direct: "출처 미확인"
        }
        const sourceKey = sourceRaw.toLowerCase().replace(/\.(com|co\.kr|net|kr)$/g, "").split(".")[0]
        const locale = navigator.language || ""
        const localeCountry = locale.includes("-") ? locale.split("-").pop() || "" : ""
        const isQr = params.get("cf_qr") === "1" || params.get("utm_medium") === "qrcode" || params.get("utm_source") === "qr"
        const sourceOrigin = isQr ? "qr" : explicitSource ? "url_param" : refHost ? "referrer" : "unknown"
        const sourceDetail = isQr ? (params.get("qr_label") || params.get("utm_campaign") || "QR") : explicitSource ? sourceRaw : refHost ? refHost : "referrer/UTM 없음"
        return {
            utm_source: params.get("utm_source") || "",
            utm_medium: params.get("utm_medium") || "",
            utm_campaign: params.get("utm_campaign") || "",
            source: isQr ? "QR" : (sourceMap[sourceKey] || sourceRaw),
            source_origin: sourceOrigin,
            source_detail: sourceDetail,
            referrer: ref,
            referrer_host: refHost,
            landing_url: window.location.href,
            landing_path: window.location.pathname,
            country: params.get("country") || geoMeta.country || localeCountry || "",
            region: params.get("region") || params.get("province") || params.get("sido") || geoMeta.region || "",
            city: params.get("city") || geoMeta.city || "",
            district: params.get("district") || params.get("gu") || geoMeta.district || "",
            neighborhood: params.get("neighborhood") || params.get("dong") || geoMeta.neighborhood || "",
            geo_label: geoMeta.geo_label || "",
            latitude: geoMeta.latitude || "",
            longitude: geoMeta.longitude || "",
            geo_accuracy: geoMeta.geo_accuracy || "",
            geo_source: geoMeta.geo_source || "",
            geo_permission: geoMeta.geo_permission || "",
            language: locale,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
            platform: navigator.platform || "",
            device_os: detectDeviceOS(),
            user_agent: navigator.userAgent || "",
            cf_qr: params.get("cf_qr") || "",
            cf_qr_redirected: params.get("cf_qr_redirected") || "",
            cf_form_id: params.get("cf_form_id") || params.get("fid") || params.get("f") || "",
            qr_type: params.get("qr_type") || "",
            qr_label: params.get("qr_label") || "",
            qr_target: params.get("qr_target") || "",
        }
    }

    const makeTrackingUuid = () => {
        try {
            if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID()
        } catch {}
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0
            const v = c === "x" ? r : (r & 0x3 | 0x8)
            return v.toString(16)
        })
    }

    const getStatusEventId = (key: string) => {
        if (statusEventIdsRef.current[key]) return statusEventIdsRef.current[key]
        const storageKey = `catchform_status_event_${key}`.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 190)
        try {
            const existing = window.sessionStorage.getItem(storageKey)
            if (existing) {
                statusEventIdsRef.current[key] = existing
                return existing
            }
            const next = makeTrackingUuid()
            window.sessionStorage.setItem(storageKey, next)
            statusEventIdsRef.current[key] = next
            return next
        } catch {
            const next = makeTrackingUuid()
            statusEventIdsRef.current[key] = next
            return next
        }
    }

    const trackEvent = (eventType: string, extra?: { page?: number; field?: any; metadata?: any; keepalive?: boolean }) => {
        const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search || "") : new URLSearchParams()
        const basePayload = {
            form_id: formId || params.get("cf_form_id") || params.get("fid") || params.get("f") || null,
            form_slug: formSlug || "",
            session_id: getTrackingSessionId(),
            event_type: eventType,
            page: extra?.page ?? page,
            field_id: extra?.field?.id || null,
            field_label: extra?.field?.label || null,
            metadata: { ...getTrackingMeta(), ...(extra?.metadata || {}) }
        }
        const statusMode = eventType === "draft_saved" || eventType === "leave"
        const statusKey = statusMode ? [basePayload.form_id || basePayload.form_slug || "form", basePayload.session_id || "session", eventType].join(":") : ""
        const payload = statusMode
            ? {
                ...basePayload,
                id: getStatusEventId(statusKey),
                metadata: {
                    ...basePayload.metadata,
                    event_mode: "session_status",
                    status_event_key: statusKey,
                    status_updated_at: new Date().toISOString(),
                }
            }
            : basePayload
        if (extra?.keepalive && supabaseUrl && supabaseAnonKey) {
            try {
                fetch(`${supabaseUrl.replace(/\/+$/, "")}/rest/v1/form_response_events${statusMode ? "?on_conflict=id" : ""}`, {
                    method: "POST",
                    headers: {
                        apikey: supabaseAnonKey,
                        authorization: `Bearer ${supabaseAnonKey}`,
                        "content-type": "application/json",
                        prefer: statusMode ? "resolution=merge-duplicates,return=minimal" : "return=minimal"
                    },
                    body: JSON.stringify(payload),
                    keepalive: true
                }).catch(() => {})
            } catch {}
            return
        }
        if (!supa) return
        if (statusMode) {
            supa.from("form_response_events").upsert(payload as any, { onConflict: "id" }).then(({ error }) => {
                if (error) supa.from("form_response_events").insert(basePayload).then(() => {})
            })
            return
        }
        supa.from("form_response_events").insert(payload).then(() => {})
    }

    const getShareUrl = () => {
        if (typeof window === "undefined") return ""
        return window.location.href
    }
    const getShareText = () => cfg.header?.title || "신청 폼"
    const copyShareUrl = async (closeMenu = true) => {
        const url = getShareUrl()
        if (!url) return
        try {
            await navigator.clipboard.writeText(url)
            setShareCopied(true)
            window.setTimeout(() => setShareCopied(false), 1800)
        } catch {}
        if (closeMenu) setShareMenuOpen(false)
        trackEvent("share", { metadata: { channel: "링크 복사", href: url } })
    }
    const shareKakao = async () => {
        const url = getShareUrl()
        if (!url) return
        const title = getShareText()
        const openKakaoDeepLink = async () => {
            try { await navigator.clipboard?.writeText(url) } catch {}
            window.location.href = `kakaotalk://sendurl?msg=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
        }
        try {
            const kakao = (window as any).Kakao
            if (kakao?.Share?.sendDefault) {
                kakao.Share.sendDefault({
                    objectType: "feed",
                    content: {
                        title,
                        description: "함께 확인해보세요.",
                        imageUrl: cfg.header?.imageUrl || "https://dummyimage.com/600x315/f2f4f6/333333&text=CatchForm",
                        link: { mobileWebUrl: url, webUrl: url }
                    },
                    buttons: [{ title: "폼 열기", link: { mobileWebUrl: url, webUrl: url } }]
                })
            } else {
                await openKakaoDeepLink()
            }
        } catch {
            await openKakaoDeepLink()
        }
        setShareMenuOpen(false)
        trackEvent("share", { metadata: { channel: "카카오톡", href: url } })
    }
    const shareInstagramStory = async () => {
        const url = getShareUrl()
        if (!url) return
        try { await navigator.clipboard?.writeText(`${getShareText()}\n${url}`) } catch {}
        try {
            window.location.href = `instagram://story-camera?text=${encodeURIComponent(`${getShareText()}\n${url}`)}`
            window.setTimeout(() => window.open("https://www.instagram.com/create/story/", "_blank", "noopener,noreferrer"), 700)
        } catch {}
        setShareMenuOpen(false)
        trackEvent("share", { metadata: { channel: "Instagram Story", href: url } })
    }
    const shareThreads = () => {
        const url = getShareUrl()
        if (!url) return
        const text = encodeURIComponent(`${getShareText()}\n${url}`)
        window.open(`https://www.threads.net/intent/post?text=${text}`, "_blank", "noopener,noreferrer")
        setShareMenuOpen(false)
        trackEvent("share", { metadata: { channel: "Threads", href: url } })
    }
    const shareToX = () => {
        const url = getShareUrl()
        if (!url) return
        const text = encodeURIComponent(getShareText())
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer")
        setShareMenuOpen(false)
        trackEvent("share", { metadata: { channel: "Twitter", href: url } })
    }

    const shareButtonStyle: React.CSSProperties = { width: "clamp(42px, 10vw, 58px)", aspectRatio: "1 / 1", borderRadius: "50%", border: "none", background: "#F2F4F7", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontFamily: FONT, fontWeight:600, fontSize: 13, flexShrink: 0 }
    const shareMenuButtonStyle: React.CSSProperties = { width: "100%", height: 38, border: "none", background: "transparent", color: FC.t1, display: "flex", alignItems: "center", gap: 10, padding: "0 10px", borderRadius: 10, cursor: "pointer", fontFamily: FONT, fontSize: 13, fontWeight:600, textAlign: "left" as const }
    const ShareIcon = ({type,size=18}:{type:"kakao"|"instagram"|"threads"|"x"|"link";size?:number}) => {
        if(type==="kakao")return <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path d="M24 9C13.5 9 5.5 15.2 5.5 23c0 5 3.5 9.4 8.8 11.9l-1.7 7 7.6-4.4c1.2.2 2.5.3 3.8.3 10.5 0 18.5-6.2 18.5-14.8S34.5 9 24 9z" fill="currentColor"/>
            <text x="24" y="27.5" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="11.5" fontWeight="800" fill="#fff" letterSpacing="-0.7">TALK</text>
        </svg>
        if(type==="instagram")return <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <rect x="9" y="9" width="30" height="30" rx="9" fill="currentColor"/>
            <circle cx="24" cy="24" r="7.1" stroke="#fff" strokeWidth="4.2"/>
            <circle cx="32.3" cy="15.9" r="2.8" fill="#fff"/>
        </svg>
        if(type==="threads")return <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path d="M32.5 21.4c-.9-7.1-6-11.5-13.4-11.5C10.7 9.9 5 15.8 5 23.7 5 31.9 11 38 20.5 38c7.8 0 13-4 13-10.2 0-5.4-4.2-8.7-11.2-8.7-5.6 0-9.1 2.5-9.1 6.1 0 3.1 2.5 5.1 6.1 5.1 5.1 0 7.9-3.3 7.9-8.4" stroke="currentColor" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M30.6 12.4c6.7 2.1 10.8 7.8 11 15.3" stroke="currentColor" strokeWidth="4.6" strokeLinecap="round"/>
        </svg>
        if(type==="link")return <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path d="M19.6 28.4a8 8 0 0 0 11.3 0l6.2-6.2A8 8 0 0 0 25.8 10.9l-3.4 3.4M28.4 19.6a8 8 0 0 0-11.3 0l-6.2 6.2a8 8 0 0 0 11.3 11.3l3.4-3.4" stroke="currentColor" strokeWidth="5.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        return <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path d="M8 8l32 32M40 8 8 40" stroke="currentColor" strokeWidth="5.8" strokeLinecap="square"/>
        </svg>
    }

    const trackFieldTouch = (field: any) => {
        if (!field?.id) return
        lastTouchedFieldRef.current = field
        setDraftLastFieldId(field.id)
        if (touchedFieldRef.current[field.id]) return
        touchedFieldRef.current[field.id] = true
        trackEvent("field_touch", { field })
    }

    const getPageLabel = (p: number) => {
        if (isKdt) {
            const def = ["기본 정보", "상세 정보", "자격 요건 및 동의"]
            return (cfg.form.pageLabels || [])[p - 1] || def[p - 1] || `섹션${p}`
        }
        return (cfg.form.pageLabels || [])[p - 1] || `섹션${p}`
    }

    const currentFields: FormField[] = isKdt
        ? (cfg.kdtFields || []).filter(f => (f as any).page === page) as any
        : isMultiPage
            ? cfg.form.fields.filter(f => (f.page || 1) === page)
            : cfg.form.fields

    const isLastPage = page === formPages

    React.useEffect(() => {
        draftLoadedRef.current = false
        if (typeof window === "undefined") {
            draftLoadedRef.current = true
            return
        }
        try {
            const raw = window.localStorage.getItem(draftKey)
            if (raw) {
                const draft = JSON.parse(raw)
                if (draft?.vals && typeof draft.vals === "object") setVals(draft.vals)
                if (draft?.checked && typeof draft.checked === "object") setChecked(draft.checked)
                if (Array.isArray(draft?.consentOk)) setConsentOk(draft.consentOk)
                if (typeof draft?.lastFieldId === "string") setDraftLastFieldId(draft.lastFieldId)
                const savedPage = Number(draft?.page)
                if (Number.isFinite(savedPage) && savedPage >= 1 && savedPage <= formPages) setPage(savedPage)
            }
        } catch {}
        draftLoadedRef.current = true
    }, [draftKey, formPages])

    React.useEffect(() => {
        if (!draftLoadedRef.current || typeof window === "undefined") return
        const timer = window.setTimeout(() => {
            persistLocalDraft()
        }, 150)
        return () => window.clearTimeout(timer)
    }, [persistLocalDraft])

    React.useEffect(() => {
        if (typeof window === "undefined") return
        const persistBeforeExit = () => persistLocalDraft()
        const persistWhenHidden = () => {
            if (document.visibilityState === "hidden") persistLocalDraft()
        }
        window.addEventListener("beforeunload", persistBeforeExit)
        document.addEventListener("visibilitychange", persistWhenHidden)
        return () => {
            window.removeEventListener("beforeunload", persistBeforeExit)
            document.removeEventListener("visibilitychange", persistWhenHidden)
        }
    }, [persistLocalDraft])

    const isQrLanding = () => {
        if (typeof window === "undefined") return false
        const params = new URLSearchParams(window.location.search || "")
        return params.get("cf_qr") === "1" || params.get("utm_medium") === "qrcode" || params.get("utm_source") === "qr" || params.get("geo") === "1"
    }

    React.useEffect(() => {
        let alive = true
        const getGeo = async (query = "") => {
            const res = await fetch(`/api/geo${query}`, { cache: "no-store" })
            return res.ok ? res.json() : null
        }
        const finish = () => {
            if (alive) setGeoLoaded(true)
        }
        const loadGeo = async () => {
            let base: Record<string, string> = {}
            try {
                base = await getGeo() || {}
                if (alive && base) setGeoMeta(prev => ({ ...prev, ...base }))
            } catch {}

            if (typeof navigator === "undefined" || !navigator.geolocation) {
                if (alive) setGeoMeta(prev => ({ ...prev, geo_permission: "unsupported" }))
                finish()
                return
            }

            const shouldAskPrecise = isQrLanding()
            let permissionState = ""
            try {
                const permissions = (navigator as any).permissions
                if (permissions?.query) {
                    const result = await permissions.query({ name: "geolocation" as PermissionName })
                    permissionState = result?.state || ""
                }
            } catch {}

            if (permissionState === "denied") {
                if (alive) setGeoMeta(prev => ({ ...prev, geo_permission: "denied" }))
                finish()
                return
            }
            if (!shouldAskPrecise && permissionState !== "granted") {
                if (alive) setGeoMeta(prev => ({ ...prev, geo_permission: permissionState || "not_requested" }))
                finish()
                return
            }

            await new Promise<void>((resolve) => {
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        try {
                            const lat = pos.coords.latitude
                            const lon = pos.coords.longitude
                            const precise = await getGeo(`?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`)
                            if (alive) {
                                setGeoMeta(prev => ({
                                    ...prev,
                                    ...base,
                                    ...(precise || {}),
                                    latitude: String(lat),
                                    longitude: String(lon),
                                    geo_accuracy: String(Math.round(pos.coords.accuracy || 0)),
                                    geo_permission: "granted",
                                }))
                            }
                        } catch {
                            if (alive) {
                                setGeoMeta(prev => ({
                                    ...prev,
                                    latitude: String(pos.coords.latitude),
                                    longitude: String(pos.coords.longitude),
                                    geo_accuracy: String(Math.round(pos.coords.accuracy || 0)),
                                    geo_permission: "granted",
                                    geo_source: prev.geo_source || "browser_geolocation_unresolved",
                                }))
                            }
                        }
                        resolve()
                    },
                    (err) => {
                        if (alive) setGeoMeta(prev => ({ ...prev, geo_permission: err?.code === 1 ? "denied" : "unavailable" }))
                        resolve()
                    },
                    { enableHighAccuracy: true, timeout: 4200, maximumAge: 5 * 60 * 1000 },
                )
            })
            finish()
        }
        loadGeo().catch(finish)
        return () => { alive = false }
    }, [])

    React.useEffect(() => {
        if (!geoLoaded) return
        if (typeof window !== "undefined" && !qrScanTrackedRef.current) {
            const params = new URLSearchParams(window.location.search || "")
            const isQr = params.get("cf_qr") === "1" || params.get("utm_medium") === "qrcode" || params.get("utm_source") === "qr"
            const alreadyLoggedByRedirect = params.get("cf_qr_redirected") === "1"
            if (isQr && !alreadyLoggedByRedirect) {
                qrScanTrackedRef.current = true
                trackEvent("qr_scan", { page: 1, metadata: { qr_logged_on: "form_page" } })
            }
        }
        if (startedTrackedRef.current) return
        startedTrackedRef.current = true
        trackEvent("started", { page: 1, metadata: { formType: cfg.formType || "" } })
    }, [geoLoaded, geoMeta.country, geoMeta.region, geoMeta.city, geoMeta.district, geoMeta.neighborhood, geoMeta.geo_label])

    React.useEffect(() => {
        lastTouchedFieldRef.current = null
        trackEvent("page_view", { page })
        try { window.scrollTo({ top: 0, behavior: "smooth" }) } catch {}
    }, [page])

    React.useEffect(() => {
        if (typeof document === "undefined") return
        const onClick = (e: MouseEvent) => {
            const el = e.target as HTMLElement | null
            const a = el?.closest?.("a[href]") as HTMLAnchorElement | null
            if (!a) return
            const text = (a.textContent || "").trim().slice(0, 80)
            trackEvent("link_click", { metadata: { href: a.href, text } })
            const shareHit = `${a.href} ${text}`.toLowerCase()
            if (/share|공유|kakao|facebook|twitter|x\.com|linkedin/.test(shareHit)) {
                const channel = /kakao/.test(shareHit) ? "카카오톡" : /facebook/.test(shareHit) ? "페이스북" : /twitter|x\.com/.test(shareHit) ? "트위터" : /linkedin/.test(shareHit) ? "링크드인" : "링크"
                trackEvent("share", { metadata: { channel, href: a.href, text } })
            }
        }
        document.addEventListener("click", onClick, true)
        return () => document.removeEventListener("click", onClick, true)
    }, [page, formId, formSlug])

    React.useEffect(() => {
        if (typeof document === "undefined") return
        const onHidden = () => {
            if (document.visibilityState === "hidden") trackEvent("leave", { page, field: lastTouchedFieldRef.current, keepalive: true })
        }
        document.addEventListener("visibilitychange", onHidden)
        return () => document.removeEventListener("visibilitychange", onHidden)
    }, [page, formId, formSlug])

    // Check if all required fields on current page are filled
    const isPageComplete = React.useMemo(() => {
        for (const field of currentFields) {
            const f = field as FormField
            if (!f.required) continue
            if (f.type === "info" || (f.type as any) === "section_desc") continue
            if (f.type === "checkbox") {
                if (!(checked[f.id] || []).length) return false
            } else if (f.type === "file") {
                const fs:any = fileObjects[f.id] || []
                if (!(Array.isArray(fs) ? fs : [fs]).filter(Boolean).length) return false
            } else {
                if (!(vals[f.id] || "").trim()) return false
            }
        }
        if (isLastPage) {
            const enabledConsents = cfg.consents.filter(c => c.enabled && c.required)
            for (let i = 0; i < enabledConsents.length; i++) {
                if (!consentOk[i]) return false
            }
        }
        return true
    }, [currentFields, vals, checked, consentOk, isLastPage, fileObjects])

    const inp: React.CSSProperties = {
        width: "100%", height: fh, background: FC.fieldBg, border: `1px solid ${FC.fieldBorder}`,
        borderRadius: fr, color: FC.t1, fontFamily: FONT, fontSize: 13,
        padding: "0 13px", outline: "none", boxSizing: "border-box", transition: "border .15s"
    }

    const validateField = (field: FormField, val: string): string => {
        if (field.type === "checkbox") return ""
        if (field.type === "file") return ""
        if (field.required && !val.trim()) return "필수 입력 항목이에요."
        if (field.type === "email" && val && !isValidEmail(val)) return "올바른 이메일 형식을 입력해주세요."
        if (field.type === "text" && field.id.toLowerCase().includes("phone") && val && !isValidPhone(val)) return "올바른 휴대폰 번호를 입력해주세요."
        return ""
    }

    const getFieldOpts = (field: any): Opt[] => {
        const rawOpts = (field.opts && field.opts.length) ? field.opts : (field.options || [])
        return rawOpts.map((o: any) => {
            const label = String(o?.label ?? o?.value ?? o)
            const value = String(o?.value ?? o?.label ?? o)
            const key = value.trim().toLowerCase()
            const isEtc = !!o?.isEtc || label.trim() === "기타" || value.trim() === "기타" || key === "etc" || key === "other"
            return { ...(typeof o === "object" ? o : {}), label, value, isEtc }
        })
    }

    const getFieldAnswer = (field: any): any => {
        const fid = field.id as string
        const fieldOpts = getFieldOpts(field)
        const etcValue = (vals[fid + "_etc"] || "").trim()

        if (field.type === "checkbox") {
            const selected = checked[fid] || []
            return selected.map(v => {
                const opt = fieldOpts.find(o => o.value === v)
                if (opt?.isEtc && etcValue) return `${opt.label}: ${etcValue}`
                return opt?.label || v
            })
        }

        const answer = vals[fid] || ""
        const selectedOpt = fieldOpts.find(o => o.value === answer)
        if (selectedOpt?.isEtc && etcValue) return `${selectedOpt.label}: ${etcValue}`
        return selectedOpt?.label || answer
    }

    const getDraftAnswers = () => {
        const allFields: any[] = isKdt ? (cfg.kdtFields || []) as any[] : cfg.form.fields as any[]
        return allFields
            .filter(field => field.type !== "info" && field.type !== "section_desc")
            .map(field => {
                const answer = field.type === "file" ? (fileNames[field.id] || []) : getFieldAnswer(field)
                return { question: field.label || field.id, answer, answerKey: field.id }
            })
            .filter(item => Array.isArray(item.answer) ? item.answer.length > 0 : String(item.answer || "").trim().length > 0)
    }

    const saveRemoteDraft = (keepalive = false, nextPage = page) => {
        if (!draftLoadedRef.current) return
        const draftAnswers = getDraftAnswers()
        if (!draftAnswers.length && !consentOk.some(Boolean)) return
        trackEvent("draft_saved", {
            page: nextPage,
            field: lastTouchedFieldRef.current,
            keepalive,
            metadata: {
                draft_status: "in_progress",
                draft_answers: draftAnswers,
                draft_consents: consentOk,
                draft_last_field_id: draftLastFieldId,
                draft_updated_at: new Date().toISOString(),
            }
        })
    }

    React.useEffect(() => {
        if (!draftLoadedRef.current) return
        if (remoteDraftTimerRef.current) window.clearTimeout(remoteDraftTimerRef.current)
        remoteDraftTimerRef.current = window.setTimeout(() => saveRemoteDraft(false), 900)
        return () => {
            if (remoteDraftTimerRef.current) window.clearTimeout(remoteDraftTimerRef.current)
        }
    }, [vals, checked, consentOk, fileNames, page, draftLastFieldId])

    React.useEffect(() => {
        if (typeof document === "undefined") return
        const saveWhenHidden = () => {
            if (document.visibilityState === "hidden") saveRemoteDraft(true)
        }
        document.addEventListener("visibilitychange", saveWhenHidden)
        return () => document.removeEventListener("visibilitychange", saveWhenHidden)
    }, [vals, checked, consentOk, fileNames, page, draftLastFieldId])

    const validateCurrentPage = (): boolean => {
        const newErrors: Record<string, string> = {}
        let hasErr = false
        for (const field of currentFields) {
            const f = field as FormField
            if (!f.required) continue
            if (f.type === "info" || (f.type as any) === "section_desc") continue
            const val = vals[f.id] || ""
            if (f.type === "checkbox") {
                if (!(checked[f.id] || []).length) { newErrors[f.id] = "필수 입력 항목이에요."; hasErr = true }
            } else if (!val.trim()) {
                newErrors[f.id] = "필수 입력 항목이에요."; hasErr = true
            }
        }
        setErrors(newErrors)
        return !hasErr
    }

    const sheetAnswer = (answer: any) => {
        if (Array.isArray(answer)) return answer.map(v => typeof v === "object" ? (v.name || v.url || JSON.stringify(v)) : String(v)).join(" / ")
        if (answer && typeof answer === "object") return answer.name || answer.url || JSON.stringify(answer)
        return answer ?? ""
    }
    const sheetDisplayAnswer = (answer: any) => {
        const value = sheetAnswer(answer)
        return value === undefined || value === null || value === "" ? "없음" : String(value)
    }
    const formatSheetDateTime = (date = new Date()) => [
        date.toLocaleDateString("sv-SE"),
        date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false })
    ]
    const getSheetResponseFields = () => {
        const raw: any[] = isKdt ? (cfg.kdtFields || []) as any[] : cfg.form.fields as any[]
        return raw.filter(field => field.type !== "info" && field.type !== "section_desc")
    }
    const updateGoogleSheetsSyncStatus = async (formConfigId: string | null, status: "sent"|"error", message: string, patch: Record<string, any> = {}) => {
        if (!supa || !formConfigId) return
        try {
            const { data } = await supa.from("form_configs").select("config").eq("id", formConfigId).single()
            const baseCfg = (data as any)?.config || cfg
            const nextConfig = {
                ...baseCfg,
                integrations: {
                    ...(baseCfg.integrations || {}),
                    googleSheets: {
                        ...(baseCfg.integrations?.googleSheets || {}),
                        ...patch,
                        lastSyncStatus: status,
                        lastSyncAt: new Date().toISOString(),
                        lastSyncMessage: message
                    }
                }
            }
            await supa.from("form_configs").update({ config: nextConfig }).eq("id", formConfigId)
        } catch {}
    }

    const sendGoogleSheetsIntegration = async (payload: Record<string, any>, formData: Array<{question: string; answer: any; answerKey: string}>, formConfigId: string | null) => {
        const gs = cfg.integrations?.googleSheets
        const webhookUrl = String(gs?.webhookUrl || googleSheetsWebhookUrl || publicEnv.googleSheetsWebhookUrl || "").trim()
        if (!gs?.enabled || !webhookUrl) return
        const answerRow = formData.reduce((acc: Record<string, any>, item) => {
            acc[item.question || item.answerKey] = sheetAnswer(item.answer)
            if (item.answerKey) acc[item.answerKey] = sheetAnswer(item.answer)
            return acc
        }, {})
        const [date, time] = formatSheetDateTime()
        const responseFields = getSheetResponseFields()
        const columns = ["날짜", "시간", "이름", "전화번호", "이메일", ...responseFields.map(field => field.label || field.id)]
        const row = {
            "날짜": date,
            "시간": time,
            "이름": payload.name || "",
            "전화번호": payload.phone || "",
            "이메일": payload.email || "",
            ...responseFields.reduce((acc: Record<string, any>, field: any) => {
                acc[field.label || field.id] = sheetDisplayAnswer(answerRow[field.id] ?? answerRow[field.label])
                return acc
            }, {})
        }
        const body = {
            integration: "google_sheets",
            action: "append_response",
            schema: "analytics_export_v1",
            mode: gs.mode || "existing",
            accountEmail: gs.accountEmail || "",
            sheetUrl: gs.sheetUrl || "",
            sheetName: gs.sheetName || cfg.header?.title || "CatchForm Responses",
            formId: formConfigId || formId || "",
            formSlug: formSlug || "",
            formTitle: cfg.header?.title || "",
            submittedAt: new Date().toISOString(),
            columns,
            row,
            answers: formData.map(item => ({ ...item, answer: sheetAnswer(item.answer) })),
        }
        try {
            const result: any = await postAppsScriptPayload(webhookUrl, body)
            const returnedSheetUrl = String(result?.spreadsheetUrl || "").trim()
            await updateGoogleSheetsSyncStatus(
                formConfigId,
                "sent",
                "최근 제출 응답을 Apps Script Web App URL로 전송했어요.",
                {
                    webhookUrl,
                    ...(returnedSheetUrl ? { sheetUrl: returnedSheetUrl } : {}),
                }
            )
            trackEvent("sheet_sync", { metadata: { provider: "google_sheets", mode: gs.mode || "existing", status: "sent" } })
        } catch (err) {
            const message = (err as any)?.message || "Google Sheets 전송 요청에 실패했어요."
            await updateGoogleSheetsSyncStatus(formConfigId, "error", message)
            trackEvent("sheet_sync_failed", { metadata: { provider: "google_sheets", message } })
        }
    }

    const handleSubmit = async () => {
        if (operationGate) {
            setShowOperationModal(true)
            return
        }
        // Validate
        let hasErr = false
        const newErrors: Record<string, string> = {}
        for (const field of currentFields) {
            if (field.type === "info" || field.type === "section_desc" as any) continue
            const val = vals[field.id] || ""
            const chk = checked[field.id] || []
            const fs:any = fileObjects[field.id] || []
            const hasFile = field.type === "file" && !!(Array.isArray(fs) ? fs : [fs]).filter(Boolean).length
            if (field.required && !val && chk.length === 0 && !hasFile) {
                newErrors[field.id] = "필수 입력 항목이에요."
                hasErr = true
            } else {
                const err = validateField(field as any, val)
                if (err) { newErrors[field.id] = err; hasErr = true }
            }
        }
        setErrors(newErrors)
        if (hasErr) return

        // Check consents
        const enabledConsents = cfg.consents.filter(c => c.enabled)
        for (let i = 0; i < enabledConsents.length; i++) {
            if (enabledConsents[i].required && !consentOk[i]) {
                setErrors(p => ({ ...p, [`consent_${i}`]: "필수 동의 항목이에요." }))
                return
            }
        }

        setSubmitting(true)
        setDupErr("")
        trackEvent("submit_attempt", { page })

        try {
            if (!supa) { setDupErr("서버 연결 오류입니다."); setSubmitting(false); return }

            // Determine table
            const isCompanyForm = isCompanyApplicationConfig(cfg)
            const tableName = isCompanyForm ? "company_applications" : "applications"

            // Resolve form_configs.id from slug before uploads
            let formConfigId: string | null = formId || null
            if (!formConfigId && formSlug) {
                const { data: fcRow } = await supa.from("form_configs").select("id").eq("slug", formSlug).single()
                if (fcRow) formConfigId = fcRow.id
            }

            const uploadFieldFile = async (field: any) => {
                const rawFiles:any = fileObjects[field.id] || []
                const files:File[] = Array.isArray(rawFiles) ? rawFiles : rawFiles ? [rawFiles] : []
                if (!files.length) return []
                if (files.length > FILE_MAX_COUNT) throw new Error(`파일은 최대 ${FILE_MAX_COUNT}개까지 업로드할 수 있어요.`)
                const tooLarge = files.find(file => file.size > FILE_MAX_SIZE)
                if (tooLarge) throw new Error(`${tooLarge.name} 파일이 ${FILE_MAX_SIZE_MB}MB를 초과했어요.`)
                const safeKeySegment = (v: any, fallback = "file") => {
                    const raw = String(v || "").normalize("NFKD")
                    const ascii = raw.replace(/[^\x00-\x7F]/g, "").replace(/[^A-Za-z0-9._-]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "")
                    return ascii || fallback
                }
                const getExt = (name: string) => {
                    const m = String(name || "").match(/\.([A-Za-z0-9]{1,12})$/)
                    return m ? "." + m[1].toLowerCase() : ""
                }
                const base = safeKeySegment(formConfigId || formSlug || "draft", "draft")
                const sessionKey = safeKeySegment(getTrackingSessionId(), `session_${Date.now()}`)
                const uploaded:any[] = []
                for (const [idx, file] of files.entries()) {
                    const ext = getExt(file.name)
                    const stem = safeKeySegment(file.name.replace(/\.[^.]+$/, ""), `upload_${idx + 1}`)
                    const safeName = `${stem.slice(0, 80)}${ext}`
                    const path = `${base}/${sessionKey}/${Date.now()}_${safeKeySegment(field.id, "field")}_${idx + 1}_${safeName}`
                    const { error: uploadErr } = await supa.storage
                        .from("form-uploads")
                        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type || undefined })
                    if (uploadErr) throw new Error(`파일 업로드 실패: ${file.name} (${uploadErr.message})`)
                    const { data: pub } = supa.storage.from("form-uploads").getPublicUrl(path)
                    uploaded.push({
                        name: file.name,
                        url: pub?.publicUrl || "",
                        path,
                        bucket: "form-uploads",
                        size: file.size,
                        type: file.type || "application/octet-stream"
                    })
                }
                return uploaded
            }

            // User-ID based dup check — only when login is required
            let currentUserId = ""
            if (cfg.auth?.enabled) {
                const { data: sessionData2 } = await supa.auth.getUser()
                currentUserId = sessionData2?.user?.id || authUser?.id || ""
                if (currentUserId && formConfigId) {
                    const { data: dup } = await supa.from(tableName).select("id")
                        .eq("user_id", currentUserId)
                        .eq("form_id", formConfigId)
                        .limit(1)
                    if (dup && dup.length > 0) {
                        setDupErr(cfg.form.dupText || "이미 신청하셨어요.")
                        setShowDupModal(true)
                        setSubmitting(false)
                        return
                    }
                }
            }

            // Direct columns for applications table
            const APP_DIRECT = ["name", "phone", "email"]
            // Extra direct cols only for company_applications
            const COMPANY_EXTRA_DIRECT = ["manager_name", "privacy_consent"]
            // referral field IDs that map to referral_source column
            const REFERRAL_IDS = ["referral", "referral_source", "referral_route"]

            // Build payload
            const payload: Record<string, any> = {}
            const form_data: Array<{question: string; answer: any; answerKey: string}> = []

            const allFields = isKdt ? (cfg.kdtFields || []) as any[] : cfg.form.fields

            for (const field of allFields) {
                if (field.type === "info" || (field.type as any) === "section_desc") continue
                const fid = field.id as string
                const label = field.label as string
                const answer: any = field.type === "file" ? await uploadFieldFile(field) : getFieldAnswer(field)

                const hasValue = Array.isArray(answer) ? answer.length > 0 : answer !== ""

                // name, phone, email → direct column
                if (APP_DIRECT.includes(fid)) {
                    payload[fid] = answer
                }
                // referral → referral_source column
                if (REFERRAL_IDS.includes(fid)) {
                    payload.referral_source = answer
                }
                // company-only direct cols
                if (isCompanyForm && COMPANY_EXTRA_DIRECT.includes(fid)) {
                    payload[fid] = answer
                }

                // All fields go into form_data (except company-only direct cols)
                const skipFromFormData = isCompanyForm && COMPANY_EXTRA_DIRECT.includes(fid)
                if (!skipFromFormData && hasValue) {
                    form_data.push({ question: label, answer, answerKey: fid })
                }
            }

            // Add consent answers to form_data, route privacy_consent to column
            const PRIVACY_CONSENT_KEY = "privacy_consent"
            const MARKETING_KEYS = ["marketing_consent", "마케팅 정보 수신 동의", "마케팅 정보 수신"]
            let marketingAgreed = false
            const enabledConsents2 = cfg.consents.filter(c => c.enabled)
            enabledConsents2.forEach((cs, i) => {
                const isPrivacy = (cs as any).consentType === "privacy_consent"
                    || cs.title === "개인정보 수집 및 이용동의"
                const isMarketing = (cs as any).consentType === "marketing_consent"
                    || MARKETING_KEYS.some(k => (cs.title || "").includes(k))
                const answerKey = (cs as any).consentType || (isPrivacy ? "privacy_consent" : isMarketing ? "marketing_consent" : `consent_${i}`)
                // Always add to form_data
                form_data.push({
                    question: cs.title || cs.checkLabel,
                    answer: consentOk[i] ? "동의" : "미동의",
                    answerKey
                })
                // Only privacy_consent goes to dedicated boolean column
                if (isPrivacy) payload[PRIVACY_CONSENT_KEY] = consentOk[i] === true
                // Track marketing consent
                if (isMarketing && consentOk[i]) marketingAgreed = true
            })

            if (form_data.length > 0) payload.form_data = form_data

            // Meta fields
            if (cfg.header?.programId) payload.program_id = cfg.header.programId
            if (cfg.brand) payload.brand = dbBrandValue(cfg.brand)
            // user_id from logged-in user only when auth is enabled
            // application_type: auto for alert, configurable for the rest
            if (cfg.formType === "alert") payload.application_type = "pre"
            else if (cfg.header?.applicationType) payload.application_type = cfg.header.applicationType

            // Phone value
            const phoneVal = (payload.phone || vals["phone"] || vals["contact_phone"] || "").replace(/-/g, "")
            if (!payload.phone && phoneVal) payload.phone = phoneVal

            if (formConfigId) payload.form_id = formConfigId

            if (cfg.auth?.enabled && currentUserId) {
                payload.user_id = currentUserId
            }

            const { error: insertErr } = await supa.from(tableName).insert(payload)
            if (insertErr) {
                setDupErr("제출 중 오류가 발생했어요. (" + insertErr.message + ")")
                setSubmitting(false)
                return
            }

            trackEvent("completed", { page: formPages })
            clearDraft()
            setShareCopied(false)
            setShowModal(true)

            void (async () => {
                await sendGoogleSheetsIntegration(payload, form_data, formConfigId)

                // Update sms_consent in users table if marketing was agreed
                if (cfg.auth?.enabled && marketingAgreed) {
                    const { data: sessionData } = await supa.auth.getUser()
                    const uid = sessionData?.user?.id || authUser?.id
                    if (uid) {
                        const { data: userRow } = await supa.from("users").select("metadata").eq("id", uid).single()
                        const currentMeta = (userRow as any)?.metadata || {}
                        await supa.from("users").update({
                            metadata: { ...currentMeta, sms_consent: true }
                        }).eq("id", uid)
                    }
                }
            })().catch(() => {})
        } catch (submitErr) {
            const msg = (submitErr as any)?.message || "알 수 없는 오류가 발생했어요."
            setDupErr("제출 중 오류가 발생했어요. (" + msg + ")")
        }
        setSubmitting(false)
    }

    const handleAuthLogin = async () => {
        if (!supa || !authEmail.trim() || !authPw) { setAuthErr("이메일과 비밀번호를 입력해주세요."); return }
        setAuthLoading(true); setAuthErr("")
        const { data, error } = await supa.auth.signInWithPassword({ email: authLoginEmail(authEmail, cfg.brand), password: authPw })
        setAuthLoading(false)
        if (error) { setAuthErr("이메일 또는 비밀번호가 올바르지 않아요."); return }
        setAuthUser(data.user)
        setShowAuthModal(false)
    }

    const renderField = (field: FormField | KdtField, i: number) => {
        const f = field as FormField
        if ((f.type as any) === "section_desc") {
            return <div key={f.id} style={{ padding: "14px 16px", borderRadius: fr, background: FC.fieldBg, border: `1px solid ${FC.fieldBorder}`, marginBottom: qg }}>
                <div style={{ fontSize: 14, fontWeight:600, color: FC.t1, marginBottom: (f as any).desc ? 6 : 0 }}>{f.label}</div>
                {(f as any).desc && <div style={{ fontSize: 12.5, color: FC.t3, lineHeight: 1.7, whiteSpace: "pre-line" }}>{(f as any).desc}</div>}
            </div>
        }

        const val = vals[f.id] || ""
        const fieldErr = errors[f.id]

        // Helpers
        const rawH: any[] = (f.helpers && f.helpers.length) ? f.helpers : (f.helper ? [{ text: f.helper, callout: false }] : [])
        const helpers: HelperItem[] = rawH.map(h => typeof h === "string" ? { text: h, callout: false } : h).filter(h => h.text?.trim())

        const opts: Opt[] = getFieldOpts(f)
        const cols = f.cols || 1

        return <div key={f.id} style={{ marginBottom: qg }}>
            {f.type !== "info" && <div style={{ fontSize: 13.5, fontWeight: 600, color: FC.t1, marginBottom: lg, lineHeight: 1.3, whiteSpace: "pre-line" }}>
                {f.label}{f.required && <span style={{ color: accentBg, marginLeft: 3 }}>*</span>}
            </div>}
            {helpers.map((h, hi) => h.callout
                ? <div key={hi} style={{ display: "flex", gap: 8, padding: "9px 12px", borderRadius: fr, background: accentBg + "0d", border: `1px solid ${accentBg}33`, marginBottom: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="8" cy="8" r="6" stroke={accentBg} strokeWidth="1.4" /><path d="M8 7v4M8 5.5v.5" stroke={accentBg} strokeWidth="1.4" strokeLinecap="round" /></svg>
                    <div style={{ fontSize: 12, color: accentBg, lineHeight: 1.6, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: mdToHtml(h.text) }} />
                </div>
                : <div key={hi} style={{ fontSize: 12, color: FC.t3, marginBottom: 4, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: mdToHtml(h.text) }} />
            )}

            {/* Text */}
            {(f.type === "text" || f.type === "name") && <input value={val} onChange={e => { setVal(f.id, e.target.value); clearErr(f.id) }} placeholder={f.placeholder || ""} style={{ ...inp, borderColor: fieldErr ? FC.red : FC.fieldBorder }}
                onFocus={e => { trackFieldTouch(f); e.target.style.borderColor = accentBg }} onBlur={e => e.target.style.borderColor = fieldErr ? FC.red : FC.fieldBorder} />}

            {/* Email */}
            {f.type === "email" && <input value={val} onChange={e => { setVal(f.id, e.target.value); clearErr(f.id) }} placeholder={f.placeholder || "예) example@email.com"} style={{ ...inp, borderColor: fieldErr ? FC.red : FC.fieldBorder }}
                onFocus={e => { trackFieldTouch(f); e.target.style.borderColor = accentBg }} onBlur={e => { e.target.style.borderColor = fieldErr ? FC.red : FC.fieldBorder; if (val && !isValidEmail(val)) setErr(f.id, "올바른 이메일 형식을 입력해주세요."); else clearErr(f.id) }} />}

            {/* Phone */}
            {(f.type as any) === "phone" && <input value={val} onChange={e => { const v = fmtPhone(e.target.value); setVal(f.id, v); clearErr(f.id) }} placeholder={f.placeholder || "예) 010-1234-5678"} inputMode="numeric" style={{ ...inp, borderColor: fieldErr ? FC.red : FC.fieldBorder }}
                onFocus={e => { trackFieldTouch(f); e.target.style.borderColor = accentBg }} onBlur={e => { e.target.style.borderColor = fieldErr ? FC.red : FC.fieldBorder; if (val && !isValidPhone(val)) setErr(f.id, "올바른 휴대폰 번호를 입력해주세요."); else clearErr(f.id) }} />}

            {/* Textarea */}
            {f.type === "textarea" && <textarea value={val} onChange={e => { setVal(f.id, e.target.value); clearErr(f.id) }} placeholder={f.placeholder || ""}
                style={{ width: "100%", minHeight: 90, background: FC.fieldBg, border: `1px solid ${fieldErr ? FC.red : FC.fieldBorder}`, borderRadius: fr, color: FC.t1, fontFamily: FONT, fontSize: 13, padding: "10px 13px", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6, transition: "border .15s" }}
                onFocus={e => { trackFieldTouch(f); e.target.style.borderColor = accentBg }} onBlur={e => e.target.style.borderColor = fieldErr ? FC.red : FC.fieldBorder} />}

            {/* Info */}
            {f.type === "info" && <div style={{ borderRadius: fr, background: FC.fieldBg, overflow: "hidden" }}>
                {(f as any).imageUrl && <div style={imageBoxStyle(f, 260, 0, FC.fieldBg)}>
                    <img src={(f as any).imageUrl} alt={(f as any).imageCaption || ""} style={imageImgStyle(f)} />
                </div>}
                {(f.placeholder || !(f as any).imageUrl) && <div style={{ padding: (f as any).imageUrl ? "10px 14px" : "0", fontSize: 13, color: FC.t1, opacity: 0.75, lineHeight: 1.7, fontFamily: FONT }} dangerouslySetInnerHTML={{ __html: mdToHtml(f.placeholder || "") }} />}
                {(f as any).imageCaption && (f as any).imageUrl && <div style={{ fontSize: 11.5, color: FC.t3, padding: "0 14px 10px", fontFamily: FONT }}>{(f as any).imageCaption}</div>}
            </div>}

            {/* Date */}
            {f.type === "date" && (() => {
                const today = new Date()
                const parsed = val ? new Date(val) : null
                const dy = dpY[f.id] ?? (parsed ? parsed.getFullYear() : today.getFullYear())
                const dm = dpM[f.id] ?? (parsed ? parsed.getMonth() : today.getMonth())
                const open = dpOpen[f.id] || false
                const displayVal = parsed ? `${parsed.getFullYear()}년 ${parsed.getMonth() + 1}월 ${parsed.getDate()}일` : ""
                const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]
                const minYear = today.getFullYear() - 80
                const maxYear = today.getFullYear() + 40
                const daysInMonth = new Date(dy, dm + 1, 0).getDate()
                const selectedDay = Math.min(Math.max(1, parsed ? parsed.getDate() : today.getDate()), daysInMonth)
                const commitDate = (year: number, month: number, day: number, close = false) => {
                    const safeYear = Math.min(maxYear, Math.max(minYear, year))
                    const safeMonth = Math.min(11, Math.max(0, month))
                    const safeDay = Math.min(new Date(safeYear, safeMonth + 1, 0).getDate(), Math.max(1, day))
                    setDpY(p => ({ ...p, [f.id]: safeYear }))
                    setDpM(p => ({ ...p, [f.id]: safeMonth }))
                    setVal(f.id, `${safeYear}-${String(safeMonth + 1).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`)
                    clearErr(f.id)
                    if (close) setDpOpen(p => ({ ...p, [f.id]: false }))
                }
                const WHEEL_ITEM_HEIGHT = 42
                const WHEEL_VISIBLE_ITEMS = 5
                const WHEEL_SPACER_HEIGHT = WHEEL_ITEM_HEIGHT * 2
                const years = Array.from({ length: maxYear - minYear + 1 }, (_, idx) => minYear + idx)
                const months = Array.from({ length: 12 }, (_, idx) => idx)
                const days = Array.from({ length: daysInMonth }, (_, idx) => idx + 1)
                const wheelColumn = (label: string, values: number[], activeValue: number, format: (value: number) => string, onSelect: (value: number, close?: boolean) => void, closeOnClick = false) => {
                    const activeIndex = Math.max(0, values.indexOf(activeValue))
                    const syncKey = `${values.length}-${activeIndex}`
                    const handleScrollEnd = (el: HTMLDivElement) => {
                        const idx = Math.min(values.length - 1, Math.max(0, Math.round(el.scrollTop / WHEEL_ITEM_HEIGHT)))
                        const nextValue = values[idx]
                        el.dataset.userScrolling = "0"
                        el.dataset.syncKey = `${values.length}-${idx}`
                        el.scrollTo({ top: idx * WHEEL_ITEM_HEIGHT, behavior: "smooth" })
                        if (typeof nextValue === "number" && nextValue !== activeValue) onSelect(nextValue, false)
                    }
                    return (
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: FC.t3, textAlign: "center", marginBottom: 6, fontFamily: FONT }}>{label}</div>
                        <div ref={node => { if (node && node.dataset.syncKey !== syncKey && node.dataset.userScrolling !== "1") { node.dataset.syncKey = syncKey; node.scrollTop = activeIndex * WHEEL_ITEM_HEIGHT } }}
                            onWheelCapture={e => e.stopPropagation()}
                            onWheel={e => { e.preventDefault(); e.stopPropagation(); e.currentTarget.scrollTop += e.deltaY }}
                            onScroll={e => {
                                const el = e.currentTarget
                                el.dataset.userScrolling = "1"
                                window.clearTimeout(Number(el.dataset.scrollTimer || 0))
                                el.dataset.scrollTimer = String(window.setTimeout(() => handleScrollEnd(el), 90))
                            }}
                            style={{ position: "relative", height: WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ITEMS, borderRadius: 18, border: `1px solid ${FC.fieldBorder}`, background: FC.fieldBg, padding: "0 7px", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)", overflowY: "auto", overscrollBehavior: "contain", touchAction: "pan-y", scrollSnapType: "y mandatory", WebkitOverflowScrolling: "touch" }}>
                            <div style={{ height: WHEEL_SPACER_HEIGHT, flexShrink: 0 }} />
                            {values.map((value, idx) => {
                                const isActive = value === activeValue
                                const distance = Math.abs(idx - activeIndex)
                                return <button key={value} onClick={() => onSelect(value, closeOnClick)}
                                    style={{ width: "100%", height: WHEEL_ITEM_HEIGHT, scrollSnapAlign: "center", border: "none", borderTop: isActive ? `1px solid ${FC.fieldBorder}` : "1px solid transparent", borderBottom: isActive ? `1px solid ${FC.fieldBorder}` : "1px solid transparent", borderRadius: isActive ? 10 : 0, background: isActive ? accentBg + "12" : "transparent", color: isActive ? FC.t1 : distance === 1 ? FC.t2 : FC.t3, fontFamily: FONT, fontSize: isActive ? 18 : distance === 1 ? 15 : 12.5, fontWeight: isActive ? 700 : 500, cursor: "pointer", transition: "all .12s ease" }}>
                                    {format(value)}
                                </button>
                            })}
                            <div style={{ height: WHEEL_SPACER_HEIGHT, flexShrink: 0 }} />
                        </div>
                    </div>
                    )
                }
                return <div style={{ position: "relative", display: "inline-block" }}>
                    <div onClick={() => setDpOpen(p => ({ ...p, [f.id]: !p[f.id] }))} style={{ height: fh, display: "inline-flex", alignItems: "center", gap: 10, padding: "0 14px", borderRadius: fr, border: `1px solid ${open ? accentBg : fieldErr ? FC.red : FC.fieldBorder}`, background: FC.fieldBg, cursor: "pointer", userSelect: "none", transition: "border .15s" }}>
                        <span style={{ fontSize: 13, color: displayVal ? FC.t1 : FC.t3, fontFamily: FONT }}>{displayVal || "날짜를 선택해주세요"}</span>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: FC.t3, flexShrink: 0 }}><rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" /><path d="M5 2v2M11 2v2M2 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                    </div>
                    {open && <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 200, background: FC.bg || "#fff", border: `1px solid ${FC.fieldBorder}`, borderRadius: 20, padding: 14, boxShadow: "0 12px 36px rgba(0,0,0,0.18)", width: 342 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.82fr 0.82fr", gap: 10 }}>
                            {wheelColumn("년", years, dy, value => `${value}년`, value => commitDate(value, dm, selectedDay))}
                            {wheelColumn("월", months, dm, value => MONTHS[value], value => commitDate(dy, value, selectedDay))}
                            {wheelColumn("일", days, selectedDay, value => `${value}일`, (value, close) => commitDate(dy, dm, value, close), true)}
                        </div>
                        <div style={{ marginTop: 12, borderTop: `1px solid ${FC.fieldBorder}`, paddingTop: 11, display: "flex", justifyContent: "center", gap: 8 }}>
                            <button onClick={() => { const t = today; setVal(f.id, `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`); setDpOpen(p => ({ ...p, [f.id]: false })) }}
                                style={{ padding: "5px 20px", borderRadius: 8, border: `1px solid ${accentBg}44`, background: accentBg + "0f", color: accentBg, fontFamily: FONT, fontSize: 12.5, fontWeight:600, cursor: "pointer" }}>오늘</button>
                            {val && <button onClick={() => { setVal(f.id, ""); setDpOpen(p => ({ ...p, [f.id]: false })) }}
                                style={{ padding: "5px 14px", borderRadius: 8, border: `1px solid ${FC.fieldBorder}`, background: "transparent", color: FC.t3, fontFamily: FONT, fontSize: 12.5, cursor: "pointer" }}>초기화</button>}
                        </div>
                    </div>}
                </div>
            })()}

            {/* Time */}
            {f.type === "time" && (() => {
                const ampm = vals[f.id + "_ampm"] || "오전"
                const hh = vals[f.id + "_h"] || ""
                const mm = vals[f.id + "_m"] || ""
                const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))
                const mins = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))
                const boxS: React.CSSProperties = { position: "relative", width: 80, flexShrink: 0 }
                const inpT: React.CSSProperties = { width: "100%", height: fh, background: FC.fieldBg, border: `1px solid ${FC.fieldBorder}`, borderRadius: fr, color: FC.t1, fontFamily: FONT, fontSize: 14, padding: "0 28px 0 12px", outline: "none", cursor: "text", boxSizing: "border-box", transition: "border .15s" }
                return <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <div style={{ display: "flex", borderRadius: fr, border: `1px solid ${FC.fieldBorder}`, overflow: "hidden", flexShrink: 0 }}>
                        {["오전", "오후"].map(v => <button key={v} onClick={() => setVal(f.id + "_ampm", v)} style={{ height: fh, padding: "0 12px", border: "none", background: ampm === v ? accentBg : FC.fieldBg, color: ampm === v ? "#fff" : FC.t2, fontFamily: FONT, fontSize: 13, fontWeight: ampm === v ? 600 : 400, cursor: "pointer" }}>{v}</button>)}
                    </div>
                    <div style={boxS}>
                        <input value={hh} onChange={e => { const v = e.target.value.replace(/\D/g, ""); if (v === "" || Number(v) <= 12) setVal(f.id + "_h", v) }} onBlur={e => { if (hh && Number(hh) >= 1) setVal(f.id + "_h", String(Number(hh)).padStart(2, "0")) }} placeholder="시" maxLength={2} style={inpT} inputMode="numeric" />
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: FC.t3 }}><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <select value={hh} onChange={e => setVal(f.id + "_h", e.target.value)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}>
                            <option value="">시</option>{hours.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                    <span style={{ color: FC.t3, fontWeight:600, fontSize: 16, flexShrink: 0 }}>:</span>
                    <div style={boxS}>
                        <input value={mm} onChange={e => { const v = e.target.value.replace(/\D/g, ""); if (v === "" || Number(v) <= 59) setVal(f.id + "_m", v) }} onBlur={e => { if (mm !== "") setVal(f.id + "_m", String(Number(mm)).padStart(2, "0")) }} placeholder="분" maxLength={2} style={inpT} inputMode="numeric" />
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: FC.t3 }}><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <select value={mm} onChange={e => setVal(f.id + "_m", e.target.value)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}>
                            <option value="">분</option>{mins.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>
            })()}

            {/* Dropdown */}
            {f.type === "dropdown" && (() => {
                const open = dropOpen[f.id] || false
                const ddOpts: Opt[] = opts
                const sel = ddOpts.find(o => o.value === val)
                return <div style={{ position: "relative" }}>
                    <div onClick={() => { trackFieldTouch(f); setDropOpen(p => ({ ...p, [f.id]: !p[f.id] })) }} style={{ ...inp, height: fh, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", border: `1px solid ${open ? accentBg : fieldErr ? FC.red : FC.fieldBorder}` }}>
                        <span style={{ fontSize: 13, color: sel ? FC.t1 : FC.t3, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sel?.label || f.placeholder || "선택해주세요."}</span>
                        <span style={{ fontSize: 11, color: FC.t3, flexShrink: 0 }}>{open ? "▴" : "▾"}</span>
                    </div>
                    {open && <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: FC.bg || FC.fieldBg, border: `1px solid ${FC.fieldBorder}`, borderRadius: fr, maxHeight: 200, overflowY: "auto", zIndex: 50, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
                        {ddOpts.map(opt => {
                            const s = opt.value === val
                            return <div key={opt.value}
                                onClick={() => { setVal(f.id, opt.value); setDropOpen(p => ({ ...p, [f.id]: false })); clearErr(f.id) }}
                                onMouseEnter={e => { if (!s) (e.currentTarget as HTMLElement).style.background = accentBg + "0f" }}
                                onMouseLeave={e => { if (!s) (e.currentTarget as HTMLElement).style.background = "transparent" }}
                                style={{ padding: "9px 13px", cursor: "pointer", fontSize: 13, fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "space-between", background: s ? accentBg + "14" : "transparent", color: s ? accentBg : FC.t1, transition: "background .12s" }}>
                                <span style={{ fontWeight: s ? 600 : 400 }}>{opt.label}</span>
                                {s && <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                        })}
                    </div>}
                </div>
            })()}

            {/* Button Select */}
            {f.type === "button_select" && (() => {
                const selOpt = opts.find(o => o.value === val)
                return <div>
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
                        {opts.map(opt => {
                            const s = opt.value === val
                            return <button key={opt.value} onClick={() => {
                                trackFieldTouch(f)
                                setVal(f.id, s ? "" : opt.value)
                                clearErr(f.id)
                                if (!s && opt.nextPage) {
                                    if (opt.nextPage === 9999) setTimeout(() => { setShareCopied(false); setShowModal(true) }, 300)
                                    else setTimeout(() => setPage(opt.nextPage!), 300)
                                }
                            }} style={{ padding: "10px 8px", borderRadius: fr, border: `1px solid ${s ? accentBg : FC.fieldBorder}`, background: s ? accentBg + "14" : "transparent", color: s ? accentBg : FC.t2, fontFamily: FONT, fontSize: 13, cursor: "pointer", fontWeight: s ? 600 : 400, textAlign: "center", whiteSpace: "pre-wrap", wordBreak: "keep-all" }}>
                                {opt.label}
                            </button>
                        })}
                    </div>
                    {selOpt?.isEtc && <div style={{ marginTop: 8 }}>
                        <input value={vals[f.id + "_etc"] || ""} onChange={e => setVal(f.id + "_etc", e.target.value)} placeholder={f.etcPh || "직접 입력해주세요."} style={inp} onFocus={e => e.target.style.borderColor = accentBg} onBlur={e => e.target.style.borderColor = FC.fieldBorder} />
                    </div>}
                </div>
            })()}

            {/* Checkbox */}
            {f.type === "checkbox" && (() => {
                const checkedVals = checked[f.id] || []
                const etcOpt = opts.find(opt => opt.isEtc && checkedVals.includes(opt.value))
                return <div>
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
                        {opts.map(opt => {
                            const isChk = checkedVals.includes(opt.value)
                            return <div key={opt.value} onClick={() => { trackFieldTouch(f); setChecked(p => { const cur = p[f.id] || []; return { ...p, [f.id]: isChk ? cur.filter(v => v !== opt.value) : [...cur, opt.value] } }); clearErr(f.id) }} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                                <div style={{ width: 18, height: 18, borderRadius: 4, border: `1px solid ${isChk ? accentBg : FC.fieldBorder}`, background: isChk ? accentBg : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}>
                                    {isChk && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                </div>
                                <span style={{ fontSize: 13, color: FC.t1, fontFamily: FONT }}>{opt.label}</span>
                            </div>
                        })}
                    </div>
                    {etcOpt && <div style={{ marginTop: 8 }}>
                        <input value={vals[f.id + "_etc"] || ""} onChange={e => { setVal(f.id + "_etc", e.target.value); clearErr(f.id) }} placeholder={f.etcPh || "직접 입력해주세요."} style={inp} onFocus={e => e.target.style.borderColor = accentBg} onBlur={e => e.target.style.borderColor = FC.fieldBorder} />
                    </div>}
                </div>
            })()}

            {/* File */}
            {f.type === "file" && (() => {
                const rawNames:any = fileNames[f.id] || []
                const names = Array.isArray(rawNames) ? rawNames : rawNames ? [rawNames] : []
                const hasFiles = names.length > 0
                return <div>
                    <label htmlFor={`file_${f.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: fh, borderRadius: fr, border: `1.5px dashed ${hasFiles ? accentBg : FC.fieldBorder}`, background: hasFiles ? accentBg + "0a" : FC.fieldBg, cursor: "pointer", fontFamily: FONT, fontSize: 13, color: hasFiles ? accentBg : FC.t3, fontWeight: 500 }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 11V5M5.5 7.5L8 5l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 11.5A2.5 2.5 0 0 0 5.5 14h5A2.5 2.5 0 0 0 13 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                        {hasFiles ? `${names.length}개 파일 선택됨` : f.placeholder || "파일 업로드"}
                    </label>
                    <div style={{fontSize:11.5,color:FC.t3,marginTop:6,fontFamily:FONT}}>{FILE_LIMIT_TEXT}</div>
                    <input id={`file_${f.id}`} type="file" multiple style={{ display: "none" }} onChange={e => {
                        const picked = Array.from(e.target.files || [])
                        if (picked.length) {
                            const rawCurrent:any = fileObjects[f.id] || []
                            const current:File[] = Array.isArray(rawCurrent) ? rawCurrent : rawCurrent ? [rawCurrent] : []
                            const tooLarge = picked.find(file => file.size > FILE_MAX_SIZE)
                            if (tooLarge) {
                                setErr(f.id, `${tooLarge.name} 파일이 ${FILE_MAX_SIZE_MB}MB를 초과했어요.`)
                                e.target.value = ""
                                return
                            }
                            if (current.length + picked.length > FILE_MAX_COUNT) {
                                setErr(f.id, `파일은 최대 ${FILE_MAX_COUNT}개까지 업로드할 수 있어요.`)
                                e.target.value = ""
                                return
                            }
                            const next = [...current, ...picked]
                            trackFieldTouch(f)
                            setFileNames(p => ({ ...p, [f.id]: next.map(file => file.name) }))
                            setFileObjects(p => ({ ...p, [f.id]: next }))
                            clearErr(f.id)
                        }
                        e.target.value = ""
                    }} />
                    {hasFiles && <div style={{display:"flex",flexDirection:"column",gap:5,marginTop:7}}>
                        {names.map((name, fileIdx) => <div key={`${name}_${fileIdx}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", borderRadius: fr, background: accentBg + "10", border: `1px solid ${accentBg}33` }}>
                            <span style={{ fontSize: 12, color: accentBg, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                            <button onClick={() => {
                                setFileNames(p => { const cur:any = p[f.id] || []; const arr = Array.isArray(cur) ? cur : cur ? [cur] : []; return { ...p, [f.id]: arr.filter((_, i) => i !== fileIdx) } })
                                setFileObjects(p => { const cur:any = p[f.id] || []; const arr = Array.isArray(cur) ? cur : cur ? [cur] : []; return { ...p, [f.id]: arr.filter((_, i) => i !== fileIdx) } })
                            }} style={{ fontSize: 13, color: accentBg, border: "none", background: "none", cursor: "pointer", padding: "0 0 0 8px", flexShrink: 0, lineHeight: 1 }}>×</button>
                        </div>)}
                    </div>}
                </div>
            })()}

            {fieldErr && <div style={{ fontSize: 12, color: FC.red, marginTop: 5, fontFamily: FONT }}>{fieldErr}</div>}
        </div>
    }

    const enabledConsents = cfg.consents.filter(c => c.enabled)

    // Apply background to entire page
    React.useEffect(() => {
        document.body.style.background = FC.bg
        document.body.style.margin = "0"
        document.documentElement.style.background = FC.bg
        return () => {
            document.body.style.background = ""
            document.documentElement.style.background = ""
        }
    }, [FC.bg])

    React.useEffect(() => {
        if (!cfg.auth?.enabled || !supa) return
        supa.auth.getUser().then(({ data }) => {
            if (data?.user) setAuthUser(data.user)
            else setShowAuthModal(true)
        })
    }, [cfg.auth?.enabled, supa])

    return (
        <div style={{ width: "100%", minHeight: "100vh", background: FC.bg, color: FC.t1, "--link-color": accentBg } as React.CSSProperties}>
            <style>{`@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css'); body,html{background:${FC.bg}!important;margin:0;}`}</style>
            <button onClick={() => setShareMenuOpen(v => !v)} title="폼 공유하기"
                style={{ position: "fixed", right: 20, bottom: 20, zIndex: 900, height: 44, padding: "0 15px", borderRadius: 999, border: `1px solid ${accentBg}33`, background: accentBg, color: cfg.cta.color || "#fff", boxShadow: "0 10px 28px rgba(0,0,0,0.18)", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: FONT, fontSize: 13.5, fontWeight:600 }}>
                <svg width="17" height="17" viewBox="0 0 16 16" fill="none"><path d="M8 10V2.8M5.3 5.5 8 2.8l2.7 2.7M3 7.5v4.8c0 .7.5 1.2 1.2 1.2h7.6c.7 0 1.2-.5 1.2-1.2V7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                공유
            </button>
            {shareMenuOpen && <div style={{ position: "fixed", right: 20, bottom: 72, zIndex: 901, width: 190, padding: 8, borderRadius: 16, border: `1px solid ${FC.fieldBorder}`, background: FC.bg, boxShadow: "0 14px 36px rgba(0,0,0,0.2)" }}>
                <button onClick={shareKakao} style={shareMenuButtonStyle}><ShareIcon type="kakao" />카카오톡</button>
                <button onClick={shareInstagramStory} style={shareMenuButtonStyle}><ShareIcon type="instagram" />인스타그램 스토리</button>
                <button onClick={shareThreads} style={shareMenuButtonStyle}><ShareIcon type="threads" />스레드</button>
                <button onClick={shareToX} style={shareMenuButtonStyle}><ShareIcon type="x" />X</button>
                <div style={{height:1,background:FC.fieldBorder,margin:"6px 2px"}} />
                <button onClick={() => copyShareUrl()} style={shareMenuButtonStyle}><ShareIcon type="link" />{shareCopied ? "복사 완료" : "URL 복사"}</button>
            </div>}
            {/* Operation period modal */}
            {operationGate && showOperationModal && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: 20, boxSizing: "border-box" as const }}>
                <div style={{ width: "min(420px,100%)", background: FC.bg || "#fff", borderRadius: 18, padding: "30px 26px 24px", boxShadow: "0 18px 48px rgba(0,0,0,0.28)", border: `1px solid ${FC.fieldBorder}`, textAlign: "center" as const }}>
                    <div style={{ width: 54, height: 54, borderRadius: "50%", background: `${FC.red}12`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: FC.red }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 7v6M12 17h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: FC.t1, marginBottom: 8, fontFamily: FONT }}>{operationGate.title}</div>
                    <div style={{ fontSize: 13.5, color: FC.t2, lineHeight: 1.6, marginBottom: 18, fontFamily: FONT }}>{operationGate.body}</div>
                    <button onClick={() => setShowOperationModal(false)}
                        style={{ width: "100%", height: 44, borderRadius: fr, border: "none", background: accentBg, color: cfg.cta.color || "#fff", fontFamily: FONT, fontSize: 14, fontWeight:600, cursor: "pointer" }}>
                        확인
                    </button>
                </div>
            </div>}
            {/* Auth modal */}
            {cfg.auth?.enabled && showAuthModal && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
                <div style={{ background: FC.bg || "#fff", borderRadius: 16, padding: "32px 28px", width: "min(360px,90%)", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
                    <div style={{ fontSize: 18, fontWeight:600, color: FC.t1, marginBottom: 6, fontFamily: FONT }}>로그인이 필요해요</div>
                    <div style={{ fontSize: 13, color: FC.t3, marginBottom: 24, fontFamily: FONT }}>{cfg.auth.errText || "이 폼은 로그인 후 작성할 수 있어요."}</div>
                    <div style={{ marginBottom: 12 }}>
                        <input value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="이메일" type="email"
                            style={{ width: "100%", height: 44, background: FC.fieldBg, border: `1px solid ${FC.fieldBorder}`, borderRadius: fr, color: FC.t1, fontFamily: FONT, fontSize: 13, padding: "0 13px", outline: "none", boxSizing: "border-box" as const }} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <input value={authPw} onChange={e => setAuthPw(e.target.value)} placeholder="비밀번호" type="password"
                            onKeyDown={e => { if (e.key === "Enter") handleAuthLogin() }}
                            style={{ width: "100%", height: 44, background: FC.fieldBg, border: `1px solid ${FC.fieldBorder}`, borderRadius: fr, color: FC.t1, fontFamily: FONT, fontSize: 13, padding: "0 13px", outline: "none", boxSizing: "border-box" as const }} />
                    </div>
                    {authErr && <div style={{ fontSize: 12, color: FC.red, marginBottom: 12, fontFamily: FONT }}>{authErr}</div>}
                    <button onClick={handleAuthLogin} disabled={authLoading}
                        style={{ width: "100%", height: 48, borderRadius: fr, border: "none", background: accentBg, color: cfg.cta.color || "#fff", fontFamily: FONT, fontSize: 14, fontWeight:600, cursor: authLoading ? "not-allowed" : "pointer", opacity: authLoading ? 0.7 : 1 }}>
                        {authLoading ? "로그인 중..." : "로그인"}
                    </button>
                    {cfg.auth.loginUrl && <div style={{ marginTop: 12, textAlign: "center" as const }}>
                        <a href={cfg.auth.loginUrl} style={{ fontSize: 12, color: FC.t3, fontFamily: FONT }}>다른 방법으로 로그인</a>
                    </div>}
                </div>
            </div>}
            <div style={{ width: "100%", maxWidth: cfg.styles.maxW, margin: "0 auto", fontFamily: FONT, padding: "40px 20px 80px", boxSizing: "border-box" as const }}>
            {operationGate && <div style={{ marginBottom: 18, padding: "13px 14px", borderRadius: fr, background: `${FC.red}0f`, border: `1px solid ${FC.red}30`, color: FC.red, fontFamily: FONT }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>{operationGate.title}</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.55, color: FC.red }}>{operationGate.body}</div>
            </div>}

            {/* Header image */}
            {cfg.header.imageUrl && <div style={{ ...imageBoxStyle(cfg.header, 200, fr, FC.fieldBg), marginBottom: 22 }}>
                <img src={cfg.header.imageUrl} alt="" style={imageImgStyle(cfg.header)} />
            </div>}

            {/* Header text */}
            {(cfg.header.overline || cfg.header.title) && <div style={{ marginBottom: 24, textAlign: "center" as const }}>
                {cfg.header.overline && <div style={{ fontSize: 12, fontWeight: 600, color: accentBg, marginBottom: 6, letterSpacing: "0.5px" }}>{cfg.header.overline}</div>}
                {cfg.header.title && <div style={{ fontSize: 22, fontWeight: 600, color: FC.t1, lineHeight: 1.3, letterSpacing: "-0.5px" }}>{cfg.header.title}</div>}
                {(cfg.header.educationStart || cfg.header.educationEnd) && <div style={{ fontSize: 13, color: FC.t2, marginTop: 8 }}>
                    {fmtDateKo(cfg.header.educationStart)}{cfg.header.educationStart && cfg.header.educationEnd && " ~ "}{fmtDateKo(cfg.header.educationEnd)}
                    {(cfg.header.tuitionFree || cfg.header.tuitionAmount) && <span style={{ margin: "0 8px", color: FC.t3 }}>|</span>}
                    {cfg.header.tuitionFree ? cfg.header.tuitionFreeText || "수강료 전액 무료" : cfg.header.tuitionAmount ? `${cfg.header.tuitionAmount}원` : ""}
                    {cfg.header.stipend && <><span style={{ margin: "0 8px", color: FC.t3 }}>|</span>{cfg.header.stipend}</>}
                </div>}
            </div>}

            {/* Notice */}
            {page === 1 && cfg.header.noticeEnabled && cfg.header.noticeText && <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: (cfg.header.noticeShape || "pill") === "pill" ? 999 : 10, background: FC.fieldBg, border: `1px solid ${FC.fieldBorder}`, fontSize: 12.5, color: FC.t2, lineHeight: 1.5 }}>
                    {cfg.header.noticeIconEnabled && <span style={{ width: 17, height: 17, borderRadius: "50%", border: `1px solid ${FC.fieldBorder}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0 }}>{cfg.header.noticeIconText}</span>}
                    <span dangerouslySetInnerHTML={{ __html: mdToHtml(cfg.header.noticeText) }} />
                </div>
            </div>}

            {/* Multi-page progress */}
            {isMultiPage && <div style={{ marginBottom: qg }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ flex: 1, height: 3, borderRadius: 2, background: FC.fieldBorder, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 2, background: accentBg, width: `${(page / formPages) * 100}%`, transition: "width .35s" }} />
                    </div>
                    <span style={{ fontSize: 11, color: FC.t3, flexShrink: 0 }}>{page}/{formPages}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 4, height: 18, borderRadius: 2, background: accentBg, flexShrink: 0 }} />
                    <span style={{ fontSize: 15, fontWeight:600, color: FC.t1, letterSpacing: "-0.2px" }}>{getPageLabel(page)}</span>
                </div>
            </div>}

            {/* Fields */}
            {currentFields.map((field, i) => renderField(field, i))}

            {/* Consents (last page or single page) */}
            {(!isMultiPage || isLastPage) && enabledConsents.map((cs, idx) => {
                const lines = cs.body.split("\n")
                const LIMIT = 3
                const open = consentOpen[idx] || false
                const needsAccordion = lines.length > LIMIT
                const visible = needsAccordion && !open ? cs.body : cs.body
                return <div key={idx} style={{ marginBottom: qg }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ fontSize: 14, fontWeight:600, color: FC.t1, display: "flex", alignItems: "center", gap: 3 }}>
                            {cs.title}{cs.required && <span style={{ color: accentBg, fontSize: 14, fontWeight:600 }}>*</span>}
                        </div>
                        {cs.policyUrl && <a href={cs.policyUrl} target="_blank" rel="noopener" style={{ fontSize: 12, fontWeight:600, color: accentBg, textDecoration: "none", padding: "2px 9px", borderRadius: 5, border: `1px solid ${accentBg}44`, flexShrink: 0 }}>보기</a>}
                    </div>
                    <div style={{ borderTop: `1px solid ${FC.fieldBorder}`, paddingTop: 10, marginBottom: 10 }}>
                        <div style={{ fontSize: 12, color: FC.t2, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: mdToHtml(visible) }} />
                        {needsAccordion && <button onClick={() => setConsentOpen(p => { const n = [...p]; n[idx] = !n[idx]; return n })} style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, background: "none", border: "none", cursor: "pointer", color: accentBg, fontFamily: FONT, fontSize: 11.5, fontWeight: 600, padding: 0 }}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            {open ? "접기" : "전체 보기"}
                        </button>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }} onClick={() => setConsentOk(p => { const n = [...p]; n[idx] = !n[idx]; return n })}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, border: `1px solid ${consentOk[idx] ? accentBg + "cc" : FC.fieldBorder}`, background: consentOk[idx] ? accentBg + "d9" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}>
                            {consentOk[idx] && <span style={{ color: "#fff", fontSize: 11, fontWeight:600 }}>✓</span>}
                        </div>
                        <span style={{ fontSize: 13, color: FC.t2 }}>{cs.checkLabel}</span>
                    </div>
                    {errors[`consent_${idx}`] && <div style={{ fontSize: 12, color: FC.red, marginTop: 5, fontFamily: FONT }}>{errors[`consent_${idx}`]}</div>}
                </div>
            })}

            {dupErr && !showDupModal && <div style={{ fontSize: 13, color: FC.red, textAlign: "center", marginBottom: 12, fontFamily: FONT }}>{dupErr}</div>}

            {/* Navigation buttons */}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                {isMultiPage && page > 1 && <button onClick={() => setPage(p => p - 1)} style={{ flex: 1, height: cfg.cta.height, borderRadius: fr, border: "none", background: FC.fieldBg || "#F2F4F6", color: FC.t2, fontFamily: FONT, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>이전</button>}
                {isMultiPage && page < formPages
                    ? <button
                        disabled={!isPageComplete}
                        onClick={() => { if (formDisabled) { setShowOperationModal(true); return } persistLocalDraft(page + 1); saveRemoteDraft(false, page + 1); setPage(p => p + 1) }}
                        style={{ flex: 2, height: cfg.cta.height, borderRadius: fr, border: "none", background: !formDisabled && isPageComplete ? accentBg : accentBg + "55", color: cfg.cta.color || "#fff", fontFamily: FONT, fontSize: 14, fontWeight:600, cursor: !formDisabled && isPageComplete ? "pointer" : "not-allowed" }}>
                        다음
                      </button>
                    : <button
                        disabled={submitting || !isPageComplete}
                        onClick={handleSubmit}
                        style={{ flex: 2, height: cfg.cta.height, borderRadius: fr, border: "none", background: !formDisabled && isPageComplete ? accentBg : accentBg + "55", color: cfg.cta.color || "#fff", fontFamily: FONT, fontSize: 14, fontWeight:600, cursor: (formDisabled || submitting || !isPageComplete) ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
                        {submitting ? (cfg.cta.loadLabel || "제출 중...") : cfg.cta.label}
                      </button>}
            </div>

            {/* Dup Modal */}
            {showDupModal && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                <div style={{ background: FC.bg || "#fff", borderRadius: 16, padding: "32px 28px", width: "min(340px,90%)", boxShadow: "0 8px 40px rgba(0,0,0,0.3)", textAlign: "center" as const }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#FFF1F1", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div style={{ fontSize: 17, fontWeight:600, color: FC.t1, marginBottom: 10, letterSpacing: "-0.3px", fontFamily: FONT }}>중복 신청 안내</div>
                    <div style={{ fontSize: 13.5, color: FC.t2, lineHeight: 1.6, marginBottom: 24, fontFamily: FONT, whiteSpace: "pre-line" as const }}>
                        {dupErr || "이미 신청 내역이 있어요."}
                    </div>
                    <button onClick={() => window.open("https://insideout.or.kr/program", "_blank")}
                        style={{ width: "100%", height: 48, borderRadius: fr, border: "none", background: accentBg, color: cfg.cta.color || "#fff", fontFamily: FONT, fontSize: 14, fontWeight:600, cursor: "pointer", marginBottom: 10 }}>
                        프로그램 더 보러가기
                    </button>
                    <button onClick={() => setShowDupModal(false)}
                        style={{ width: "100%", height: 40, borderRadius: fr, border: `1px solid ${FC.fieldBorder}`, background: "transparent", color: FC.t2, fontFamily: FONT, fontSize: 13.5, cursor: "pointer" }}>
                        닫기
                    </button>
                </div>
            </div>}
            {/* Modal */}
            {showModal && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                <div style={{ background: FC.bg || "#fff", borderRadius: 16, padding: "32px 28px", width: "min(560px,calc(100% - 32px))", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", textAlign: "center" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: accentBg + "22", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke={accentBg} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <div style={{ fontSize: 18, fontWeight:600, color: FC.t1, marginBottom: 8, letterSpacing: "-0.3px" }}>{cfg.modal.title}</div>
                    {cfg.modal.body && <div style={{ fontSize: 13.5, color: FC.t2, lineHeight: 1.6, marginBottom: 16 }}>{cfg.modal.body}</div>}
                    <div style={{ display: "flex", justifyContent: "center", gap: "clamp(8px, 2.2vw, 18px)", marginBottom: 22 }}>
                        <button onClick={shareKakao} title="카카오톡 공유" style={shareButtonStyle}>
                            <ShareIcon type="kakao" size={28} />
                        </button>
                        <button onClick={shareInstagramStory} title="인스타그램 스토리로 이동" style={shareButtonStyle}>
                            <ShareIcon type="instagram" size={28} />
                        </button>
                        <button onClick={shareThreads} title="스레드 공유" style={shareButtonStyle}>
                            <ShareIcon type="threads" size={29} />
                        </button>
                        <button onClick={shareToX} title="X 공유" style={shareButtonStyle}>
                            <ShareIcon type="x" size={27} />
                        </button>
                        <button onClick={() => copyShareUrl(false)} title="URL 복사" style={shareButtonStyle}>
                            <ShareIcon type="link" size={28} />
                        </button>
                    </div>
                    {shareCopied && <div style={{fontSize:12,color:accentBg,fontWeight:600,marginTop:-10,marginBottom:12}}>URL이 복사됐어요.</div>}
                    <button onClick={() => { if (cfg.modal.btnUrl) { if (cfg.modal.btnReplace) window.location.replace(cfg.modal.btnUrl); else window.location.href = cfg.modal.btnUrl } else setShowModal(false) }}
                        style={{ width: "100%", height: 44, borderRadius: 8, border: "none", background: accentBg, color: cfg.cta.color || "#fff", fontFamily: FONT, fontSize: 14, fontWeight:600, cursor: "pointer" }}>
                        {cfg.modal.btnLabel || "확인"}
                    </button>
                </div>
            </div>}
        </div>
        </div>
    )
}
