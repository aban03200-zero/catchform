# SniperFactory `/apply` 연동 가이드

SniperFactory 사이트에서 InsideOut과 같은 CatchForm 디자인으로 `/apply` 페이지를 열기 위한 개발자 전달용 문서입니다.

## 추천 방식

가장 안전한 방식은 **CatchForm Web을 별도 배포 앱으로 유지하고, SniperFactory `/apply`에서 해당 폼 URL을 보여주는 방식**입니다.

이유:

- CatchForm의 폼 디자인과 로직을 한 곳에서만 관리할 수 있음
- SniperFactory 사이트에 5천 줄짜리 폼 코드를 다시 복사하지 않아도 됨
- 응답/분석/시트 연동이 같은 Supabase config를 그대로 사용함

## 디자인/동작이 다르게 보이는 이유

SniperFactory 쪽에서 `form_configs.config` 데이터만 가져와서 별도 컴포넌트로 다시 렌더하면 CatchForm과 다르게 보입니다.

특히 아래 현상이 보이면 CatchForm 원본 렌더러가 아니라 다른 구현을 쓰고 있을 가능성이 큽니다.

- 제출 성공 시 CatchForm 모달이 아니라 페이지 안에 `신청 완료` 화면이 표시됨
- 버튼, 여백, 폰트 굵기, 입력 필드 높이, 안내 문구 스타일이 폼 빌더 미리보기와 다름
- 공유 버튼, 시트 연동, 이탈/공유 트래킹 등 CatchForm 기능 일부가 빠짐

완전히 같게 보이려면 **폼 데이터만 공유하는 게 아니라 현재 `components/CatchForm.tsx` 렌더러 자체를 사용**해야 합니다.

## 방식 A. iframe으로 `/apply`에 삽입

SniperFactory 개발자가 Next.js App Router를 쓰는 경우:

```tsx
// app/apply/page.tsx

type ApplyPageProps = {
  searchParams: {
    slug?: string
  }
}

export default function ApplyPage({ searchParams }: ApplyPageProps) {
  const slug = searchParams.slug || "기본-폼-슬러그"
  const catchformUrl = `https://캐치폼배포도메인/form/${encodeURIComponent(slug)}`

  return (
    <main style={{ position: "fixed", inset: 0, margin: 0, background: "#fff" }}>
      <iframe
        src={catchformUrl}
        title="SniperFactory Apply Form"
        style={{
          width: "100%",
          height: "100dvh",
          border: "none",
          display: "block",
        }}
      />
    </main>
  )
}
```

이 경우 접속 주소는 이렇게 됩니다.

```txt
https://sniperfactory.com/apply?slug=폼슬러그
```

이 방식은 CatchForm이 배포된 페이지를 그대로 보여주므로 디자인, 제출 완료 모달, 공유 버튼, 시트 연동, 트래킹이 가장 동일하게 유지됩니다.

## 방식 B. SniperFactory 프로젝트 안에 CatchForm 렌더러 직접 삽입

SniperFactory 개발자가 CatchForm 컴포넌트를 직접 프로젝트에 넣고 싶다면 아래 파일을 전달합니다.

```txt
components/CatchForm.tsx
components/CatchFormClient.tsx
components/MissingEnvNotice.tsx
lib/env.ts
app/api/google-sheets/route.ts
app/api/geo/route.ts
```

필요 패키지:

```bash
npm install @supabase/supabase-js
```

Next.js App Router 예시:

```tsx
// app/apply/page.tsx

"use client"

import { CatchForm } from "@/components/CatchForm"

export default function ApplyPage() {
  return (
    <CatchForm
      supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL || ""}
      supabaseAnonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}
    />
  )
}
```

이 방식은 `/apply?slug=폼슬러그` 쿼리 파라미터를 CatchForm이 직접 읽습니다.

초기 로딩까지 CatchForm Web과 비슷하게 맞추려면 서버에서 config를 먼저 가져와 `configJson`으로 전달하는 방식을 권장합니다.

```tsx
// app/apply/page.tsx

import { CatchFormClient } from "@/components/CatchFormClient"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

async function getInitialForm(slug: string) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !slug) return null

  const baseUrl = SUPABASE_URL.replace(/\/+$/, "")
  const url = `${baseUrl}/rest/v1/form_configs?select=id,config&slug=eq.${encodeURIComponent(slug)}&limit=1`

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    next: { revalidate: 30 },
  })

  if (!res.ok) return null
  const rows = (await res.json()) as Array<{ id: string; config: unknown }>
  return rows[0] || null
}

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: { slug?: string }
}) {
  const slug = searchParams.slug || "기본-폼-슬러그"
  const initialForm = await getInitialForm(slug)

  return (
    <CatchFormClient
      slug={slug}
      formId={initialForm?.id || ""}
      configJson={initialForm?.config ? JSON.stringify(initialForm.config) : ""}
    />
  )
}
```

주의할 점:

- 제출 완료 화면을 SniperFactory 쪽에서 따로 만들지 말고 `CatchForm.tsx`의 `showModal` 모달을 그대로 사용해야 합니다.
- `<form action="...">`, 서버 액션, 별도 완료 페이지 이동을 추가하면 CatchForm의 제출 완료 모달과 달라집니다.
- `app/api/google-sheets/route.ts`를 함께 넣지 않으면 Google Sheets 연동이 브라우저 fallback으로 동작할 수 있습니다.
- 폰트가 다르게 보이면 SniperFactory 앱에도 Pretendard가 로드되어야 합니다. CatchForm은 `Pretendard Variable`, `Pretendard`, `Noto Sans KR` 순서로 사용합니다.

## 방식 C. Next.js rewrite로 CatchForm Web으로 프록시

SniperFactory의 `/apply/:slug`를 CatchForm Web으로 보이게 만들 수도 있습니다.

```js
// next.config.js 또는 next.config.mjs

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/apply/:slug",
        destination: "https://캐치폼배포도메인/form/:slug",
      },
    ]
  },
}

module.exports = nextConfig
```

이 경우 접속 주소:

```txt
https://sniperfactory.com/apply/폼슬러그
```

## 어떤 방식을 선택하면 좋은가

1차 배포에서는 **방식 A iframe**을 추천합니다.

- 가장 빠름
- SniperFactory 개발자가 CatchForm 내부 코드를 몰라도 됨
- 디자인이 CatchForm Web과 동일하게 유지됨

2차 고도화에서는 **방식 C rewrite** 또는 CatchForm을 SniperFactory 앱에 직접 통합하는 방식을 검토하면 됩니다.

단, “폼 빌더에서 보이는 화면과 완전히 동일”이 목표라면 아래 우선순위를 권장합니다.

1. **iframe으로 CatchForm 배포 URL을 그대로 삽입**
2. SniperFactory 앱에 **현재 `CatchForm.tsx` 렌더러 파일 전체를 복사해서 사용**
3. `config` 데이터만 받아서 SniperFactory UI로 재구현

3번은 디자인과 기능이 달라질 가능성이 높으므로 권장하지 않습니다.

## CatchForm 관리자 링크 설정

CatchForm 관리자에서 SniperFactory 폼 링크는 별도 base URL을 사용하지 않고 캐치폼 직접 링크로 생성합니다.

```env
https://catchform.vercel.app/form/폼슬러그
```

`NEXT_PUBLIC_SF_FORM_BASE_URL`은 더 이상 사용하지 않습니다. 인사이드아웃처럼 외부 `/apply` 페이지를 쓰는 브랜드만 `NEXT_PUBLIC_FORM_BASE_URL`을 설정하면 됩니다.
