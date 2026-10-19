import type { MDXComponents } from "mdx/types";

/**
 * How MDX guides render. The `.prose` class (globals.css) styles the text;
 * here, links to other sites open safely and internal links stay normal.
 * Required by @next/mdx for the App Router.
 */
const components: MDXComponents = {
  a: ({ href = "", children, ...props }) => {
    const external = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        {...props}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  },
};

export function useMDXComponents(): MDXComponents {
  return components;
}
