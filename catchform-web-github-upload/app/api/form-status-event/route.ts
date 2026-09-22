import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

// 공개 폼의 "작성 중(draft_saved)"과 "이탈(leave)" 기록만 받아서 form_response_events에 쓴다.
//
// 이 두 가지는 한 세션당 한 줄을 계속 덮어쓰는(upsert) 기록이다.
// 그런데 덮어쓰기 문장은 마지막에 결과를 다시 읽어야 하고(RETURNING),
// form_response_events의 SELECT 정책은 로그인한 사람만 읽을 수 있게 되어 있다.
// 그래서 로그인이 꺼진 폼에서는 브라우저가 직접 쓰면 항상 거부됐다(42501).
//
// SELECT 정책을 열면 작성 중이던 이름·연락처가 아무에게나 보이므로 열 수 없다.
// 대신 이 경로에서 서버 자격(service_role)으로 대신 써준다.
// 나머지 이벤트(started, page_view, field_touch 등)는 덮어쓰기가 아니라서
// 브라우저에서 바로 쓰는 기존 경로를 그대로 쓴다.

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// 덮어쓰기가 필요한 두 가지만 받는다. 다른 이벤트가 이 경로로 새지 않게 한다.
const ALLOWED_EVENT_TYPES = new Set(["draft_saved", "leave"])
// 임시저장 내용에는 작성 중이던 답변이 들어간다. 지나치게 큰 요청은 받지 않는다.
const MAX_BODY_BYTES = 128 * 1024
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function text(status: number, body: string) {
  // 204는 본문을 가질 수 없어서 빈 문자열도 넘기면 안 된다.
  return new NextResponse(body || null, { status, headers: { "cache-control": "no-store" } })
}

function str(value: unknown, max: number) {
  const s = typeof value === "string" ? value.trim() : ""
  return s ? s.slice(0, max) : ""
}

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  if (!supabaseUrl || !serviceRoleKey) return text(503, "not configured")

  const raw = await req.text()
  if (!raw || raw.length > MAX_BODY_BYTES) return text(413, "payload too large")

  let body: any
  try {
    body = JSON.parse(raw)
  } catch {
    return text(400, "invalid json")
  }

  const eventType = str(body?.event_type, 40)
  if (!ALLOWED_EVENT_TYPES.has(eventType)) return text(400, "unsupported event_type")

  // 덮어쓸 대상을 가리키는 id다. 이게 없으면 덮어쓰기가 성립하지 않는다.
  const id = str(body?.id, 64)
  if (!UUID_RE.test(id)) return text(400, "invalid id")

  const formId = str(body?.form_id, 64)
  const row = {
    id,
    form_id: UUID_RE.test(formId) ? formId : null,
    form_slug: str(body?.form_slug, 200) || null,
    session_id: str(body?.session_id, 200) || null,
    event_type: eventType,
    page: Number.isFinite(Number(body?.page)) ? Math.round(Number(body.page)) : null,
    field_id: str(body?.field_id, 200) || null,
    field_label: str(body?.field_label, 300) || null,
    metadata: body?.metadata && typeof body.metadata === "object" ? body.metadata : {},
  }

  const supa = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { error } = await supa.from("form_response_events").upsert(row, { onConflict: "id" })
  if (error) return text(500, "write failed")

  return text(204, "")
}
