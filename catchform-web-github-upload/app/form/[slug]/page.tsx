import { CatchFormClient } from "@/components/CatchFormClient"
import { publicEnv } from "@/lib/env"

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
    return rows[0] || null
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
