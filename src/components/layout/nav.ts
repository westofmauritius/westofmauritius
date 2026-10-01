import type { StaticPathname } from "@/i18n/routing";

/**
 * One entry in a navigation list. `href` is an internal route from
 * src/i18n/routing.ts, so a typo or a removed page is a type error.
 */
export type NavItem = { label: string; href: StaticPathname };
