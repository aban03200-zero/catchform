import { CatchFormClient } from "@/components/CatchFormClient"
import { publicEnv } from "@/lib/env"

function firstDateValue(source: any, keys: string[]) {
  for (const key of keys) {
    const value = source?.[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return ""
}

function recruitmentPeriodOf(program?: any) {
  if (!program) return { start: "", end: "" }
  return {
    start: firstDateValue(program, [
      "recruitment_start",
      "recruitment_start_at",
      "recruitment_start_date",
      "recruit_start",
      "recruit_start_at",
      "recruit_start_date",
      "application_start",
      "application_start_at",
      "application_start_date",
      "apply_start",
      "apply_start_at",
    ]),
    end: firstDateValue(program, [
      "recruitment_end",
      "recruitment_end_at",
      "recruitment_end_date",
      "recruit_end",
      "recruit_end_at",
      "recruit_end_date",
      "application_end",
      "application_end_at",
      "application_end_date",
      "apply_end",
      "apply_end_at",
    ]),
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
      const period = recruitmentPeriodOf(program)
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
  params: { slug: string }
}) {
  const initialForm = await getInitialForm(params.slug)

  return (
    <CatchFormClient
      slug={params.slug}
      formId={initialForm?.id || ""}
      configJson={initialForm?.config ? JSON.stringify(initialForm.config) : ""}
    />
  )
}
