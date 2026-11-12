import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import {
  MAX_MESSAGE_LENGTH,
  SMS_BYTE_LIMIT,
  alimtalkFailoverMessage,
  byteLength,
  fillAlimtalkBody,
  fillSmsTemplate,
  notifyChannel,
  type AlimtalkButton,
  type NotifyConfig,
} from "@/lib/notify"

// 응답이 저장된 뒤 신청자에게 접수 안내를 보낸다. 알림톡이 기본이고, 예전 폼은 문자로 나간다.
//
// 알리고는 고정 IP에서만 호출을 받는데 Vercel은 요청마다 IP가 바뀐다.
// 그래서 고정 IP를 가진 사내 중계 서버를 거친다. 알리고 키(apikey·userid·senderkey)는
// 중계 서버가 들고 있고 캐치폼은 가지고 있지 않다. (CRM도 같은 경로를 쓴다)
//
// 보낼 내용과 받을 번호를 브라우저에서 받지 않는다. 그렇게 하면 이 주소를 아는 사람이
// 우리 계정으로 아무 번호에나 보낼 수 있다. 브라우저는 "어느 응답인지"만 알려주고,
// 문구는 폼 설정에서, 번호는 저장된 응답에서 서버가 직접 읽는다.
//
// 접수 안내는 정보성 메시지라 마케팅 수신동의 없이 보낼 수 있다.
// 다만 광고 문구를 섞으면 광고성이 되어 동의가 필요해지므로 문구는 접수 확인에만 쓴다.

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const RELAY_SMS_PATH = "/aligo/send-sms"
const RELAY_ALIMTALK_PATH = "/aligo/send-alimtalk"
const ALLOWED_TABLES = new Set(["applications", "company_applications"])
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// 알림톡 제목(subject_1)은 카카오에서 짧게 받는다. 넘치면 발송이 거부되므로 잘라서 보낸다.
const ALIMTALK_SUBJECT_LIMIT = 50

// 폼 설정에서 고른 발신번호를 그대로 믿지 않는다. 알리고에 등록된 번호가 아니면 발송이 실패하고,
// 설정값을 누가 바꿔도 허용 목록 밖으로는 나가지 않아야 한다. 목록은 환경 변수 한 줄로 관리한다.
// 형식: 01012345678:표시이름|0212345678:표시이름  (이름에 쉼표가 들어가서 구분자는 | 를 쓴다)
function allowedSenders(): string[] {
  return String(process.env.NEXT_PUBLIC_SMS_SENDERS || "")
    .split("|")
    .map(entry => entry.split(":")[0].replace(/[^\d]/g, ""))
    .filter(Boolean)
}

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: { "cache-control": "no-store" } })
}

// 010-1234-5678, +82 10 1234 5678 같은 입력을 01012345678로 맞춘다.
function normalizePhone(raw: unknown) {
  let digits = String(raw ?? "").replace(/[^\d]/g, "")
  if (digits.startsWith("82")) digits = "0" + digits.slice(2)
  if (!/^01[016789]\d{7,8}$/.test(digits)) return ""
  return digits
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

// 버튼은 승인된 템플릿에 들어 있는 것만 의미가 있다. 형태만 맞춰서 그대로 넘긴다.
function cleanButtons(raw: unknown): AlimtalkButton[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item: any) => {
      const name = String(item?.name || "").trim().slice(0, 28)
      const linkType = item?.linkType === "AC" ? "AC" : "WL"
      if (!name) return null
      if (linkType === "AC") return { name, linkType } as AlimtalkButton
      const linkMo = String(item?.linkMo || "").trim()
      const linkPc = String(item?.linkPc || "").trim()
      if (!/^https?:\/\//i.test(linkMo)) return null
      const button: AlimtalkButton = { name, linkType: "WL", linkMo }
      if (/^https?:\/\//i.test(linkPc)) button.linkPc = linkPc
      return button
    })
    .filter(Boolean)
    .slice(0, 5) as AlimtalkButton[]
}

type RelayOutcome = { ok: boolean; detail: string; error?: string }

async function callRelay(path: string, payload: Record<string, unknown>): Promise<RelayOutcome | null> {
  const relayUrl = String(process.env.SMS_RELAY_URL || "").replace(/\/+$/, "")
  const relayToken = process.env.SMS_RELAY_TOKEN || ""
  const res = await fetch(relayUrl + path, {
    method: "POST",
    headers: { "content-type": "application/json", "x-internal-token": relayToken },
    body: JSON.stringify(payload),
  })
  let result: any = await res.json().catch(() => ({}))
  // 중계 서버는 실패해도 HTTP 200으로 답할 수 있다. ok 값으로 판별한다.
  if (!res.ok && result?.ok === undefined) result = { ok: false, error: `중계 서버 응답 오류 (status=${res.status})` }
  if (result?.ok === true) return { ok: true, detail: "" }
  return { ok: false, detail: "", error: String(result?.error || result?.message || "알 수 없는 오류") }
}

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  const relayUrl = String(process.env.SMS_RELAY_URL || "").replace(/\/+$/, "")
  const relayToken = process.env.SMS_RELAY_TOKEN || ""
  if (!supabaseUrl || !serviceRoleKey) return json(503, { error: "supabase not configured" })
  if (!relayUrl || !relayToken) return json(503, { error: "sms relay not configured" })

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
  const fail = async (message: string) => {
    await supa.from(table).update({ notify_result: message.slice(0, 180) }).eq("id", responseId)
  }

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

  const notify: NotifyConfig = ((formRow as any)?.notify || {}) as NotifyConfig
  if (!notify.enabled) return json(200, { skipped: "notify disabled" })

  const answers = answersOf(row)
  // 연락처로 쓸 질문을 폼에서 지정할 수 있다. 없으면 응답의 연락처 칸을 쓴다.
  const phoneSource = notify.phoneQuestion ? answers[String(notify.phoneQuestion)] : row.phone
  const receiver = normalizePhone(phoneSource || row.phone)
  if (!receiver) return json(200, { skipped: "no valid phone" })

  // 폼에서 고른 발신번호를 쓰되, 허용 목록에 없으면 거부한다.
  const allowed = allowedSenders()
  const picked = String(notify.sender || "").replace(/[^\d]/g, "")
  const sender = picked && allowed.includes(picked) ? picked : allowed[0] || ""
  if (!sender) {
    await fail("발송 실패: 쓸 수 있는 발신번호가 없습니다.")
    return json(503, { error: "no sender configured" })
  }

  const testMode = process.env.SMS_TEST_MODE === "Y"
  const channel = notifyChannel(notify)

  // ── 알림톡 ───────────────────────────────────────────────────────────────
  if (channel === "alimtalk") {
    const tplCode = String(notify.tplCode || "").trim()
    const tplBody = String(notify.tplBody || "")
    if (!tplCode) return json(200, { skipped: "template code empty" })
    if (!tplBody.trim()) return json(200, { skipped: "template body empty" })

    const { text, missing } = fillAlimtalkBody(tplBody, notify.varMap, answers)
    // 알림톡은 승인된 템플릿과 글자가 하나라도 다르면 거부된다. 변수를 못 채운 채 보내면
    // "#{고객명}" 이 그대로 나가 거부되고, 대체문자도 그 상태로 나간다. 보내기 전에 멈춘다.
    if (missing.length) {
      await fail(`발송 안 함: 템플릿 변수 ${missing.map(v => `#{${v}}`).join(", ")} 에 넣을 값이 없습니다.`)
      return json(200, { skipped: "template variables unfilled", missing })
    }

    const message = text.slice(0, MAX_MESSAGE_LENGTH)
    const subject = (String(notify.tplTitle || "").trim() || "접수 안내").slice(0, ALIMTALK_SUBJECT_LIMIT)
    // 대체문자는 기본으로 켠다. 카톡을 안 쓰거나 채널을 차단한 사람에게도 접수 사실은 알려야 한다.
    const useFailover = notify.failover !== false
    const failoverText = useFailover
      ? alimtalkFailoverMessage(notify, message, answers).trim().slice(0, MAX_MESSAGE_LENGTH)
      : ""

    let outcome: RelayOutcome | null = null
    try {
      outcome = await callRelay(RELAY_ALIMTALK_PATH, {
        tplCode,
        receiver,
        recvname: String(row.name || "").slice(0, 20),
        subject,
        message,
        senderOverride: sender,
        failover: useFailover && !!failoverText,
        fsubject: useFailover ? subject : undefined,
        fmessage: useFailover && failoverText ? failoverText : undefined,
        buttons: cleanButtons(notify.buttons),
        testMode,
      })
    } catch (e) {
      await fail("요청 실패: " + String((e as any)?.message || e))
      return json(502, { error: "relay request failed" })
    }

    const ok = outcome?.ok === true
    await supa.from(table).update({
      notified_at: ok ? new Date().toISOString() : null,
      notify_result: ok
        ? `발송 완료 (알림톡${useFailover && failoverText ? " · 실패 시 문자 대체" : ""})`
        : `발송 실패: ${String(outcome?.error || "알 수 없는 오류").slice(0, 180)}`,
    }).eq("id", responseId)

    if (!ok) return json(502, { error: "relay rejected", message: outcome?.error })
    return json(200, { sent: true, type: "AT", sender })
  }

  // ── 문자 (예전 폼) ────────────────────────────────────────────────────────
  const template = String(notify.message || "").trim()
  if (!template) return json(200, { skipped: "message empty" })

  const message = fillSmsTemplate(template, answers).trim().slice(0, MAX_MESSAGE_LENGTH)
  if (!message) return json(200, { skipped: "message empty after fill" })

  // 알리고는 90바이트를 넘으면 LMS로 자동 전환된다. 요금이 달라지므로 직접 정해서 보낸다.
  const isLms = byteLength(message) > SMS_BYTE_LIMIT
  let outcome: RelayOutcome | null = null
  try {
    outcome = await callRelay(RELAY_SMS_PATH, {
      phones: [receiver],
      msg: message,
      msgType: isLms ? "LMS" : "SMS",
      // LMS는 제목이 들어간다. 비워 두면 발신번호가 제목처럼 보여서 알아보기 어렵다.
      title: isLms ? String(notify.title || "접수 안내").slice(0, 40) : undefined,
      senderOverride: sender,
      // 실제 발송 없이 연동만 확인할 때 쓴다. 과금되지 않는다.
      testMode,
    })
  } catch (e) {
    await fail("요청 실패: " + String((e as any)?.message || e))
    return json(502, { error: "relay request failed" })
  }

  const ok = outcome?.ok === true
  await supa.from(table).update({
    notified_at: ok ? new Date().toISOString() : null,
    notify_result: ok
      ? `발송 완료 (${isLms ? "LMS" : "SMS"})`
      : `발송 실패: ${String(outcome?.error || "알 수 없는 오류").slice(0, 180)}`,
  }).eq("id", responseId)

  if (!ok) return json(502, { error: "relay rejected", message: outcome?.error })
  return json(200, { sent: true, type: isLms ? "LMS" : "SMS", sender })
}
