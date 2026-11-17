import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadScenario, loadScenarios } from "@/scenarios/load";
import { Simulator } from "@/components/Simulator";

export const dynamicParams = false;

export function generateStaticParams() {
  return loadScenarios().map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/scenarios/[id]/play">): Promise<Metadata> {
  const { id } = await params;
  const scenario = loadScenario(id);
  return { title: scenario ? `Inbox, ${scenario.company.name}` : undefined };
}

export default async function PlayPage({ params }: PageProps<"/scenarios/[id]/play">) {
  const { id } = await params;
  const scenario = loadScenario(id);
  if (!scenario) notFound();
  return <Simulator scenario={scenario} />;
}
