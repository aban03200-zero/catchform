import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status })
}

function normalizeRole(role: unknown) {
  const value = String(role || "").trim().toLowerCase()
  return value === "admin" || value === "master" ? value : ""
}

export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  if (!supabaseUrl || !supabaseAnonKey) {
    return json(500, { error: "Supabase public environment variables are missing." })
  }
  if (!serviceRoleKey) {
    return json(503, { error: "SUPABASE_SERVICE_ROLE_KEY is not configured." })
  }

  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim()
  if (!token) return json(401, { error: "Missing authorization token." })

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  const { data: userData, error: userError } = await userClient.auth.getUser(token)
  if (userError || !userData.user) return json(401, { error: "Invalid authorization token." })

  const { data: roleRow, error: roleError } = await userClient
    .from("users")
    .select("role")
    .eq("id", userData.user.id)
    .single()
  const role = normalizeRole(roleRow?.role)
  if (roleError || !role) return json(403, { error: "Admin permission is required." })

  const formId = req.nextUrl.searchParams.get("formId") || ""
  const formSlug = req.nextUrl.searchParams.get("slug") || ""
  if (!formId && !formSlug) return json(400, { error: "formId or slug is required." })

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const queries = []
  if (formId) {
    queries.push(
      adminClient
        .from("form_response_events")
        .select("*")
        .eq("form_id", formId)
        .order("created_at", { ascending: false })
        .limit(5000),
    )
  }
  if (formSlug) {
    queries.push(
      adminClient
        .from("form_response_events")
        .select("*")
        .eq("form_slug", formSlug)
        .order("created_at", { ascending: false })
        .limit(5000),
    )
  }

  const results = await Promise.all(queries)
  const firstError = results.find((result) => result.error)?.error
  if (firstError) return json(500, { error: firstError.message })

  const events = Array.from(
    new Map(results.flatMap((result) => result.data || []).map((event: any) => [event.id, event])).values(),
  ).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return json(200, { events })
}
