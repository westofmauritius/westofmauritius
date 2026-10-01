import { textPage } from "@/lib/text-page";

// Text edited in Keystatic → Site → About.
const page = textPage("about", "/about");
export const generateMetadata = page.generateMetadata;
export default page.Page;
