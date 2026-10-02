/**
 * Which host serves what. The same Worker answers on the production domain
 * and on preview addresses (*.workers.dev), so whether a page may be indexed
 * is decided per request, from the host, not at build time: a preview can
 * then never be indexed by mistake, whatever was set when it was built.
 *
 * Used by worker.mjs (in front of the whole site) and tested in hosts.test.ts.
 */

/** The previous domain. Only ever redirected, never served. */
const retiredHosts = ["westmauritius.mu", "www.westmauritius.mu"];

export type SearchIndexing = "auto" | "off";

export type HostDecision =
  | { kind: "redirect"; location: string }
  | { kind: "serve"; indexable: boolean };

export function decideHost(
  requestUrl: string,
  config: { siteUrl: string; indexing: SearchIndexing },
): HostDecision {
  const url = new URL(requestUrl);
  const production = new URL(config.siteUrl);
  const host = url.hostname;

  // One address per page: the retired domain and "www." go to the canonical
  // host, keeping the path and query.
  if (retiredHosts.includes(host) || host === `www.${production.hostname}`) {
    return {
      kind: "redirect",
      location: `${production.origin}${url.pathname}${url.search}`,
    };
  }

  return {
    kind: "serve",
    indexable: config.indexing !== "off" && host === production.hostname,
  };
}

/** robots.txt for every host except production. */
export const blockAllRobots = "User-agent: *\nDisallow: /\n";
