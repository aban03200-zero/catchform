// 회사 GA4(구글 애널리틱스)로 폼 방문과 제출을 보낸다.
// 캐치폼 자체 분석(form_response_events)과는 별개로, 회사 GA에서도 폼 유입을 보기 위한 용도다.
// 응답자가 입력한 값(이름·연락처 등)은 절대 보내지 않는다.
const GA_MEASUREMENT_ID = "G-WRYQ08FX80"

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    __catchformGoogleTagLoaded?: boolean
  }
}

// 로컬 개발 서버에서 테스트한 방문이 회사 GA 수치에 섞이지 않게 한다.
function isLocalHost() {
  const host = window.location.hostname
  return host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")
}

export function initGoogleTag() {
  if (typeof window === "undefined" || typeof document === "undefined") return
  if (window.__catchformGoogleTagLoaded || isLocalHost()) return
  window.__catchformGoogleTagLoaded = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // gtag.js는 arguments 객체 그대로를 dataLayer에 넣어야 인식한다.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  window.gtag("js", new Date())
  // page_view는 config에서 자동으로 한 번 보낸다. utm_* 값도 GA가 주소에서 알아서 읽는다.
  window.gtag("config", GA_MEASUREMENT_ID)
  const script = document.createElement("script")
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)
}

// 제출 완료. 모든 폼은 catchform_submit으로 보내고 (GA 자동 수집 이벤트 form_submit과 섞이지 않게 이름을 따로 둔다),
// 전환으로 지정된 폼(정식 신청 또는 `전환` 체크)은 GA 권장 전환 이벤트인 generate_lead도 함께 보낸다.
export function trackGoogleSubmit(isConversion: boolean, data: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !window.gtag) return
  window.gtag("event", "catchform_submit", data)
  if (isConversion) window.gtag("event", "generate_lead", data)
}
