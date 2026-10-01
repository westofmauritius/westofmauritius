// The enquiry form is built in the next step; this keeps links working meanwhile.
import { ComingSoon } from "@/components/ui/ComingSoon";
import { resolveLocale } from "@/i18n/locale";

export default async function EnquirePage({
  params,
}: PageProps<"/[locale]/live-in-the-west/enquire">) {
  await resolveLocale(params);
  return <ComingSoon title="Enquiry" intro="" />;
}
