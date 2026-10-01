import { textPage } from "@/lib/text-page";

// Text edited in Keystatic → Site → Terms.
const page = textPage("terms", "/terms");
export const generateMetadata = page.generateMetadata;
export default page.Page;
