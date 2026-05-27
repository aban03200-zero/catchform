"use client"

import * as React from "react"
import { FormAdmin } from "./FormAdmin"
import { MissingEnvNotice } from "./MissingEnvNotice"
import { publicEnv } from "@/lib/env"

export function FormAdminClient() {
  const [size, setSize] = React.useState({ width: 1280, height: 820 })
  const hasSupabase = Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey)

  React.useEffect(() => {
    const update = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  if (!hasSupabase) return <MissingEnvNotice surface="admin" />

  return (
    <FormAdmin
      width={size.width}
      height={size.height}
      supabaseUrl={publicEnv.supabaseUrl}
      supabaseAnonKey={publicEnv.supabaseAnonKey}
      formBaseUrl={publicEnv.formBaseUrl}
      sfFormBaseUrl={publicEnv.sfFormBaseUrl}
    />
  )
}
