import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

// 공개 폼 페이지(/form/[slug])는 Vercel에 저장해 두고 내보낸다.
// 관리자가 폼 설정을 바꾸면 이 경로로 해당 주소의 저장본을 비워서, 다음 방문자부터 새 설정을 보게 한다.
// 아무나 호출하면 페이지를 계속 다시 만들게 되어 사용량이 늘어나므로, 관리자만 허용한다.

const MAX_SLUGS = 20

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status })
}

function normalizeRole(role: unknown) {
  const value = String(role || "").trim().toLowerCase()
  return value === "admin" || value === "master" ? value : ""
}

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  if (!supabaseUrl || !supabaseAnonKey) {
    return json(500, { error: "Supabase public environment variables are missing." })
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
  if (roleError || !normalizeRole(roleRow?.role)) return json(403, { error: "Admin permission is required." })

  const body = await req.json().catch(() => null)
  const slugs = Array.from(new Set(
    (Array.isArray(body?.slugs) ? body.slugs : [])
      .map((slug: unknown) => String(slug || "").trim())
      .filter((slug: string) => slug && slug.length <= 200 && !slug.includes("/")),
  )).slice(0, MAX_SLUGS) as string[]
  if (!slugs.length) return json(400, { error: "slugs is required." })

  for (const slug of slugs) revalidatePath(`/form/${slug}`)
  return json(200, { revalidated: slugs })
}
