import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadScenario, loadScenarios } from "@/scenarios/load";
import { Summary } from "@/components/Summary";

export const dynamicParams = false;

export function generateStaticParams() {
  return loadScenarios().map((s) => ({ id: s.id }));
}

export const metadata: Metadata = { title: "Month end summary" };

export default async function SummaryPage({ params }: PageProps<"/scenarios/[id]/summary">) {
  const { id } = await params;
  const scenario = loadScenario(id);
  if (!scenario) notFound();
  return <Summary scenario={scenario} />;
}
