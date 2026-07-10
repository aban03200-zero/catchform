import { CatchFormClient } from "@/components/CatchFormClient"
import { publicEnv } from "@/lib/env"

function firstDateValue(source: any, keys: string[]) {
  for (const key of keys) {
    const value = source?.[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return ""
}

type RecruitmentPeriodMode = "pre" | "formal"
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

async function getProgram(baseUrl: string, programId: string) {
  const url = `${baseUrl}/rest/v1/programs?select=*&id=eq.${encodeURIComponent(programId)}&limit=1`
  const res = await fetch(url, {
    headers: {
      apikey: publicEnv.supabaseAnonKey,
      authorization: `Bearer ${publicEnv.supabaseAnonKey}`,
    },
    cache: "no-store",
  })
  if (!res.ok) return null
  const rows = (await res.json()) as any[]
  return rows[0] || null
}

async function getInitialForm(slug: string) {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey || !slug) return null

  const baseUrl = publicEnv.supabaseUrl.replace(/\/+$/, "")
  const url = `${baseUrl}/rest/v1/form_configs?select=id,config&slug=eq.${encodeURIComponent(slug)}&limit=1`

  try {
    const res = await fetch(url, {
      headers: {
        apikey: publicEnv.supabaseAnonKey,
        authorization: `Bearer ${publicEnv.supabaseAnonKey}`,
      },
      cache: "no-store",
    })
    if (!res.ok) return null
    const rows = (await res.json()) as Array<{ id: string; config: unknown }>
    const row = rows[0]
    const config = row?.config as any
    const programId = config?.header?.programUnlinked ? "" : String(config?.header?.programId || "")
    if (row && config && programId) {
      const program = await getProgram(baseUrl, programId).catch(() => null)
      const period = recruitmentPeriodOf(program, recruitmentPeriodModeOf(config))
      if (period.start || period.end) {
        row.config = {
          ...config,
          dashboard: {
            ...(config.dashboard || {}),
            operationStart: period.start || config.dashboard?.operationStart || "",
            operationEnd: period.end || config.dashboard?.operationEnd || "",
          },
        }
      }
    }
    return row || null
  } catch {
    return null
  }
}

export default async function FormSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const initialForm = await getInitialForm(slug)

  return (
    <CatchFormClient
      slug={slug}
      formId={initialForm?.id || ""}
      configJson={initialForm?.config ? JSON.stringify(initialForm.config) : ""}
    />
  )
}
