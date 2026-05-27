import { CatchFormClient } from "@/components/CatchFormClient"

export default function FormSlugPage({
  params,
}: {
  params: { slug: string }
}) {
  return <CatchFormClient slug={params.slug} />
}
