# [작업 지시서] CRM 회원가입 임베드 SDK 구현

> 이 문서를 CRM 저장소에 넣고 그대로 구현하면 됩니다.
> 규격은 이미 확정돼 있으니 **임의로 바꾸지 마세요.** 바꿔야 할 이유가 생기면 작업을 멈추고 먼저 알려주세요.

---

## 0. 한 줄 요약

외부 서비스(CatchForm 등)가 **스크립트 두 줄로 CRM 회원가입 폼을 모달로 띄울 수 있게** 하는 임베드 SDK를 만듭니다. 다음(Daum) 우편번호 서비스와 동일한 구조입니다.

외부 서비스에서의 최종 사용 모습:

```html
<script src="https://<CRM_DOMAIN>/embed.js"></script>
<script>
  window.CrmAuth.openSignup({
    source: "catchform",
    onComplete: (user) => console.log("가입 완료", user),
  })
</script>
```

---

## 1. 만들어야 할 것 — 파일 3개

| # | 파일 | 역할 |
|---|---|---|
| 1 | `public/embed.js` | 외부에서 불러가는 SDK. 오버레이 + iframe 생성, postMessage 중계 |
| 2 | `/embed/signup` 페이지 | iframe 안에 렌더링되는 회원가입 폼 |
| 3 | 응답 헤더 설정 | `frame-ancestors` 허용 (없으면 브라우저가 iframe을 차단) |

---

## 2. 확정 규격 (변경 금지)

| 항목 | 값 |
|---|---|
| SDK 경로 | `https://<CRM_DOMAIN>/embed.js` |
| 임베드 페이지 경로 | `https://<CRM_DOMAIN>/embed/signup` |
| 전역 객체 | `window.CrmAuth` |
| 메시지 `source` 값 | `"crm-embed"` (고정 문자열) |
| 메시지 프로토콜 버전 | `1` |
| 허용할 부모 도메인 | `https://catchform.vercel.app` (+ 로컬 개발용 `http://localhost:3002`) |

`<CRM_DOMAIN>`은 실제 배포 도메인으로 치환하세요.

---

## 3. `public/embed.js` — 참조 구현

**이 코드를 그대로 쓰되, `ALLOWED_ORIGIN`만 실제 CRM 도메인으로 바꾸세요.**
외부 의존성(jQuery/React 등)을 추가하지 마세요. 단일 파일, 순수 JS여야 합니다.

```js
;(function () {
  "use strict"

  // ── 설정 ─────────────────────────────────────────────
  var VERSION = "1.0.0"
  var PROTOCOL_VERSION = 1
  // 이 스크립트가 서빙되는 오리진을 자동 추출 (하드코딩보다 안전)
  var CRM_ORIGIN = (function () {
    var el = document.currentScript
    if (el && el.src) {
      try { return new URL(el.src, location.href).origin } catch (e) {}
    }
    return location.origin
  })()
  var EMBED_PATH = "/embed/signup"
  var Z_INDEX = 2147483000

  // ── 내부 상태 ────────────────────────────────────────
  var state = null // { overlay, iframe, options, prevOverflow, onMessage, onKeydown }

  function buildUrl(options) {
    var url = new URL(EMBED_PATH, CRM_ORIGIN)
    url.searchParams.set("v", String(PROTOCOL_VERSION))
    url.searchParams.set("parentOrigin", location.origin)
    if (options.source) url.searchParams.set("source", options.source)
    if (options.brand) url.searchParams.set("brand", options.brand)
    if (options.prefill) {
      try { url.searchParams.set("prefill", btoa(unescape(encodeURIComponent(JSON.stringify(options.prefill))))) } catch (e) {}
    }
    return url.toString()
  }

  function cleanup() {
    if (!state) return
    window.removeEventListener("message", state.onMessage)
    document.removeEventListener("keydown", state.onKeydown)
    if (state.overlay && state.overlay.parentNode) state.overlay.parentNode.removeChild(state.overlay)
    document.documentElement.style.overflow = state.prevOverflow
    state = null
  }

  function closeModal(reason) {
    if (!state) return
    var options = state.options
    cleanup()
    if (reason === "user" && typeof options.onClose === "function") options.onClose()
  }

  function openSignup(options) {
    options = options || {}

    // 중복 호출 방지 — 이미 열려 있으면 기존 모달로 포커스
    if (state) { if (state.iframe) state.iframe.focus(); return }

    var prevOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"

    // 오버레이
    var overlay = document.createElement("div")
    overlay.setAttribute("role", "dialog")
    overlay.setAttribute("aria-modal", "true")
    overlay.style.cssText = [
      "position:fixed", "inset:0", "z-index:" + Z_INDEX,
      "background:rgba(21,24,29,.42)",
      "display:flex", "align-items:center", "justify-content:center",
      "padding:20px", "box-sizing:border-box",
    ].join(";")

    // iframe 래퍼 (모달 카드)
    var frameWrap = document.createElement("div")
    frameWrap.style.cssText = [
      "position:relative", "width:100%", "max-width:440px",
      "max-height:100%", "border-radius:16px", "overflow:hidden",
      "background:#fff", "box-shadow:0 24px 64px -12px rgba(16,24,40,.45)",
    ].join(";")

    var iframe = document.createElement("iframe")
    iframe.src = buildUrl(options)
    iframe.title = "회원가입"
    iframe.setAttribute("allow", "clipboard-write")
    iframe.style.cssText = [
      "display:block", "width:100%", "height:520px",
      "border:0", "transition:height .18s ease",
    ].join(";")

    frameWrap.appendChild(iframe)
    overlay.appendChild(frameWrap)
    document.body.appendChild(overlay)

    // 오버레이 클릭으로 닫기 (카드 내부 클릭은 무시)
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal("user")
    })

    // ESC로 닫기
    function onKeydown(e) { if (e.key === "Escape") closeModal("user") }
    document.addEventListener("keydown", onKeydown)

    // iframe → 부모 메시지 수신
    function onMessage(e) {
      if (e.origin !== CRM_ORIGIN) return              // ★ origin 검증 필수
      var data = e.data
      if (!data || data.source !== "crm-embed") return // ★ 우리 메시지인지 확인
      if (data.version !== PROTOCOL_VERSION) return

      var payload = data.payload || {}
      switch (data.type) {
        case "ready":
        case "resize":
          if (payload.height) {
            var h = Math.max(220, Math.min(Number(payload.height), window.innerHeight - 40))
            iframe.style.height = h + "px"
          }
          break
        case "complete":
          var onComplete = options.onComplete
          cleanup()
          if (typeof onComplete === "function") onComplete(payload)
          break
        case "close":
          closeModal("user")
          break
        case "error":
          var onError = options.onError
          cleanup()
          if (typeof onError === "function") onError(payload)
          break
      }
    }
    window.addEventListener("message", onMessage)

    state = { overlay: overlay, iframe: iframe, options: options, prevOverflow: prevOverflow, onMessage: onMessage, onKeydown: onKeydown }
  }

  window.CrmAuth = {
    version: VERSION,
    openSignup: openSignup,
    close: function () { closeModal("api") },
  }
})()
```

---

## 4. `/embed/signup` 페이지 요구사항

### 4-1. 렌더링

- **GNB·푸터·사이드바 등 레이아웃 크롬 없이 회원가입 폼만** 렌더링
- 모달 폭 기준으로 **최소 320px**에서 깨지지 않을 것
- 가입 성공 후 **리다이렉트 금지** — 반드시 `postMessage`로 결과 전달

### 4-2. 쿼리 파라미터 처리

| 파라미터 | 설명 |
|---|---|
| `v` | 프로토콜 버전. `1`이 아니면 `error` 메시지 전송 |
| `parentOrigin` | 부모 오리진. **허용 목록에 없으면 폼을 렌더링하지 말 것** |
| `source` | 유입 출처 (예: `catchform`) — 가입 레코드에 저장 |
| `brand` | `SNIPERFACTORY` / `INSIDEOUT` / `SFACSPACE` — 가입 레코드에 저장 |
| `prefill` | base64(JSON) — `{ name?, email?, phone? }` 폼 초기값 |

### 4-3. 부모로 메시지 보내기 — 참조 구현

```js
const ALLOWED_PARENT_ORIGINS = [
  "https://catchform.vercel.app",
  "http://localhost:3002", // 개발용. 운영 배포 시 제거 검토
]

const params = new URLSearchParams(location.search)
const parentOrigin = params.get("parentOrigin") || ""

// ★ 허용되지 않은 부모면 아무것도 렌더링하지 않음
if (!ALLOWED_PARENT_ORIGINS.includes(parentOrigin)) {
  document.body.textContent = "허용되지 않은 접근입니다."
  throw new Error("disallowed parent origin: " + parentOrigin)
}

function send(type, payload) {
  parent.postMessage(
    { source: "crm-embed", version: 1, type, payload },
    parentOrigin, // ★ "*" 절대 금지
  )
}

// 렌더링 완료 시
send("ready", { height: document.documentElement.scrollHeight })

// 높이 변경 감지 (단계 이동, 에러 메시지 노출 등)
new ResizeObserver(() => {
  send("resize", { height: document.documentElement.scrollHeight })
}).observe(document.body)

// 가입 성공 시
send("complete", { userId, email, name, token })

// 닫기 버튼
send("close")

// 오류
send("error", { code: "SIGNUP_FAILED", message: "가입 처리 중 오류가 발생했습니다." })
```

---

## 5. postMessage 프로토콜 (정확한 규격)

모든 메시지는 **iframe → 부모** 단방향입니다.

```ts
type EmbedMessage = {
  source: "crm-embed"   // 고정
  version: 1            // 고정
  type: "ready" | "resize" | "complete" | "close" | "error"
  payload?: object
}
```

| type | 시점 | payload |
|---|---|---|
| `ready` | 폼 렌더링 완료 | `{ height: number }` |
| `resize` | 콘텐츠 높이 변경 | `{ height: number }` |
| `complete` | 가입 성공 | `{ userId: string, email: string, name?: string, token?: string }` |
| `close` | 사용자가 닫기 클릭 | 없음 |
| `error` | 오류 발생 | `{ code: string, message: string }` |

`token`은 가입 직후 자동 로그인용입니다. **발급이 가능하면 반드시 포함해 주세요.** 불가하면 생략하고 그 사실을 알려주세요.

---

## 6. 보안 헤더 설정

`/embed/signup` 응답에 아래 헤더가 **반드시** 있어야 합니다. 없으면 브라우저가 iframe을 차단합니다.

```
Content-Security-Policy: frame-ancestors https://catchform.vercel.app http://localhost:3002
```

- 기존에 `X-Frame-Options: DENY` 또는 `SAMEORIGIN`이 걸려 있다면 **`/embed/*` 경로에서는 제거**해야 합니다
- 구형 `X-Frame-Options: ALLOW-FROM`은 최신 브라우저에서 동작하지 않습니다. `frame-ancestors`를 쓰세요
- 와일드카드 `*` 금지 — 반드시 도메인 화이트리스트

### 프레임워크별 예시

**Next.js** (`next.config.js`)
```js
module.exports = {
  async headers() {
    return [{
      source: "/embed/:path*",
      headers: [{
        key: "Content-Security-Policy",
        value: "frame-ancestors https://catchform.vercel.app http://localhost:3002",
      }],
    }]
  },
}
```

**Express**
```js
app.use("/embed", (req, res, next) => {
  res.removeHeader("X-Frame-Options")
  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors https://catchform.vercel.app http://localhost:3002",
  )
  next()
})
```

**nginx**
```nginx
location /embed/ {
  add_header Content-Security-Policy "frame-ancestors https://catchform.vercel.app http://localhost:3002" always;
}
```

### 쿠키 (세션 사용 시)

크로스 도메인 iframe에서는 아래가 없으면 쿠키가 전송되지 않습니다.

```
Set-Cookie: session=...; SameSite=None; Secure; HttpOnly
```

`SameSite=None`은 **`Secure` 없이는 무시**됩니다. HTTPS 필수입니다.

### `embed.js` 캐시

```
Cache-Control: public, max-age=300
```

긴급 수정을 반영할 수 있도록 5분 이내로 유지하세요. 장기 캐시 금지.

---

## 7. 완료 조건 (Acceptance Criteria)

아래가 **전부** 통과해야 완료입니다.

- [ ] `https://<CRM_DOMAIN>/embed.js` 가 200으로 응답하고 `window.CrmAuth`가 등록된다
- [ ] `CrmAuth.openSignup({})` 호출 시 오버레이 + 회원가입 폼이 모달로 뜬다
- [ ] `/embed/signup` 직접 접속 시(부모 없음) 폼이 렌더링되지 않는다
- [ ] 허용되지 않은 도메인에서 임베드하면 브라우저 콘솔에 CSP 차단 오류가 뜨고 폼이 안 보인다
- [ ] 폼 높이가 바뀌면 모달 높이가 따라 변한다 (단계 이동, 유효성 오류 노출 등)
- [ ] ESC 키 / 오버레이 클릭으로 닫히고 `onClose`가 호출된다
- [ ] 모달이 열린 동안 뒤 배경이 스크롤되지 않는다
- [ ] 가입 성공 시 `onComplete`가 `{ userId, email }` 이상을 담아 호출된다
- [ ] `openSignup`을 연속 두 번 호출해도 모달이 겹치지 않는다
- [ ] 모바일 폭 320px에서 폼이 깨지지 않는다
- [ ] `source`, `brand` 값이 가입 레코드에 저장된다
- [ ] `prefill`로 넘긴 값이 폼에 채워진다

---

## 8. 로컬 테스트 방법

CRM을 로컬에서 띄운 뒤, 아래 HTML을 아무 폴더에 저장하고 `http://localhost:3002`로 서빙해서 확인하세요.
(`python3 -m http.server 3002` 등 아무 정적 서버나 사용 가능)

```html
<!doctype html>
<html>
<body style="font-family:sans-serif;padding:40px">
  <button id="btn" style="height:44px;padding:0 20px;font-size:15px">회원가입 테스트</button>
  <pre id="log" style="margin-top:20px;padding:12px;background:#f4f5f7;border-radius:8px"></pre>

  <script src="http://localhost:3000/embed.js"></script>
  <script>
    const log = (label, data) => {
      document.getElementById("log").textContent += label + " " + JSON.stringify(data ?? null) + "\n"
    }
    document.getElementById("btn").onclick = () => {
      window.CrmAuth.openSignup({
        source: "catchform",
        brand: "SNIPERFACTORY",
        prefill: { email: "test@example.com" },
        onComplete: (u) => log("✅ complete", u),
        onClose:    ()  => log("⚪ close"),
        onError:    (e) => log("❌ error", e),
      })
    }
  </script>
</body>
</html>
```

CRM 로컬 포트가 3000이 아니면 `script src`를 맞게 바꾸고, `ALLOWED_PARENT_ORIGINS`와 `frame-ancestors`에 `http://localhost:3002`가 들어있는지 확인하세요.

---

## 9. 하지 말아야 할 것

| ❌ | 이유 |
|---|---|
| `postMessage(msg, "*")` | 아무 사이트나 가입 결과를 가로챌 수 있음 |
| `origin` 검증 생략 | 아무 사이트나 "가입 완료" 메시지를 위조할 수 있음 |
| `frame-ancestors *` | 아무 사이트나 CRM 로그인 폼을 위장해 띄울 수 있음 (클릭재킹) |
| 가입 성공 후 `location.href` 리다이렉트 | iframe 안에서만 이동해 부모가 결과를 알 수 없음 |
| `embed.js`에 라이브러리 번들 | 외부 서비스 페이지에 로드되므로 용량·충돌 위험 |
| `embed.js` 장기 캐시 | 긴급 수정 반영 불가 |
| 임베드 페이지에 GNB/푸터 포함 | 모달 안에서 레이아웃이 깨짐 |

---

## 10. 완료 후 회신해 주세요

1. 실제 `CRM_DOMAIN` (운영 / 스테이징)
2. `token` 발급 가능 여부 — 불가하면 CatchForm이 별도 로그인을 유도해야 함
3. `complete` payload에 추가로 담기는 필드가 있으면 목록
4. 배포 완료 시점

CatchForm 쪽은 이 회신을 받는 즉시 연결 작업을 진행합니다.
