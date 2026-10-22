import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

// 응답이 저장된 뒤 신청자에게 접수 안내 문자를 보낸다. (알리고 https://apis.aligo.in/send/)
//
// 보낼 내용과 받을 번호를 브라우저에서 받지 않는다. 그렇게 하면 이 주소를 아는 사람이
// 우리 계정으로 아무 번호에나 문자를 보낼 수 있다. 브라우저는 "어느 응답인지"만 알려주고,
// 문구는 폼 설정에서, 번호는 저장된 응답에서 서버가 직접 읽는다.
//
// 접수 안내는 정보성 메시지라 마케팅 수신동의 없이 보낼 수 있다.
// 다만 광고 문구를 섞으면 광고성이 되어 동의가 필요해지므로 문구는 접수 확인에만 쓴다.

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const ALIGO_SEND_URL = "https://apis.aligo.in/send/"
const ALLOWED_TABLES = new Set(["applications", "company_applications"])
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// 알리고는 90바이트를 넘으면 LMS로 자동 전환된다. 요금이 달라지므로 직접 정해서 보낸다.
const SMS_BYTE_LIMIT = 90
const MAX_MESSAGE_LENGTH = 2000

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: { "cache-control": "no-store" } })
}

function byteLength(value: string) {
  // 한글은 2바이트로 센다. 알리고 기준과 맞춘다.
  return [...value].reduce((sum, ch) => sum + (ch.charCodeAt(0) > 0x7f ? 2 : 1), 0)
}

// 010-1234-5678, +82 10 1234 5678 같은 입력을 01012345678로 맞춘다.
function normalizePhone(raw: unknown) {
  let digits = String(raw ?? "").replace(/[^\d]/g, "")
  if (digits.startsWith("82")) digits = "0" + digits.slice(2)
  if (!/^01[016789]\d{7,8}$/.test(digits)) return ""
  return digits
}

// {이름} 같은 자리를 응답 값으로 바꾼다. 없는 값은 빈 문자열로 둔다.
function fillTemplate(template: string, answers: Record<string, string>) {
  return template.replace(/\{([^{}]{1,40})\}/g, (_match, key) => answers[String(key).trim()] ?? "")
}

function answersOf(row: any) {
  const out: Record<string, string> = {}
  const formData = Array.isArray(row?.form_data) ? row.form_data : []
  formData.forEach((item: any) => {
    const question = String(item?.question || "").trim()
    if (!question || question.startsWith("_")) return
    const answer = Array.isArray(item?.answer) ? item.answer.join(", ") : String(item?.answer ?? "")
    out[question] = answer
  })
  // 이름·연락처는 따로 저장되는 폼도 있어서 직접 채워 둔다.
  if (row?.name) out["이름"] = String(row.name)
  if (row?.phone) out["연락처"] = String(row.phone)
  return out
}

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  const apiKey = process.env.ALIGO_API_KEY || ""
  const userId = process.env.ALIGO_USER_ID || ""
  const sender = process.env.ALIGO_SENDER || ""
  if (!supabaseUrl || !serviceRoleKey) return json(503, { error: "supabase not configured" })
  if (!apiKey || !userId || !sender) return json(503, { error: "aligo not configured" })

  let body: any
  try {
    body = await req.json()
  } catch {
    return json(400, { error: "invalid json" })
  }

  const table = String(body?.table || "")
  const responseId = String(body?.responseId || "")
  if (!ALLOWED_TABLES.has(table)) return json(400, { error: "unsupported table" })
  if (!UUID_RE.test(responseId)) return json(400, { error: "invalid responseId" })

  const supa = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: row, error: rowError } = await supa
    .from(table)
    .select("id,form_id,name,phone,form_data,notified_at")
    .eq("id", responseId)
    .single()
  if (rowError || !row) return json(404, { error: "response not found" })
  // 같은 응답에 두 번 보내지 않는다. 재시도나 중복 호출로 두 통이 가면 비용도 신뢰도 잃는다.
  if (row.notified_at) return json(200, { skipped: "already notified" })
  if (!row.form_id) return json(400, { error: "form_id missing" })

  const { data: formRow, error: formError } = await supa
    .from("form_configs")
    .select("notify:config->notify")
    .eq("id", row.form_id)
    .single()
  if (formError) return json(404, { error: "form not found" })

  const notify: any = (formRow as any)?.notify || {}
  if (!notify.enabled) return json(200, { skipped: "notify disabled" })

  const template = String(notify.message || "").trim()
  if (!template) return json(200, { skipped: "message empty" })

  const answers = answersOf(row)
  // 연락처로 쓸 질문을 폼에서 지정할 수 있다. 없으면 응답의 연락처 칸을 쓴다.
  const phoneSource = notify.phoneQuestion ? answers[String(notify.phoneQuestion)] : row.phone
  const receiver = normalizePhone(phoneSource || row.phone)
  if (!receiver) return json(200, { skipped: "no valid phone" })

  const message = fillTemplate(template, answers).trim().slice(0, MAX_MESSAGE_LENGTH)
  if (!message) return json(200, { skipped: "message empty after fill" })

  const isLms = byteLength(message) > SMS_BYTE_LIMIT
  const params = new URLSearchParams({
    key: apiKey,
    user_id: userId,
    sender,
    receiver,
    msg: message,
    msg_type: isLms ? "LMS" : "SMS",
  })
  // LMS는 제목이 들어간다. 비워 두면 발신번호가 제목처럼 보여서 알아보기 어렵다.
  if (isLms) params.set("title", String(notify.title || "접수 안내").slice(0, 40))
  // 실제 발송 없이 연동만 확인할 때 쓴다. 과금되지 않는다.
  if (process.env.ALIGO_TEST_MODE === "Y") params.set("testmode_yn", "Y")

  let result: any = null
  try {
    const res = await fetch(ALIGO_SEND_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    })
    result = await res.json()
  } catch (e) {
    await supa.from(table).update({ notify_result: "요청 실패: " + String((e as any)?.message || e).slice(0, 180) }).eq("id", responseId)
    return json(502, { error: "aligo request failed" })
  }

  // 알리고는 실패해도 HTTP 200으로 답한다. result_code로 판별해야 한다. (1 이상이 성공)
  const code = Number(result?.result_code)
  const ok = Number.isFinite(code) && code > 0
  await supa.from(table).update({
    notified_at: ok ? new Date().toISOString() : null,
    notify_result: ok
      ? `발송 완료 (${isLms ? "LMS" : "SMS"})`
      : `발송 실패: ${String(result?.message || "알 수 없는 오류").slice(0, 180)}`,
  }).eq("id", responseId)

  if (!ok) return json(502, { error: "aligo rejected", code, message: result?.message })
  return json(200, { sent: true, type: isLms ? "LMS" : "SMS", msgId: result?.msg_id })
}
