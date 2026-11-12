# 중계 서버 알림톡 통로 추가 요청

작성: 캐치폼 / 2026-11-12
대상 서버: `http://3.223.232.208:8080` (알리고 중계 서버)

## 배경

캐치폼은 접수 안내를 **문자에서 알림톡으로** 바꿉니다.
현재 문자는 `POST /aligo/send-sms` 로 중계 서버를 거쳐 나가고 있고, 알림톡도 같은 이유(알리고 고정 IP 제한)로
중계 서버를 거쳐야 합니다. **알림톡용 통로 하나만 추가**해 주시면 됩니다.

캐치폼 쪽 작업은 이미 끝나 있고, 이 엔드포인트만 생기면 바로 연결됩니다.
기존 `/aligo/send-sms` 는 **그대로 두셔야 합니다.** 알림톡 실패 시 대체문자와, 아직 문자를 쓰는 기존 폼이 계속 사용합니다.

## 추가할 엔드포인트

```
POST /aligo/send-alimtalk
Content-Type: application/json
x-internal-token: <기존 문자와 동일한 토큰>
```

인증·로깅·에러 처리 방식은 `/aligo/send-sms` 와 동일하게 맞춰 주시면 됩니다.

### 요청 본문 (캐치폼 → 중계 서버)

```json
{
  "tplCode": "catchform_apply_01",
  "receiver": "01012345678",
  "recvname": "홍길동",
  "subject": "접수 안내",
  "message": "홍길동님, 신청이 정상 접수되었습니다.\n\n■ 과정명 : AID 30+ 집중캠프\n\n담당자 확인 후 개별 안내드리겠습니다.",
  "senderOverride": "0251145600",
  "failover": true,
  "fsubject": "접수 안내",
  "fmessage": "홍길동님, 신청이 정상 접수되었습니다.",
  "buttons": [
    { "name": "신청 내역 확인", "linkType": "WL", "linkMo": "https://catchform.vercel.app/form/aid5" }
  ],
  "testMode": false
}
```

| 필드 | 설명 | 비고 |
|---|---|---|
| `tplCode` | 알림톡 템플릿 코드 | 필수 |
| `receiver` | 수신자 번호 (하이픈 없는 11자리) | 필수. 캐치폼에서 이미 정규화해서 보냄 |
| `recvname` | 수신자 이름 | 없을 수 있음 |
| `subject` | 알림톡 제목 | 필수. 50자 이내로 잘라서 보냄 |
| `message` | 알림톡 본문 (변수 치환 완료 상태) | 필수 |
| `senderOverride` | 발신번호 | 필수. 알리고 등록번호 중에서만 옴 |
| `failover` | 실패 시 문자 대체 여부 | `true`/`false` |
| `fsubject` | 대체문자 제목 | `failover`가 false면 없음 |
| `fmessage` | 대체문자 내용 | `failover`가 false면 없음 |
| `buttons` | 버튼 배열 | 비어 있을 수 있음 |
| `testMode` | 테스트 모드 | `true`면 실제 발송·과금 없음 |

`buttons[]` 항목은 두 가지만 옵니다.

- `{ "name": "...", "linkType": "WL", "linkMo": "https://...", "linkPc": "https://..." }` — 웹링크 (`linkPc`는 없을 수 있음)
- `{ "name": "...", "linkType": "AC" }` — 채널 추가

## 알리고 API 매핑

[알리고 알림톡 API 문서](https://smartsms.aligo.in/alimapi.html) 기준입니다.

```
POST https://kakaoapi.aligo.in/akv10/alimtalk/send/
```

| 알리고 파라미터 | 넣을 값 |
|---|---|
| `apikey` | **중계 서버 환경변수** (캐치폼은 모름) |
| `userid` | **중계 서버 환경변수** (캐치폼은 모름) |
| `senderkey` | **중계 서버 환경변수**로 추가 필요 — 카카오 발신프로필 키 |
| `tpl_code` | `tplCode` |
| `sender` | `senderOverride` |
| `receiver_1` | `receiver` |
| `recvname_1` | `recvname` |
| `subject_1` | `subject` |
| `message_1` | `message` |
| `button_1` | `{"button": buttons}` 형태의 JSON 문자열 — `buttons`가 비면 **아예 빼 주세요** |
| `failover` | `failover ? "Y" : "N"` |
| `fsubject_1` | `fsubject` |
| `fmessage_1` | `fmessage` |
| `testMode` | `testMode ? "Y" : "N"` |

**수신자 번호 뒤의 `_1` 접미사는 반드시 유지해야 합니다.** 빼면 필수값 누락 오류가 납니다.

### 추가로 필요한 환경변수

```
ALIGO_ALIMTALK_SENDERKEY=<카카오 비즈니스 발신프로필 키>
```

`apikey` / `userid` 는 문자 발송에 쓰는 것과 같은 값을 그대로 쓰시면 됩니다.

## 응답 (중계 서버 → 캐치폼)

문자와 **동일한 형태**로 돌려주세요. 캐치폼은 `ok` 값만 봅니다.

```json
{ "ok": true,  "mid": 123456789 }
{ "ok": false, "error": "사유" }
```

알리고 응답의 `code` 판정 기준입니다.

- `code === 0` → `ok: true`
- 그 외 → `ok: false`, `error` 에 알리고의 `message` 를 그대로 담아 주세요

> 알리고 문서의 브랜드메시지 쪽은 성공 코드를 `1`로 안내하고 있어 서로 다릅니다.
> **알림톡 발송 API는 `0`이 성공**이지만, 처음 연동하실 때 실제 응답을 한 번 확인해 주시면 좋겠습니다.

## 주의사항

1. **알림톡 본문은 승인된 템플릿과 글자가 하나도 달라선 안 됩니다.** 띄어쓰기와 줄바꿈까지 같아야 합니다.
   캐치폼이 변수를 모두 채운 완성된 본문을 보내므로, **중계 서버에서는 본문을 가공하지 말고 그대로 전달**해 주세요.
   (앞뒤 공백 제거, 개행 변환 등도 하지 말아 주세요)

2. **`buttons` 가 빈 배열이면 `button_1` 파라미터를 아예 보내지 말아 주세요.**
   템플릿에 없는 버튼 정보가 들어가면 발송이 거부됩니다.

3. 알리고 키는 지금처럼 **중계 서버에만** 두어 주세요. 캐치폼은 키를 갖지 않는 구조입니다.

4. 캐치폼은 같은 응답에 두 번 보내지 않도록 자체적으로 막고 있습니다. 중계 서버 쪽 중복 방지는 필요 없습니다.

## 확인 방법

`testMode: true` 로 한 번 호출해 주시면 과금 없이 연동만 확인할 수 있습니다.
캐치폼 쪽은 환경변수 `SMS_TEST_MODE=Y` 로 같은 동작을 합니다.

## 연락

캐치폼 쪽 구현은 `app/api/notify-applicant/route.ts` 에 있습니다.
요청 본문을 바꾸는 편이 나으면 말씀해 주세요. 중계 서버에 맞추겠습니다.
