import { NextResponse } from "next/server"

export const revalidate = 60

const VERSION_CACHE_CONTROL = "public, s-maxage=60, stale-while-revalidate=300"

export async function GET() {
  const version =
    process.env.NEXT_PUBLIC_APP_VERSION ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.VERCEL_DEPLOYMENT_ID ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    "local"

  return NextResponse.json(
    { version, checkedAt: new Date().toISOString() },
    { headers: { "cache-control": VERSION_CACHE_CONTROL } },
  )
}
