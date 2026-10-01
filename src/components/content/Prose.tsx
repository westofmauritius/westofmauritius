import Markdoc, { type Node } from "@markdoc/markdoc";
import React from "react";
import { cn } from "@/lib/cn";

/**
 * Renders long text written in Keystatic (stored as Markdoc) as HTML with the
 * site's reading styles (see `.prose-west` in globals.css).
 */
export function Prose({ node, className }: { node: Node; className?: string }) {
  const tree = Markdoc.transform(node);
  return <div className={cn("prose-west", className)}>{Markdoc.renderers.react(tree, React)}</div>;
}
