import { redirect } from "next/navigation";

export default async function CalendarRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  redirect(month ? `/training?month=${month}` : "/training");
}
