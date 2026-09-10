# CatchForm

## 저장소 구조

- Git 저장소 루트: `deploy-catchform/`
- Next.js 앱: `deploy-catchform/catchform-web-github-upload/`
- 잠금 파일은 `bun.lock`을 쓴다. `package-lock.json`은 추적하지 않는다.

## 커밋 메시지

제목 앞에 접두사를 붙인다.

| 접두사 | 쓰는 경우 |
|---|---|
| `feat:` | 새 기능 |
| `fix:` | 버그 수정 |
| `perf:` | 성능 개선 |
| `refactor:` | 동작은 그대로, 구조만 정리 |
| `style:` | UI 디자인 반영 |
| `docs:` | 문서·워크로그 |
| `chore:` | 설정·의존성 |

- 여러 종류가 섞이면 **비중이 가장 큰 것 하나**만 붙인다.
- 제목과 본문은 한국어로 쓴다.
- 2026-09-10 이전 커밋에는 접두사가 없다. 그 이후부터 적용한다.

## 브랜치 · 배포

- `dev`에서 작업하고 커밋·푸시 → GitHub에서 `dev → main` PR → 머지하면 Vercel이 자동 배포한다.
- **Squash 머지를 쓰면 main에 남는 커밋 메시지는 PR 제목**이 된다. PR 제목에도 접두사를 붙일 것.
- 배포 절차를 시작하기 전에 3002 포트의 개발 서버를 반드시 종료한다.

## 작업 기록

코드를 바꾼 뒤에는 `docs/catchform-daily-worklog.md`에 무엇을 왜 바꿨는지 덧붙인다.
