import Markdoc, { type Node, type RenderableTreeNode } from "@markdoc/markdoc";
import React from "react";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { typeset } from "@/lib/typography";

/** Applies the language's typographic rules (e.g. French spacing) to every text in the tree. */
function typesetTree(node: RenderableTreeNode, locale: Locale): RenderableTreeNode {
  if (typeof node === "string") return typeset(node, locale);
  if (Markdoc.Tag.isTag(node)) {
    node.children = node.children.map((child) => typesetTree(child, locale));
  }
  return node;
}

/**
 * Renders long text written in Keystatic (stored as Markdoc) as HTML with the
 * site's reading styles (see `.prose-west` in globals.css).
 */
export function Prose({
  node,
  locale,
  className,
}: {
  node: Node;
  locale: Locale;
  className?: string;
}) {
  const tree = typesetTree(Markdoc.transform(node), locale);
  return <div className={cn("prose-west", className)}>{Markdoc.renderers.react(tree, React)}</div>;
}
