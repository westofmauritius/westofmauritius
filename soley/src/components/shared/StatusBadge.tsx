import { getTranslations } from "next-intl/server";
import { Badge, type BadgeTone } from "@/components/ui";

const tones: Record<string, BadgeTone> = {
  new: "info",
  assigned: "info",
  offered: "warning",
  accepted: "info",
  quoted: "info",
  chosen: "success",
  installed: "success",
  won: "success",
  approved: "success",
  paid: "success",
  sent: "info",
  lost: "neutral",
  declined: "neutral",
  withdrawn: "neutral",
  cancelled: "neutral",
  draft: "neutral",
  void: "neutral",
  applied: "warning",
  in_review: "warning",
  pending: "warning",
  rejected: "danger",
  suspended: "danger",
};

/** A translated status label, coloured by meaning. */
export async function StatusBadge({
  kind,
  status,
}: {
  kind: "request" | "assignment" | "installer" | "review" | "invoice";
  status: string;
}) {
  const t = await getTranslations("status");
  return (
    <Badge tone={tones[status] ?? "neutral"}>
      {t(`${kind}.${status}` as "request.new")}
    </Badge>
  );
}
