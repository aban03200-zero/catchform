import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  const version =
    process.env.NEXT_PUBLIC_APP_VERSION ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.VERCEL_DEPLOYMENT_ID ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    "local"

  return NextResponse.json(
    { version, checkedAt: new Date().toISOString() },
    { headers: { "cache-control": "no-store, max-age=0" } },
  )
}
