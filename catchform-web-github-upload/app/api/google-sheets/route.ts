import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { webhookUrl, payload } = await req.json()
    const url = String(webhookUrl || "").trim()

    if (!url || !url.startsWith("https://script.google.com/")) {
      return NextResponse.json(
        { ok: false, error: "Apps Script Web App URL이 올바르지 않아요." },
        { status: 400 },
      )
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: new URLSearchParams({
        payload: JSON.stringify(payload || {}),
      }).toString(),
      redirect: "follow",
      cache: "no-store",
    })

    const text = await response.text().catch(() => "")
    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: text || `Apps Script 전송 실패 (${response.status})`,
        },
        { status: 502 },
      )
    }

    let appsScriptResponse: any = undefined
    try {
      appsScriptResponse = text ? JSON.parse(text) : undefined
    } catch {}

    if (appsScriptResponse && appsScriptResponse.ok === false) {
      return NextResponse.json(
        {
          ok: false,
          error:
            appsScriptResponse.message ||
            appsScriptResponse.error ||
            "Apps Script에서 전송 실패 응답을 받았어요.",
          appsScriptResponse,
        },
        { status: 502 },
      )
    }

    return NextResponse.json({
      ok: true,
      ...(appsScriptResponse && typeof appsScriptResponse === "object"
        ? appsScriptResponse
        : {}),
      appsScriptResponse,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Google Sheets 전송 중 오류가 발생했어요.",
      },
      { status: 500 },
    )
  }
}
