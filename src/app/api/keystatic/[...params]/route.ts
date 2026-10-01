import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";
import { keystaticEnabled } from "@/lib/keystatic";

// Server side of the editor: saves files locally, or handles GitHub login
// and commits when GitHub storage is used.
const handler = makeRouteHandler({ config });

const disabled = () => new Response("Not found", { status: 404 });

export const GET = keystaticEnabled ? handler.GET : disabled;
export const POST = keystaticEnabled ? handler.POST : disabled;
