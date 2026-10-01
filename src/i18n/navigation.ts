import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Language-aware versions of Next.js navigation helpers. Always import Link,
 * redirect, usePathname and useRouter from here instead of from "next/link" or
 * "next/navigation", so URLs get the right language prefix and translated path.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
