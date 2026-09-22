// 회사 GA4(구글 애널리틱스)로 폼 방문과 제출을 보낸다.
// 캐치폼 자체 분석(form_response_events)과는 별개로, 회사 GA에서도 폼 유입을 보기 위한 용도다.
// 응답자가 입력한 값(이름·연락처 등)은 절대 보내지 않는다.
//
// 브랜드마다 GA4 속성이 다르다. 폼은 모두 catchform 주소에서 열리지만,
// 상세페이지가 있는 브랜드 속성으로 보내야 상세페이지 → 폼 → 전환이 한 줄로 이어진다.
// (이어 보려면 각 속성의 `태그 설정 구성 → 도메인 구성`에 catchform 주소도 넣어야 한다.)
const GA_MEASUREMENT_IDS: Record<string, string> = {
  SNIPERFACTORY: "G-WRYQ08FX80",
  SFACSPACE: "G-WRYQ08FX80",
  INSIDEOUT: "G-QE42NZWJ2H",
}
const GA_DEFAULT_MEASUREMENT_ID = "G-WRYQ08FX80"

function measurementIdFor(brand: unknown) {
  const key = String(brand || "").trim().toUpperCase()
  return GA_MEASUREMENT_IDS[key] || GA_DEFAULT_MEASUREMENT_ID
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    __catchformGoogleTagLoaded?: boolean
    __catchformGoogleTagId?: string
  }
}

// 로컬 개발 서버에서 테스트한 방문이 회사 GA 수치에 섞이지 않게 한다.
function isLocalHost() {
  const host = window.location.hostname
  return host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")
}

export function initGoogleTag(brand?: unknown) {
  if (typeof window === "undefined" || typeof document === "undefined") return
  if (window.__catchformGoogleTagLoaded || isLocalHost()) return
  const measurementId = measurementIdFor(brand)
  window.__catchformGoogleTagLoaded = true
  window.__catchformGoogleTagId = measurementId
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // gtag.js는 arguments 객체 그대로를 dataLayer에 넣어야 인식한다.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  window.gtag("js", new Date())
  // page_view는 config에서 자동으로 한 번 보낸다. utm_* 값도 GA가 주소에서 알아서 읽는다.
  window.gtag("config", measurementId)
  const script = document.createElement("script")
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)
}

// 제출 완료. 모든 폼은 catchform_submit으로 보내고 (GA 자동 수집 이벤트 form_submit과 섞이지 않게 이름을 따로 둔다),
// 전환으로 지정된 폼(정식 신청 또는 `전환` 체크)은 GA 권장 전환 이벤트인 generate_lead도 함께 보낸다.
export function trackGoogleSubmit(isConversion: boolean, data: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !window.gtag) return
  // 어느 속성으로 보낼지 명시한다. 나중에 GTM 같은 다른 태그가 같은 페이지에 붙어도 엉뚱한 속성으로 새지 않는다.
  const sendTo = window.__catchformGoogleTagId || GA_DEFAULT_MEASUREMENT_ID
  const payload = { ...data, send_to: sendTo }
  window.gtag("event", "catchform_submit", payload)
  if (isConversion) window.gtag("event", "generate_lead", payload)
}
