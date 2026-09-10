import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status })
}

function normalizeRole(role: unknown) {
  const value = String(role || "").trim().toLowerCase()
  return value === "admin" || value === "master" ? value : ""
}

// 응답자가 입력한 값은 절대 보내지 않는다. 질문 구성과 집계된 이탈 수치만 넘긴다.
type FieldPayload = {
  label: string
  type: string
  required: boolean
  page: number
  order: number
  optionCount: number
  reach: number
  drop: number
  helper?: string
  placeholder?: string
  options?: string[]
}

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta"
// `-latest` 별칭은 모델 세대가 바뀌어도 404가 나지 않는다. 특정 버전을 고정하려면 GEMINI_MODEL로 덮어쓴다.
// 무료 티어는 순간적으로 503(혼잡)이 잦아서, 후보를 몇 개 두고 차례로 시도한다.
// lite 계열이 혼잡을 훨씬 덜 타고, 이 정도 분량에는 품질도 충분해서 먼저 시도한다.
const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL || "",
  "gemini-flash-lite-latest",
  "gemini-flash-latest",
  "gemini-3.6-flash",
].filter(Boolean)

// 혼잡할 때 구글은 503을 60초쯤 붙들고 있다가 돌려준다.
// 그대로 기다리면 화면이 "분석 중"에서 멈춘 것처럼 보이므로 직접 끊는다.
const CALL_TIMEOUT_MS = 20000
const TOTAL_DEADLINE_MS = 45000

// Gemini의 responseSchema는 OpenAPI 부분집합이라 타입 이름을 대문자로 쓴다.
const FEEDBACK_SCHEMA = {
  type: "OBJECT",
  required: ["items"],
  properties: {
    items: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        required: ["label", "diagnosis", "actions"],
        properties: {
          label: { type: "STRING", description: "대상 질문의 라벨 원문 그대로" },
          diagnosis: {
            type: "STRING",
            description: "이 질문에서 사람들이 멈추는 이유. 2~3문장. 질문의 위치·유형·필수 여부·문구·보기 구성 중 실제로 짚이는 것을 근거로 든다.",
          },
          rewrite: {
            type: "STRING",
            description: "이 질문을 대체할 문구 예시. 문구가 문제가 아니면 빈 문자열.",
          },
          helperRewrite: {
            type: "STRING",
            description: "질문 아래에 넣을 도움말 문구 예시. 필요 없으면 빈 문자열.",
          },
          actions: {
            type: "ARRAY",
            description: "관리자가 지금 할 수 있는 구체적 조치. 2~3개. 각 항목은 한 문장.",
            items: { type: "STRING" },
          },
        },
      },
    },
  },
}

const SYSTEM = `당신은 신청 폼을 고쳐 전환율을 올리는 UX 라이터입니다.
주어진 것은 폼의 질문 구성(순서, 섹션, 유형, 필수 여부, 문구, 도움말, 보기)과
질문별로 몇 명이 도달해 몇 명이 이탈했는지에 대한 집계 수치입니다.

쓰는 방식:
- 한국어 존댓말. 각 문장은 80자를 넘기지 않습니다.
- diagnosis는 2~3문장으로, 이 폼의 이 질문에서만 할 수 있는 이야기를 씁니다.
  앞뒤 질문과의 관계, 섹션 안에서의 위치, 문구의 어떤 부분이 걸리는지, 도움말이 없는지,
  보기 구성이 답을 막는지 중에서 실제로 짚이는 것을 근거로 듭니다.
- 문구가 문제라면 rewrite에 바꿀 질문 문구를 그대로 씁니다. 설명이 아니라 완성된 문구여야 합니다.
- 답을 어떻게 적어야 할지 모르는 게 문제라면 helperRewrite에 넣을 도움말 문구를 그대로 씁니다.
- actions에는 관리자가 지금 편집기에서 할 수 있는 조치만 씁니다.
  예: "필수를 해제하세요", "섹션 3으로 옮기세요", "보기에 '해당 없음'을 추가하세요".

금지:
- 주어진 수치나 폼 구성으로 뒷받침되지 않는 원인을 지어내지 않습니다.
- "사용자 경험을 개선하세요", "친절하게 안내하세요" 같은 일반론은 쓰지 않습니다.
- 이탈률을 낮추면 전환이 몇 % 오른다는 식의 예측은 하지 않습니다.
- 도달 대비 이탈이 큰 질문부터 최대 5개만 다룹니다.`

async function callGemini(model: string, apiKey: string, prompt: string) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CALL_TIMEOUT_MS)
  try {
    return await fetch(`${GEMINI_BASE}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    signal: controller.signal,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: FEEDBACK_SCHEMA,
        maxOutputTokens: 2048,
      },
    }),
    })
  } catch {
    // 시간 초과나 네트워크 오류는 "이 모델은 지금 못 쓴다"로 취급하고 다음 후보로 넘어간다.
    return null
  } finally {
    clearTimeout(timer)
  }
}

// 무료 티어에서 쓸 수 있는 모델 이름은 계정과 시점에 따라 다르다.
// 지정한 모델이 없으면 목록을 받아 generateContent를 지원하는 flash 계열을 하나 고른다.
async function discoverModel(apiKey: string) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CALL_TIMEOUT_MS)
  let response: Response
  try {
    response = await fetch(`${GEMINI_BASE}/models?key=${encodeURIComponent(apiKey)}`, { signal: controller.signal })
  } catch {
    return ""
  } finally {
    clearTimeout(timer)
  }
  if (!response.ok) return ""
  const payload = await response.json().catch(() => ({}))
  const models: any[] = Array.isArray(payload?.models) ? payload.models : []
  const usable = models.filter(m => Array.isArray(m?.supportedGenerationMethods) && m.supportedGenerationMethods.includes("generateContent"))
  const name = (m: any) => String(m?.name || "").replace(/^models\//, "")
  const flash = usable.find(m => /flash/i.test(name(m)) && !/vision|thinking|exp|tts|image|preview/i.test(name(m)))
  return name(flash || usable[0] || null)
}

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  const geminiKey = process.env.GEMINI_API_KEY || ""

  if (!supabaseUrl || !supabaseAnonKey) {
    return json(500, { error: "Supabase public environment variables are missing." })
  }
  if (!geminiKey) {
    return json(503, { error: "GEMINI_API_KEY가 설정되지 않았어요.", missingKey: true })
  }

  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim()
  if (!token) return json(401, { error: "Missing authorization token." })

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: userData, error: userError } = await userClient.auth.getUser(token)
  if (userError || !userData.user) return json(401, { error: "Invalid authorization token." })

  const { data: roleRow, error: roleError } = await userClient
    .from("users").select("role").eq("id", userData.user.id).single()
  if (roleError || !normalizeRole(roleRow?.role)) return json(403, { error: "Admin permission is required." })

  let payload: any = {}
  try { payload = await req.json() } catch { return json(400, { error: "Invalid JSON body." }) }

  const formTitle = String(payload?.formTitle || "").slice(0, 120)
  const sessions = Number(payload?.sessions || 0)
  const completed = Number(payload?.completed || 0)
  const fields: FieldPayload[] = Array.isArray(payload?.fields) ? payload.fields.slice(0, 40) : []
  if (!fields.length) return json(400, { error: "fields is required." })

  const lines = fields.map(f => {
    const parts = [
      `${f.order}. "${String(f.label || "").slice(0, 160)}"`,
      `섹션 ${f.page}`,
      `유형 ${f.type}`,
      f.required ? "필수" : "선택",
      `도달 ${f.reach}`,
      `이탈 ${f.drop}`,
    ]
    const helper = String(f.helper || "").trim()
    parts.push(helper ? `도움말 "${helper.slice(0, 120)}"` : "도움말 없음")
    const placeholder = String(f.placeholder || "").trim()
    if (placeholder) parts.push(`입력 예시 "${placeholder.slice(0, 80)}"`)
    const options = Array.isArray(f.options) ? f.options.filter(Boolean).slice(0, 12) : []
    if (options.length) parts.push(`보기 ${f.optionCount}개: ${options.map(o => String(o).slice(0, 40)).join(" / ")}`)
    return parts.join(" | ")
  }).join("\n")

  const rate = sessions ? Math.round((completed / sessions) * 1000) / 10 : 0
  const prompt = `폼 제목: ${formTitle || "(제목 없음)"}
폼을 연 사람 ${sessions}명 중 ${completed}명이 제출을 끝냈습니다. 전환율 ${rate}%.

질문 목록:
${lines}

도달 대비 이탈이 큰 질문을 골라, 이 폼의 맥락에서 왜 거기서 멈추는지와 무엇을 어떻게 바꿀지 알려주세요.`

  const startedAt = Date.now()
  const outOfTime = () => Date.now() - startedAt > TOTAL_DEADLINE_MS

  try {
    let model = ""
    let response: Response | null = null

    // 후보를 한 번씩만 돌아본다. 503은 서비스 전체 혼잡이라 같은 모델을 다시 눌러도 소용이 없다.
    for (const candidate of MODEL_CANDIDATES) {
      if (outOfTime()) break
      model = candidate
      response = await callGemini(model, geminiKey, prompt)
      if (response && response.status !== 404 && response.status !== 503) break
    }

    // 후보가 전부 막혔으면 계정에서 실제로 쓸 수 있는 모델을 물어보고 한 번 더 시도한다.
    if ((!response || response.status === 404 || response.status === 503) && !outOfTime()) {
      const discovered = await discoverModel(geminiKey)
      if (discovered && discovered !== model) {
        model = discovered
        response = await callGemini(model, geminiKey, prompt)
      }
    }

    if (!response) {
      return json(502, { error: "지금 무료 모델이 응답하지 않아요. 30초쯤 뒤에 다시 눌러주세요." })
    }
    if (response.status === 503) {
      return json(502, { error: "지금 무료 모델에 요청이 몰려 있어요. 30초쯤 뒤에 다시 눌러주세요." })
    }

    if (!response.ok) {
      const detail = await response.json().catch(() => ({}))
      const message = String(detail?.error?.message || `Gemini 요청이 실패했어요 (${response.status}).`)
      if (response.status === 429) return json(502, { error: "무료 한도를 넘었어요. 잠시 후 다시 시도해 주세요." })
      if (response.status === 400 && /API key/i.test(message)) return json(502, { error: "Gemini API 키가 올바르지 않아요." })
      return json(502, { error: message.slice(0, 200) })
    }

    const result = await response.json()
    const candidate = result?.candidates?.[0]
    if (candidate?.finishReason === "SAFETY") {
      return json(502, { error: "AI가 요청을 처리하지 않았어요." })
    }
    const text = (candidate?.content?.parts || []).map((part: any) => String(part?.text || "")).join("")
    const parsed = JSON.parse(text || "{}")
    return json(200, {
      model,
      items: Array.isArray(parsed?.items) ? parsed.items.slice(0, 5) : [],
    })
  } catch (error: any) {
    return json(502, { error: error?.message ? String(error.message).slice(0, 200) : "AI 피드백을 받지 못했어요." })
  }
}
