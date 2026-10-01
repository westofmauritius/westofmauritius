import type { Page } from "@playwright/test";

/**
 * Forms reject submissions made within 3 seconds of the page opening (a bot
 * check). Tests wait that long before submitting, like a person would.
 */
export const waitLikeAHuman = (page: Page) => page.waitForTimeout(3100);

/**
 * Each test pretends to come from its own IP address, so the per-visitor
 * rate limits of the forms do not interfere between tests.
 */
export const uniqueIp = () =>
  `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
