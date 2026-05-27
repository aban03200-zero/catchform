import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "CatchForm",
  description: "CatchForm form builder and response dashboard",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
