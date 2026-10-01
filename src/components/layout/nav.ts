import type { StaticPathname } from "@/i18n/routing";

/**
 * One entry in a navigation list. `href` is the internal route (for server
 * components); `path` is the finished public URL in the current language,
 * resolved on the server so browser-side code needs no routing library.
 */
export type NavItem = { label: string; href: StaticPathname; path: string };
