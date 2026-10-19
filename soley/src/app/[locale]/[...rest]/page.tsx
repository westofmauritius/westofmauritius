import { notFound } from "next/navigation";

// Unknown addresses under a language get the translated 404 page, inside
// the site's layout.
export default function CatchAll() {
  notFound();
}
