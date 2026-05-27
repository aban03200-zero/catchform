"use client"

import { CatchForm } from "./CatchForm"
import { MissingEnvNotice } from "./MissingEnvNotice"
import { publicEnv } from "@/lib/env"

export function CatchFormClient({ slug }: { slug?: string }) {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) {
    return <MissingEnvNotice surface="form" />
  }

  return (
    <CatchForm
      slug={slug || ""}
      supabaseUrl={publicEnv.supabaseUrl}
      supabaseAnonKey={publicEnv.supabaseAnonKey}
    />
  )
}
