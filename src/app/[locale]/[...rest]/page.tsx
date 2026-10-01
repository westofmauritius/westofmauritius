import { notFound } from "next/navigation";

// Catches every URL that matches no other page, so it gets the translated
// not-found page above (inside the site layout) instead of Next's default.
export default function CatchAll() {
  notFound();
}
