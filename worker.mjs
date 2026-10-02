/**
 * The Worker's entry point: a thin layer in front of the site that OpenNext
 * builds (.open-next/worker.js). It redirects www and the retired domain,
 * and keeps every host except production out of search engines (preview
 * addresses on workers.dev): see src/lib/hosts.ts.
 */
import handler from "./.open-next/worker.js";
import config from "./.open-next/site-config.json";
import { blockAllRobots, decideHost } from "./src/lib/hosts.ts";

const worker = {
  async fetch(request, env, ctx) {
    const decision = decideHost(request.url, config);
    if (decision.kind === "redirect") {
      return Response.redirect(decision.location, 301);
    }
    if (decision.indexable) return handler.fetch(request, env, ctx);

    if (new URL(request.url).pathname === "/robots.txt") {
      return new Response(blockAllRobots, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    const response = await handler.fetch(request, env, ctx);
    const blocked = new Response(response.body, response);
    blocked.headers.set("X-Robots-Tag", "noindex, nofollow");
    return blocked;
  },
};

export default worker;

// OpenNext's Durable Objects must be exported from the entry point too.
export {
  DOQueueHandler,
  DOShardedTagCache,
  BucketCachePurge,
} from "./.open-next/worker.js";
