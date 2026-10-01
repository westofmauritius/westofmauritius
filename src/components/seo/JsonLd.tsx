/**
 * Structured data for search engines (schema.org, as JSON-LD). Google reads
 * it to understand what a page is about, e.g. a restaurant with a location
 * and opening hours.
 */
export function JsonLd({ data }: { data: object }) {
  // Escaping "<" stops text inside the data from closing the <script> tag.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
