// 접수 안내 발송에 쓰는 공통 규칙.
//
// 관리자 화면(FormAdmin)과 발송 서버(app/api/notify-applicant)가 같은 규칙을 써야 한다.
// 한쪽에만 고치면 "미리보기에서는 멀쩡한데 실제로는 다르게 나가는" 상태가 된다.
// 그래서 양쪽이 이 파일 하나만 쓴다.
//
// 문자와 알림톡은 변수 표기가 다르다. 섞으면 안 된다.
//   문자   {질문 제목}   — 우리가 정한 표기. 아무 문구나 보낼 수 있다.
//   알림톡 #{변수명}     — 카카오가 정한 표기. 승인받은 템플릿과 글자가 하나도 달라선 안 된다.

export type AlimtalkButton = {
  name: string
  // WL = 웹링크, AC = 채널 추가. 그 밖의 유형은 승인 템플릿에서 쓸 일이 없어 받지 않는다.
  linkType: "WL" | "AC"
  linkMo?: string
  linkPc?: string
}

export type NotifyConfig = {
  enabled?: boolean
  channel?: "sms" | "alimtalk"
  phoneQuestion?: string
  sender?: string
  // 문자
  message?: string
  title?: string
  // 알림톡
  tplCode?: string
  tplTitle?: string
  tplBody?: string
  varMap?: Record<string, string>
  failover?: boolean
  failoverMessage?: string
  buttons?: AlimtalkButton[]
}

// 예전 폼에는 channel 이 없다. 템플릿 없이 문구만 있으면 문자로 쓰던 폼이므로 그대로 문자로 둔다.
// 이걸 안 하면 기존 폼이 전부 알림톡으로 바뀌어, 템플릿이 없어 한 통도 못 나간다.
export function notifyChannel(notify: NotifyConfig | null | undefined): "sms" | "alimtalk" {
  const channel = String(notify?.channel || "")
  if (channel === "sms" || channel === "alimtalk") return channel
  if (!String(notify?.tplCode || "").trim() && String(notify?.message || "").trim()) return "sms"
  return "alimtalk"
}

// 알림톡 템플릿 본문에서 #{변수} 를 찾는다. 중복은 한 번만 센다.
export function alimtalkVars(body: string): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const match of String(body || "").matchAll(/#\{([^{}]{1,40})\}/g)) {
    const name = String(match[1]).trim()
    if (!name || seen.has(name)) continue
    seen.add(name)
    out.push(name)
  }
  return out
}

// 문자 문구의 {질문 제목} 을 응답 값으로 바꾼다. 없는 값은 빈 문자열로 둔다.
export function fillSmsTemplate(template: string, answers: Record<string, string>) {
  return String(template || "").replace(/\{([^{}]{1,40})\}/g, (_match, key) => answers[String(key).trim()] ?? "")
}

// varMap 값이 "=" 로 시작하면 질문이 아니라 고정 문구다.
//
// 템플릿 승인에 며칠이 걸려서 폼마다 템플릿을 따로 만들 수 없다. 템플릿 하나를 여러 폼이
// 돌려 쓰는데, #{과정명} 처럼 폼 안에서는 늘 같지만 폼마다 다른 값이 있다. 그건 질문이 아니라
// 폼 설정에 적어 둔 고정 문구로 채운다.
export const FIXED_VALUE_PREFIX = "="
export function isFixedValue(mapped: string | undefined) {
  return String(mapped || "").startsWith(FIXED_VALUE_PREFIX)
}
export function fixedValueText(mapped: string | undefined) {
  return isFixedValue(mapped) ? String(mapped).slice(FIXED_VALUE_PREFIX.length) : ""
}

// 알림톡 본문의 #{변수} 를 채운다.
//
// 변수 이름은 카카오 템플릿의 것이고 우리 질문 제목과 다를 수 있어서, 어떤 질문 값을 넣을지
// varMap 으로 따로 이어 준다. (예: varMap["고객명"] = "성함", varMap["과정명"] = "=AID 30+ 집중캠프")
//
// 채우지 못한 변수는 빈칸으로 두지 않고 그대로 남긴다. 알림톡은 승인 템플릿과 글자가 다르면
// 발송이 거부되는데, 빈칸으로 두면 어디가 비었는지 모른 채 "알 수 없는 오류"만 돌아온다.
// 남겨 두면 호출하는 쪽이 missing 을 보고 발송 전에 멈출 수 있다.
export function fillAlimtalkBody(
  body: string,
  varMap: Record<string, string> | undefined,
  answers: Record<string, string>,
) {
  const missing: string[] = []
  const text = String(body || "").replace(/#\{([^{}]{1,40})\}/g, (match, rawKey) => {
    const name = String(rawKey).trim()
    const mapped = String(varMap?.[name] || "")
    const value = isFixedValue(mapped)
      ? fixedValueText(mapped).trim()
      : mapped.trim()
        ? String(answers[mapped.trim()] ?? "").trim()
        : ""
    if (!value) {
      if (!missing.includes(name)) missing.push(name)
      return match
    }
    return value
  })
  return { text, missing }
}

// 알림톡이 막혔을 때 대신 나갈 문자 문구.
// 따로 적지 않았으면 알림톡 본문을 그대로 쓴다. 두 번 적게 하면 한쪽만 고치고 잊어버린다.
export function alimtalkFailoverMessage(
  notify: NotifyConfig,
  filledBody: string,
  answers: Record<string, string>,
) {
  const custom = String(notify.failoverMessage || "").trim()
  return custom ? fillSmsTemplate(custom, answers) : filledBody
}

// 한글 2바이트. 알리고가 단문/장문을 가르는 기준과 맞춘다.
export function byteLength(value: string) {
  return [...String(value || "")].reduce((sum, ch) => sum + (ch.charCodeAt(0) > 0x7f ? 2 : 1), 0)
}

export const SMS_BYTE_LIMIT = 90
export const MAX_MESSAGE_LENGTH = 2000
