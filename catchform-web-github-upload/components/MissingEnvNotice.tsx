"use client"

type MissingEnvNoticeProps = {
  surface: "admin" | "form"
}

export function MissingEnvNotice({ surface }: MissingEnvNoticeProps) {
  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: 24,
      background: "#F7F8FA",
      color: "#191F28",
      fontFamily: "'Pretendard Variable','Pretendard','Noto Sans KR',-apple-system,BlinkMacSystemFont,system-ui,sans-serif",
    }}>
      <section style={{
        width: "min(720px, 100%)",
        background: "#fff",
        border: "1px solid #E5E8EB",
        borderRadius: 16,
        padding: 28,
        boxShadow: "0 12px 36px rgba(25,31,40,0.08)",
      }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "#3182F6", marginBottom: 8 }}>
          환경변수 설정 필요
        </div>
        <h1 style={{ margin: "0 0 10px", fontSize: 25, lineHeight: 1.3, letterSpacing: 0 }}>
          Supabase 연결값을 넣어야 {surface === "admin" ? "관리자" : "폼"}가 작동해요.
        </h1>
        <p style={{ margin: 0, color: "#6B7280", lineHeight: 1.7, fontSize: 14 }}>
          Framer의 Property Controls에 넣던 Supabase URL과 Anon Key를 이제
          Next.js 환경변수로 넣으면 됩니다.
        </p>
        <pre style={{
          margin: "18px 0 0",
          padding: 16,
          borderRadius: 12,
          background: "#F2F4F6",
          color: "#333D4B",
          overflowX: "auto",
          fontSize: 13,
          lineHeight: 1.7,
        }}>{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_FORM_BASE_URL=http://localhost:3000/form
NEXT_PUBLIC_SF_FORM_BASE_URL=http://localhost:3000/form`}</pre>
        <div style={{ marginTop: 16, color: "#8B95A1", fontSize: 13, lineHeight: 1.7 }}>
          로컬에서는 <b>.env.local</b>에 넣고, Vercel에서는 Project Settings의
          Environment Variables에 같은 값을 넣어주세요.
        </div>
      </section>
    </main>
  )
}
