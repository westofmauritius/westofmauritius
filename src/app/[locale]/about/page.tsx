import { textPage } from "@/lib/text-page";

// Text edited in Keystatic → Site → About. The photos are area photos.
const page = textPage("about", "/about", {
  photos: { hero: "tamarin", aside: ["flic-en-flac", "chamarel", "le-morne"] },
});
export const generateMetadata = page.generateMetadata;
export default page.Page;
