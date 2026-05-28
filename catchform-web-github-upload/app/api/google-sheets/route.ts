import { NextRequest, NextResponse } from "next/server"

function readableGoogleHtmlError(text: string) {
  const body = String(text || "")
  if (!/^\s*<!doctype html|<html[\s>]/i.test(body)) return ""
  if (/Google Drive|unable to open the file|Page Not Found|docs\.google\.com/i.test(body)) {
    return "Google Drive/Docs 오류 페이지가 응답했어요. Apps Script Web App URL에 스프레드시트 주소가 아니라 `https://script.google.com/macros/s/.../exec` 형식의 웹앱 배포 URL을 넣어주세요."
  }
  return "Apps Script가 JSON이 아니라 HTML 페이지를 응답했어요. Web App 배포 URL(`/exec`)이 맞는지 확인해주세요."
}

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
    const htmlError = readableGoogleHtmlError(text)
    if (htmlError) {
      return NextResponse.json(
        {
          ok: false,
          error: htmlError,
        },
        { status: 502 },
      )
    }

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
