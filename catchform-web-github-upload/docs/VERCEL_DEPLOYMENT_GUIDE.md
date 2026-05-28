# Vercel 배포 가이드

디자이너가 개발자와 함께 확인하기 위한 배포 체크리스트입니다.

## 1. 배포 전에 필요한 계정

- GitHub 계정
- Vercel 계정
- Supabase 프로젝트 접근 권한

## 2. GitHub에 올릴 폴더

아래 폴더만 GitHub 저장소로 올리면 됩니다.

```txt
catchform-web
```

`node_modules`, `.next`, `.env.local`은 올리지 않습니다.

## 3. Vercel에서 프로젝트 만들기

1. Vercel 접속
2. `Add New...` 클릭
3. `Project` 클릭
4. GitHub에서 `catchform-web` 저장소 선택
5. Framework Preset이 `Next.js`인지 확인
6. Environment Variables 입력

## 4. Vercel 환경변수

Vercel Project Settings > Environment Variables에 아래 값을 넣습니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_FORM_BASE_URL=https://배포도메인/form
NEXT_PUBLIC_SF_FORM_BASE_URL=https://배포도메인/form
NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL=
```

예시:

```env
NEXT_PUBLIC_FORM_BASE_URL=https://catchform-web.vercel.app/form
NEXT_PUBLIC_SF_FORM_BASE_URL=https://catchform-web.vercel.app/form
NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/배포ID/exec
```

`NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL`은 선택값입니다. 넣어두면 관리자 `응답 연동`에서 폼마다 Apps Script URL을 반복 입력하지 않고, 같은 Web App URL로 새 스프레드시트를 생성하거나 기존 스프레드시트에 응답을 기록할 수 있습니다.

## 5. 배포 후 확인할 주소

```txt
https://배포도메인/admin
https://배포도메인/form/폼슬러그
https://배포도메인/form?slug=폼슬러그
```

## 6. 확인 순서

1. `/admin` 접속
2. Supabase 로그인 가능 여부 확인
3. 기존 폼 리스트가 뜨는지 확인
4. 폼 하나를 열어서 편집 화면 확인
5. 해당 폼의 슬러그로 `/form/슬러그` 접속
6. 폼 제출 테스트
7. 응답 및 분석 페이지에서 제출 응답 확인
8. Google Sheets 연동을 사용하는 폼은 Apps Script URL이 그대로 저장되어 있는지 확인

## 7. 문제가 생겼을 때

### `/admin`에서 환경변수 안내 화면이 뜨는 경우

Vercel 환경변수에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 비어 있는 상태입니다.

### 폼 리스트가 비어 있는 경우

Supabase URL/Key가 다른 프로젝트를 보고 있거나, `form_configs` 테이블 권한을 확인해야 합니다.

### 실제 폼에서 제출이 안 되는 경우

Supabase Storage, `applications`, `company_applications`, `form_response_events` 테이블 권한을 확인해야 합니다.

### 시트 연동이 안 되는 경우

1차 이전에서는 기존 Apps Script 방식이 유지됩니다. Apps Script를 수정했다면 새 배포 URL이 폼 config에 저장되어 있는지 확인합니다.
