# SniperFactory `/apply` 연동 가이드

SniperFactory 사이트에서 InsideOut과 같은 CatchForm 디자인으로 `/apply` 페이지를 열기 위한 개발자 전달용 문서입니다.

## 추천 방식

가장 안전한 방식은 **CatchForm Web을 별도 배포 앱으로 유지하고, SniperFactory `/apply`에서 해당 폼 URL을 보여주는 방식**입니다.

이유:

- CatchForm의 폼 디자인과 로직을 한 곳에서만 관리할 수 있음
- SniperFactory 사이트에 5천 줄짜리 폼 코드를 다시 복사하지 않아도 됨
- 응답/분석/시트 연동이 같은 Supabase config를 그대로 사용함

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
    <main style={{ minHeight: "100vh", margin: 0, background: "#fff" }}>
      <iframe
        src={catchformUrl}
        title="SniperFactory Apply Form"
        style={{
          width: "100%",
          minHeight: "100vh",
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

## 방식 B. SniperFactory 프로젝트 안에 CatchForm 렌더러 직접 삽입

SniperFactory 개발자가 CatchForm 컴포넌트를 직접 프로젝트에 넣고 싶다면 아래 파일을 전달합니다.

```txt
components/CatchForm.tsx
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

## CatchForm 관리자 환경변수 설정

CatchForm 관리자에서 SniperFactory 폼 링크가 `/apply`로 나오게 하려면 Vercel 환경변수를 이렇게 설정합니다.

```env
NEXT_PUBLIC_FORM_BASE_URL=https://insideout.or.kr/apply
NEXT_PUBLIC_SF_FORM_BASE_URL=https://sniperfactory.com/apply
```

SniperFactory 개발자가 아직 배포 전이면 임시로 다음처럼 둘 수 있습니다.

```env
NEXT_PUBLIC_SF_FORM_BASE_URL=https://스나이퍼팩토리-개발도메인/apply
```

환경변수를 바꾼 뒤에는 Vercel에서 Redeploy해야 관리자 화면의 링크 복사/미리보기에 반영됩니다.
