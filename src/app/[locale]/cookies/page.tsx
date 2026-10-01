import { textPage } from "@/lib/text-page";

// Text edited in Keystatic → Site → Cookies.
const page = textPage("cookies", "/cookies");
export const generateMetadata = page.generateMetadata;
export default page.Page;
