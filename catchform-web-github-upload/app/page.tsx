import Link from "next/link"

export default function HomePage() {
  return (
    <main className="home-shell">
      <section className="home-panel">
        <div>
          <p className="eyebrow">CatchForm Web</p>
          <h1>배포형 캐치폼 1차 이전</h1>
          <p>
            Framer 코드 컴포넌트에서 분리한 관리자와 실제 폼 렌더러를
            Next.js 라우트에서 실행합니다.
          </p>
        </div>
        <div className="home-actions">
          <Link href="/admin">관리자 열기</Link>
          <Link href="/form">폼 URL 테스트</Link>
        </div>
      </section>
    </main>
  )
}
