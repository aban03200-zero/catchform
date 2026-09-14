export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  formBaseUrl: process.env.NEXT_PUBLIC_FORM_BASE_URL || "",
  googleSheetsWebhookUrl: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL || "",
  // CRM 회원가입 페이지. 비어 있으면 로그인 화면의 회원가입 버튼을 아예 숨긴다.
  // 나중에 CRM이 임베드 전용 페이지(/embed/signup)를 내놓으면 이 값만 바꾸면 된다.
  crmSignupUrl: (process.env.NEXT_PUBLIC_CRM_SIGNUP_URL || "").trim(),
}
