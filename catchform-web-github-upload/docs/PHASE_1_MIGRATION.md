# 1차 이전 메모

## 이전 목표

Framer가 감당하던 대형 코드 컴포넌트를 Next.js 앱으로 분리했습니다.

## 변경한 구조

```txt
catchform-web/
  app/
    admin/page.tsx
    form/page.tsx
    form/[slug]/page.tsx
  components/
    FormAdmin.tsx
    CatchForm.tsx
    FormAdminClient.tsx
    CatchFormClient.tsx
  docs/
    catchform-google-sheets-apps-script.js
```

## 기존 코드에서 제거한 것

- `framer` import
- `addPropertyControls`
- Framer 전용 default props

## 유지한 것

- 기존 Supabase 테이블 구조
- 기존 Storage 업로드 방식
- 기존 폼 config 구조
- 기존 응답/분석 화면
- 기존 Apps Script 시트 연동

## 주의점

- Supabase URL/Anon Key는 Vercel 환경변수로 넣어야 합니다.
- 실제 배포 후 관리자에서 만드는 폼 링크는 `/form/[slug]` 형식을 권장합니다.
- `NEXT_PUBLIC_FORM_BASE_URL`은 배포 도메인 기준으로 `https://도메인/form` 형태로 설정합니다.
