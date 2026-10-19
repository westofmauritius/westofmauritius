import type { MDXComponents } from "mdx/types";

/**
 * How MDX guides render. The `.prose` class (globals.css) styles the text;
 * here, links to other sites open safely, internal links stay normal and
 * tables scroll on narrow screens.
 * Required by @next/mdx for the App Router.
 */
const components: MDXComponents = {
  // Wide tables scroll sideways on phones instead of widening the page.
  table: (props) => (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  ),
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
