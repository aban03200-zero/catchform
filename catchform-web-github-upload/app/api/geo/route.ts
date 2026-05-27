import { headers } from "next/headers"
import { NextResponse } from "next/server"

function readHeader(h: Headers, names: string[]) {
  for (const name of names) {
    const value = h.get(name)
    if (value) {
      try {
        return decodeURIComponent(value)
      } catch {
        return value
      }
    }
  }
  return ""
}

export async function GET() {
  const h = headers()
  const country = readHeader(h, [
    "x-vercel-ip-country",
    "cf-ipcountry",
    "x-country",
  ])
  const region = readHeader(h, [
    "x-vercel-ip-country-region",
    "x-vercel-ip-region",
    "x-region",
  ])
  const city = readHeader(h, [
    "x-vercel-ip-city",
    "x-city",
  ])

  return NextResponse.json(
    { country, region, city },
    {
      headers: {
        "cache-control": "private, max-age=3600",
      },
    },
  )
}
