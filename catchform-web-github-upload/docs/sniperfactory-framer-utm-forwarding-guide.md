# SniperFactory Framer UTM Forwarding Guide

## 목적

`sniperfactory.com` 프로그램 상세페이지는 CRM에 등록된 Framer 링크를 iframe으로 띄우는 구조입니다.

현재 사용자가 UTM이 붙은 `sniperfactory.com` URL로 들어와도, iframe으로 열리는 Framer 페이지에는 UTM이 전달되지 않습니다. 그 결과 Framer 안의 신청 버튼을 눌러 CatchForm으로 이동할 때 최종 CatchForm URL에 UTM이 붙지 않습니다.

이 문서는 `sniperfactory.com -> Framer iframe -> CatchForm` 흐름에서 UTM 값을 유지하기 위해 `sniperfactory.com` 프론트 코드에 추가해야 하는 작업을 정리한 가이드입니다.

## 테스트 대상

- 웹사이트 URL: `https://sniperfactory.com/program/kdt-kakaocloud-6`
- CRM Framer URL: `https://major-terms-956572.framer.app/`
- 슬러그값: `kdt-kakaocloud-6`

## 현재 문제

사용자가 아래 URL로 접속한다고 가정합니다.

```text
https://sniperfactory.com/program/kdt-kakaocloud-6?utm_source=instagram&utm_medium=social&utm_campaign=260824
```

하지만 CRM에 등록된 Framer URL을 iframe에 그대로 넣으면 iframe src는 아래처럼 UTM 없이 열립니다.

```text
https://major-terms-956572.framer.app/
```

그러면 Framer 안에서 실행되는 Custom Code는 부모 페이지인 `sniperfactory.com`의 UTM을 알 수 없습니다. 결국 신청 버튼을 눌렀을 때 CatchForm 주소도 아래처럼 UTM 없이 이동합니다.

```text
https://catchform.vercel.app/form/aid3
```

## 원하는 동작

CRM에서 가져온 Framer URL이 아래와 같고,

```text
https://major-terms-956572.framer.app/
```

사용자가 접속한 현재 웹사이트 URL이 아래와 같다면,

```text
https://sniperfactory.com/program/kdt-kakaocloud-6?utm_source=instagram&utm_medium=social&utm_campaign=260824
```

iframe src는 자동으로 아래처럼 변환되어야 합니다.

```text
https://major-terms-956572.framer.app/?utm_source=instagram&utm_medium=social&utm_campaign=260824&landing_page=%2Fprogram%2Fkdt-kakaocloud-6
```

이후 Framer 안의 신청 버튼을 누르면 최종 CatchForm URL도 UTM을 포함해야 합니다.

```text
https://catchform.vercel.app/form/폼슬러그?utm_source=instagram&utm_medium=social&utm_campaign=260824
```

## 전달해야 할 파라미터

부모 페이지인 `sniperfactory.com` 현재 URL에서 아래 파라미터를 읽어 Framer iframe URL에 붙여주세요.

```ts
const TRACKING_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
];
```

추가로 현재 페이지 경로도 전달해주세요.

```text
landing_page=/program/kdt-kakaocloud-6
```

가능하면 referrer도 같이 전달해주세요.

```text
referrer=document.referrer
```

## 브랜드 UTM 규칙

### 소셜 SNS

```text
https://sniperfactory.com/program/kdt-kakaocloud-6?utm_source=[매체명]&utm_medium=social&utm_campaign=[날짜]
```

예시:

```text
https://sniperfactory.com/program/kdt-kakaocloud-6?utm_source=instagram&utm_medium=social&utm_campaign=260824
```

### 유료매체 배너광고

```text
https://sniperfactory.com/program/kdt-kakaocloud-6?utm_source=[매체명]&utm_medium=banner&utm_campaign=[날짜]
```

### 부트캠프 바이럴

```text
https://sniperfactory.com/program/kdt-kakaocloud-6?utm_source=[매체명]&utm_medium=viral&utm_campaign=[날짜]
```

### 메일

```text
https://sniperfactory.com/program/kdt-kakaocloud-6?utm_source=[수신처]&utm_medium=email&utm_campaign=[날짜]
```

### 문자

```text
https://sniperfactory.com/program/kdt-kakaocloud-6?utm_source=[수신처]&utm_medium=sms&utm_campaign=[날짜]
```

### 광고매체

구글애즈:

```text
https://sniperfactory.com/program/kdt-kakaocloud-6?utm_source=google&utm_medium=cpc&utm_campaign={캠페인명}&utm_content={소재명}
```

메타:

```text
https://sniperfactory.com/program/kdt-kakaocloud-6?utm_source=meta&utm_medium=display&utm_campaign={캠페인명}&utm_content={소재명}
```

네이버 GFA:

```text
https://sniperfactory.com/program/kdt-kakaocloud-6?utm_source=gfa&utm_medium=display&utm_campaign={캠페인명}&utm_content={소재명}
```

네이버 SA:

```text
https://sniperfactory.com/program/kdt-kakaocloud-6?utm_source=naver&utm_medium=cpc&utm_campaign={캠페인명}&utm_content={소재명}
```

## 구현 방향

CRM에 저장된 Framer URL 자체를 바꾸지 않습니다.

각 프로그램마다 수동으로 UTM을 붙이지 않습니다.

대신 `sniperfactory.com`에서 CRM Framer 링크를 iframe에 넣기 직전에 현재 페이지 URL의 UTM 파라미터를 복사해서 붙입니다.

기존 코드가 아래와 같다면,

```tsx
<iframe src={framerUrl} />
```

아래처럼 변경합니다.

```tsx
<iframe src={appendTrackingParamsToIframeUrl(framerUrl)} />
```

## 구현 예시

```ts
const TRACKING_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
];

export function appendTrackingParamsToIframeUrl(framerUrl: string) {
  if (typeof window === "undefined") return framerUrl;

  try {
    const currentParams = new URLSearchParams(window.location.search || "");
    const url = new URL(framerUrl);

    TRACKING_PARAM_KEYS.forEach((key) => {
      const value = currentParams.get(key);
      if (value && !url.searchParams.has(key)) {
        url.searchParams.set(key, value);
      }
    });

    if (!url.searchParams.has("landing_page")) {
      url.searchParams.set("landing_page", window.location.pathname);
    }

    if (document.referrer && !url.searchParams.has("referrer")) {
      url.searchParams.set("referrer", document.referrer);
    }

    return url.toString();
  } catch (error) {
    console.warn("Failed to append tracking params to Framer iframe URL", error);
    return framerUrl;
  }
}
```

## Next.js 클라이언트 컴포넌트 예시

Next.js처럼 SSR이 있는 환경에서는 `window`가 서버에 없으므로 클라이언트에서만 iframe URL을 계산해야 합니다.

```tsx
"use client";

import { useEffect, useState } from "react";

const TRACKING_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
];

function appendTrackingParamsToIframeUrl(framerUrl: string) {
  if (typeof window === "undefined") return framerUrl;

  try {
    const currentParams = new URLSearchParams(window.location.search || "");
    const url = new URL(framerUrl);

    TRACKING_PARAM_KEYS.forEach((key) => {
      const value = currentParams.get(key);
      if (value && !url.searchParams.has(key)) {
        url.searchParams.set(key, value);
      }
    });

    if (!url.searchParams.has("landing_page")) {
      url.searchParams.set("landing_page", window.location.pathname);
    }

    if (document.referrer && !url.searchParams.has("referrer")) {
      url.searchParams.set("referrer", document.referrer);
    }

    return url.toString();
  } catch (error) {
    console.warn("Failed to append tracking params to Framer iframe URL", error);
    return framerUrl;
  }
}

export function ProgramDetailIframe({ framerUrl }: { framerUrl: string }) {
  const [iframeSrc, setIframeSrc] = useState(framerUrl);

  useEffect(() => {
    setIframeSrc(appendTrackingParamsToIframeUrl(framerUrl));
  }, [framerUrl]);

  return <iframe src={iframeSrc} />;
}
```

## Framer 쪽 전제

Framer 프로젝트에는 이미 Custom Code가 들어가 있어야 합니다.

Framer Custom Code의 역할은 iframe URL로 들어온 UTM 값을 저장하고, Framer 안의 CatchForm 신청 링크로 이동할 때 해당 UTM을 다시 붙이는 것입니다.

즉 전체 흐름은 아래와 같습니다.

```text
sniperfactory.com UTM URL
-> Framer iframe src에 UTM 전달
-> Framer Custom Code가 UTM 저장
-> Framer 신청 버튼 클릭
-> CatchForm URL에 UTM 부착
```

## 테스트 방법

### 1. UTM이 붙은 테스트 URL 접속

아래 URL로 접속합니다.

```text
https://sniperfactory.com/program/kdt-kakaocloud-6?utm_source=instagram&utm_medium=social&utm_campaign=260824
```

### 2. iframe src 확인

개발자도구에서 Framer iframe의 `src`를 확인합니다.

정상 결과:

```text
https://major-terms-956572.framer.app/?utm_source=instagram&utm_medium=social&utm_campaign=260824&landing_page=%2Fprogram%2Fkdt-kakaocloud-6
```

`referrer`를 같이 붙이는 경우 아래 값도 포함될 수 있습니다.

```text
referrer=...
```

### 3. CatchForm 이동 URL 확인

Framer 안의 신청 버튼을 클릭합니다.

정상 결과:

```text
https://catchform.vercel.app/form/폼슬러그?utm_source=instagram&utm_medium=social&utm_campaign=260824
```

이렇게 나오면 `sniperfactory.com -> Framer iframe -> CatchForm`까지 UTM 전달이 성공한 것입니다.

## 주의사항

- CRM에 저장된 Framer URL 자체는 수정하지 않습니다.
- 각 프로그램마다 수동으로 UTM을 붙이지 않습니다.
- iframe을 렌더링하는 공통 컴포넌트에서 한 번만 처리합니다.
- 기존 Framer Custom Code는 유지합니다.
- Framer iframe URL에 UTM이 붙지 않으면 CatchForm까지 UTM이 전달되지 않습니다.
- Framer 안의 신청 버튼이 일반 `<a>` 링크가 아니라 JS 이동 방식이면 Framer Custom Code에서 추가 대응이 필요할 수 있습니다.
- CatchForm 쪽에서는 이후 `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `landing_page`, `referrer` 등을 수신해 DB와 관리자 화면, CSV 다운로드에 저장/표시하는 작업이 필요합니다.

## 최종 체크리스트

- [ ] `sniperfactory.com` 테스트 URL에 UTM을 붙여 접속했다.
- [ ] Framer iframe src에 UTM이 붙어 있다.
- [ ] Framer 안 신청 버튼 클릭 후 CatchForm URL에도 UTM이 붙어 있다.
- [ ] UTM 없는 일반 접속도 기존처럼 정상 동작한다.
- [ ] CRM에 저장된 Framer URL 원본은 변경하지 않았다.
