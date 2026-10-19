import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Language-aware versions of the Next.js navigation helpers. Always import
 * Link, redirect, usePathname and useRouter from here, never from
 * "next/link" or "next/navigation", so every URL gets the language prefix
 * and the translated path.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
