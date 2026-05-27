"use client"

import { CatchForm } from "./CatchForm"
import { MissingEnvNotice } from "./MissingEnvNotice"
import { publicEnv } from "@/lib/env"

export function CatchFormClient({
  slug,
  formId,
  configJson,
}: {
  slug?: string
  formId?: string
  configJson?: string
}) {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) {
    return <MissingEnvNotice surface="form" />
  }

  return (
    <CatchForm
      slug={slug || ""}
      formId={formId || ""}
      configJson={configJson || ""}
      supabaseUrl={publicEnv.supabaseUrl}
      supabaseAnonKey={publicEnv.supabaseAnonKey}
    />
  )
}
