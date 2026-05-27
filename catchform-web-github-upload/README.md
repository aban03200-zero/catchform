# CatchForm Web

Framer Code Component로 운영하던 CatchForm을 Next.js + Vercel 배포형 앱으로 옮긴 1차 이전본입니다.

## 지금 포함된 것

- `/admin`: 폼 리스트, 편집기, 응답/분석 화면
- `/form/[slug]`: 실제 제출 폼
- `/form?slug=...`: 쿼리 파라미터 방식 폼 fallback
- 기존 Supabase DB/Storage 사용
- 기존 Apps Script 기반 Google Sheets 연동 유지

## 처음 실행하기

1. 의존성 설치

```bash
bun install
```

2. 환경변수 파일 만들기

`.env.example`을 복사해서 `.env.local`을 만들고 값을 채웁니다.

```bash
cp .env.example .env.local
```

필수 값:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_FORM_BASE_URL=http://localhost:3000/form
NEXT_PUBLIC_SF_FORM_BASE_URL=http://localhost:3000/form
```

3. 개발 서버 실행

```bash
bun run dev
```

4. 브라우저에서 확인

- 관리자: `http://localhost:3000/admin`
- 실제 폼: `http://localhost:3000/form/폼슬러그`
- 쿼리 방식: `http://localhost:3000/form?slug=폼슬러그`

## Vercel 배포 방법

더 자세한 체크리스트는 `docs/VERCEL_DEPLOYMENT_GUIDE.md`에 정리되어 있습니다.

1. 이 `catchform-web` 폴더를 GitHub 저장소로 올립니다.
2. Vercel에서 `New Project`를 누르고 GitHub 저장소를 연결합니다.
3. Framework Preset은 `Next.js`로 둡니다.
4. Environment Variables에 아래 값을 넣습니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_FORM_BASE_URL=https://배포도메인/form
NEXT_PUBLIC_SF_FORM_BASE_URL=https://배포도메인/form
```

5. Deploy를 누릅니다.

## Google Sheets 연동

1차 이전에서는 기존 Apps Script 방식이 유지됩니다.

Apps Script 코드는 아래 파일에 있습니다.

```txt
docs/catchform-google-sheets-apps-script.js
```

Apps Script에 붙여넣고 새 배포한 Web App URL을 관리자 화면의 `응답 연동` 메뉴에 넣으면 됩니다.

## 2차 이전 때 할 일

- Apps Script 제거
- Next.js API Route로 Google OAuth 구현
- 구글 계정 선택
- 시트 선택
- 새 시트 생성
- 응답 append
- 연동 상태를 서버에서 정확히 확인
