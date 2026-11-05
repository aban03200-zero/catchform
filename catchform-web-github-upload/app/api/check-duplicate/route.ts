import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

// 같은 폼에 같은 사람(이름 + 휴대폰 번호)이 이미 신청했는지 확인한다.
//
// 브라우저에서 직접 조회하지 않는다. applications 표는 anon 키로 읽을 수 없게 막혀 있는데,
// 막혔을 때 에러가 아니라 빈 목록이 돌아온다. 그대로 쓰면 "중복 없음"으로만 보여서
// 검사가 있으나 마나 해진다. 그래서 서비스 키를 가진 이 서버가 대신 본다.
//
// 돌려주는 값은 있다/없다 하나뿐이다. 신청자 정보는 내보내지 않는다.
// 이름과 번호를 둘 다 정확히 아는 경우에만 답하므로 명단을 긁어갈 수는 없다.
//
// 관리자가 응답을 휴지통으로 보내면 표에서 행이 지워진다.
// 그래서 지워진 신청은 여기서도 안 보이고, 그 사람은 다시 신청할 수 있다.

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const ALLOWED_TABLES = new Set(["applications", "company_applications"])
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: { "cache-control": "no-store" } })
}

// 010-1234-5678, 010 1234 5678, +82 10 1234 5678 을 모두 01012345678 로 맞춘다.
function phoneDigits(raw: unknown) {
  let digits = String(raw ?? "").replace(/[^\d]/g, "")
  if (digits.startsWith("82")) digits = "0" + digits.slice(2)
  return digits
}

// 저장된 번호는 폼마다 하이픈이 있기도 없기도 하다. 흔한 표기를 모두 후보로 넣고 찾는다.
function phoneVariants(raw: string) {
  const digits = phoneDigits(raw)
  const out = new Set<string>([String(raw || "").trim(), digits])
  if (digits.length === 11) out.add(`${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`)
  if (digits.length === 10) out.add(`${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`)
  return [...out].filter(Boolean)
}

// 이름은 띄어쓰기만 다른 경우가 많다. "홍 길동"과 "홍길동"을 같게 본다.
function nameKey(raw: unknown) {
  return String(raw ?? "").replace(/\s+/g, "").toLowerCase()
}

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  if (!supabaseUrl || !serviceRoleKey) return json(503, { error: "supabase not configured" })

  let body: any
  try {
    body = await req.json()
  } catch {
    return json(400, { error: "invalid json" })
  }

  const table = String(body?.table || "")
  const formId = String(body?.formId || "")
  const name = String(body?.name || "").trim()
  const phone = String(body?.phone || "").trim()

  if (!ALLOWED_TABLES.has(table)) return json(400, { error: "unsupported table" })
  if (!UUID_RE.test(formId)) return json(400, { error: "invalid formId" })
  // 이름과 번호가 둘 다 있어야 검사한다. 한쪽만으로는 동명이인을 막아 버린다.
  if (!name || phoneDigits(phone).length < 10) return json(200, { duplicate: false })

  const supa = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await supa
    .from(table)
    .select("id,name")
    .eq("form_id", formId)
    .in("phone", phoneVariants(phone))
    .limit(50)

  // 조회가 실패하면 막지 않는다. 신청을 못 하게 되는 쪽이 중복보다 더 큰 손해다.
  if (error) return json(200, { duplicate: false, checked: false })

  const key = nameKey(name)
  const duplicate = (data || []).some(row => nameKey((row as any)?.name) === key)
  return json(200, { duplicate, checked: true })
}
