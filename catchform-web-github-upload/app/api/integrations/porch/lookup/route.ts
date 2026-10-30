import { timingSafeEqual } from "node:crypto"
import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

// 상담 툴 Porch가 채팅 고객의 신청 내역을 찾을 때 부른다.
//
// Porch에 우리 DB 전체 열쇠를 주지 않으려고 만든 조회 창구다. 같은 Supabase를 다른 앱도 같이 쓰기 때문에,
// 여기서 필요한 칸(과정·신청일·답변)만 골라서 내보낸다. 호출은 서버끼리만 하고 공유 비밀값으로 확인한다.
//
// 연락처는 폼마다 저장 위치와 형식이 다르다. 연락처 칸이 따로 있는 폼은 하이픈이 들어간 채로,
// 아닌 폼은 답변(form_data) 안에만 있다. 그래서 두 형식 모두로 두 곳을 찾는다.

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const TABLES = ["applications", "company_applications"] as const
const MAX_RESULTS = 20

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: { "cache-control": "no-store" } })
}

function authorized(req: NextRequest) {
  const secret = process.env.PORCH_LOOKUP_SECRET || ""
  const given = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "")
  return !!secret && given.length === secret.length && timingSafeEqual(Buffer.from(given), Buffer.from(secret))
}

// 01012345678 → [01012345678, 010-1234-5678]  (10자리면 010-123-4567)
function phoneVariants(raw: unknown) {
  let digits = String(raw ?? "").replace(/[^\d]/g, "")
  if (digits.startsWith("82")) digits = "0" + digits.slice(2)
  if (!/^01[016789]\d{7,8}$/.test(digits)) return []
  const mid = digits.length === 11 ? 7 : 6
  return [digits, `${digits.slice(0, 3)}-${digits.slice(3, mid)}-${digits.slice(mid)}`]
}

function normalizeEmail(raw: unknown) {
  const email = String(raw ?? "").trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ""
}

function answerText(answer: unknown) {
  return Array.isArray(answer) ? answer.join(", ") : String(answer ?? "")
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return json(401, { error: "unauthorized" })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  if (!supabaseUrl || !serviceRoleKey) return json(503, { error: "supabase not configured" })

  let body: any
  try {
    body = await req.json()
  } catch {
    return json(400, { error: "invalid json" })
  }
  const phones = phoneVariants(body?.phone)
  const email = normalizeEmail(body?.email)
  if (!phones.length && !email) return json(400, { error: "phone or email required" })

  const supa = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const columns = "id,form_id,brand,created_at,name,phone,email,form_data"

  // 표마다 연락처 칸 / 이메일 칸 / 답변 안을 각각 찾아서 합친다
  const found = new Map<string, any>()
  try {
    await Promise.all(
      TABLES.flatMap(table => {
        const queries = []
        if (phones.length) queries.push(supa.from(table).select(columns).in("phone", phones).limit(MAX_RESULTS))
        // _ 와 % 는 ilike 에서 와일드카드라 그대로 비교되도록 이스케이프
        if (email) queries.push(supa.from(table).select(columns).ilike("email", email.replace(/[\\%_]/g, "\\$&")).limit(MAX_RESULTS))
        for (const value of [...phones, ...(email ? [email] : [])]) {
          // jsonb 포함 검사는 JSON 문자열로 넘겨야 한다 (배열을 넘기면 Postgres 배열로 바뀐다)
          queries.push(supa.from(table).select(columns).contains("form_data", JSON.stringify([{ answer: value }])).limit(MAX_RESULTS))
        }
        return queries.map(async query => {
          const { data, error } = await query
          if (error) throw error
          for (const row of data || []) found.set(`${table}:${row.id}`, { ...row, table })
        })
      }),
    )
  } catch (error) {
    console.error("porch lookup failed", error)
    return json(500, { error: "lookup failed" })
  }

  const rows = [...found.values()]
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .slice(0, MAX_RESULTS)

  // 과정 이름: 폼 머리말 제목 → 폼 이름 순
  const formIds = [...new Set(rows.map(row => row.form_id).filter(Boolean))]
  const formNames = new Map<string, string>()
  if (formIds.length) {
    const { data: forms } = await supa.from("form_configs").select("id,name,title:config->header->>title").in("id", formIds)
    for (const form of forms || []) formNames.set(form.id, String(form.title || form.name || ""))
  }

  return json(200, {
    applications: rows.map(row => ({
      id: row.id,
      type: row.table === "company_applications" ? "company" : "personal",
      formName: formNames.get(row.form_id) || "",
      brand: row.brand || null,
      createdAt: row.created_at,
      name: row.name || null,
      // 숨김 질문(_로 시작)은 내보내지 않는다
      answers: (Array.isArray(row.form_data) ? row.form_data : [])
        .filter((item: any) => item?.question && !String(item.question).startsWith("_"))
        .map((item: any) => ({ question: String(item.question), answer: answerText(item.answer) })),
    })),
  })
}
