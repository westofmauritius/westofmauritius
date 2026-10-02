import type {
  Area,
  Guide,
  LivingArticle,
  Place,
  PlaceCategory,
  Weekday,
} from "@/lib/content/types";
import type { Locale } from "@/i18n/routing";
import type { Author } from "@/lib/content/author";
import { siteUrl } from "@/lib/site";
import { absoluteUrl } from "./urls";

/**
 * schema.org descriptions of our content for search engines. Only real
 * content gets structured data: placeholder entries are skipped by the pages,
 * so invented details never reach Google. We never add ratings or reviews.
 */

const schemaType: Record<PlaceCategory, string> = {
  restaurant: "Restaurant",
  beach: "Beach",
  activity: "TouristAttraction",
  sunset: "TouristAttraction",
  shopping: "ShoppingCenter",
};

const schemaDay: Record<Weekday, string> = {
  mo: "https://schema.org/Monday",
  tu: "https://schema.org/Tuesday",
  we: "https://schema.org/Wednesday",
  th: "https://schema.org/Thursday",
  fr: "https://schema.org/Friday",
  sa: "https://schema.org/Saturday",
  su: "https://schema.org/Sunday",
};

/** Stable ids, so every page's structured data points at the same entities. */
const organizationId = `${siteUrl}/#organization`;
const authorId = `${siteUrl}/#author`;

/** The site's author, as referenced from articles. */
function authorRef(author: Author, locale: Locale) {
  return {
    "@type": "Person",
    "@id": authorId,
    name: author.name,
    url: absoluteUrl("/about/oliver", locale),
  };
}

const publisherRef = (brand: string) => ({
  "@type": "Organization",
  "@id": organizationId,
  name: brand,
  url: siteUrl,
  logo: { "@type": "ImageObject", url: `${siteUrl}/icons/icon-512.png` },
});

const geo = (loc: { lat: number; lng: number }) => ({
  "@type": "GeoCoordinates",
  latitude: loc.lat,
  longitude: loc.lng,
});

/** Images in content are site paths ("/images/…"); schema.org wants full URLs. */
const fullUrl = (path: string) =>
  path.startsWith("http") ? path : siteUrl + path;

export function areaSchema(area: Area, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: area.name,
    description: area.intro,
    url,
    geo: geo(area.location),
    ...(area.hero && { image: fullUrl(area.hero.src) }),
    containedInPlace: { "@type": "Country", name: "Mauritius" },
  };
}

export function placeSchema(place: Place, areaName: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": place.kind ?? schemaType[place.category],
    name: place.name,
    description: place.summary,
    url,
    geo: geo(place.location),
    address: {
      "@type": "PostalAddress",
      ...(place.address && { streetAddress: place.address }),
      addressLocality: areaName,
      addressCountry: "MU",
    },
    ...(place.phone && { telephone: place.phone }),
    ...(place.website && { sameAs: [place.website] }),
    ...(place.images.length > 0 && {
      image: place.images.map((p) => fullUrl(p.src)),
    }),
    ...(place.openingHours.length > 0 && {
      openingHoursSpecification: place.openingHours.map((row) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: row.days.map((d) => schemaDay[d]),
        opens: row.opens,
        closes: row.closes,
      })),
    }),
  };
}

export function articleSchema(
  guide: Guide,
  url: string,
  options: {
    locale: Locale;
    brand: string;
    author: Author;
    mentions: { name: string; url: string }[];
  },
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.excerpt,
    url,
    mainEntityOfPage: url,
    inLanguage: options.locale,
    ...(guide.publishedAt && { datePublished: guide.publishedAt }),
    ...((guide.updatedAt ?? guide.publishedAt) && {
      dateModified: guide.updatedAt ?? guide.publishedAt,
    }),
    ...(guide.hero && { image: fullUrl(guide.hero.src) }),
    author: authorRef(options.author, options.locale),
    publisher: publisherRef(options.brand),
    ...(guide.sources.length > 0 && {
      citation: guide.sources.map((s) => s.url),
    }),
    ...(options.mentions.length > 0 && {
      mentions: options.mentions.map((m) => ({
        "@type": "Place",
        name: m.name,
        url: m.url,
      })),
    }),
  };
}

/** Who publishes the site, and the site itself (start page only). */
export function organizationSchema(
  brand: string,
  locale: Locale,
  homeUrl: string,
  author: Author,
) {
  return [
    {
      "@context": "https://schema.org",
      ...publisherRef(brand),
      url: homeUrl,
      founder: { "@id": authorId },
      areaServed: { "@type": "Place", name: "West coast of Mauritius" },
    },
    personSchema(author, locale),
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteUrl}/#website-${locale}`,
      name: brand,
      url: homeUrl,
      inLanguage: locale,
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ];
}

export function livingArticleSchema(
  article: LivingArticle,
  url: string,
  options: { locale: Locale; brand: string; author: Author },
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    url,
    mainEntityOfPage: url,
    inLanguage: options.locale,
    ...(article.publishedAt && { datePublished: article.publishedAt }),
    ...((article.updatedAt ?? article.publishedAt) && {
      dateModified: article.updatedAt ?? article.publishedAt,
    }),
    author: authorRef(options.author, options.locale),
    publisher: publisherRef(options.brand),
    ...(article.sources.length > 0 && {
      citation: article.sources.map((s) => s.url),
    }),
  };
}

/**
 * The author as a Person, linked to the organisation they founded. Articles
 * point at the same "@id", so search engines connect every article to one
 * author with one profile page.
 */
export function personSchema(author: Author, locale: Locale) {
  return {
    "@context": "https://schema.org",
    ...authorRef(author, locale),
    ...(author.role && { description: author.role }),
    nationality: { "@type": "Country", name: "Mauritius" },
    worksFor: { "@id": organizationId },
    knowsAbout: ["West coast of Mauritius", "Living in Mauritius"],
    ...(author.photo && { image: fullUrl(author.photo.src) }),
    ...(author.links.length > 0 && { sameAs: author.links }),
  };
}

/** The author page: a ProfilePage about the author. */
export function profilePageSchema(
  author: Author,
  locale: Locale,
  dateModified: string | null,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteUrl("/about/oliver", locale),
    inLanguage: locale,
    ...(dateModified && { dateModified }),
    mainEntity: personSchema(author, locale),
  };
}

/** Questions and answers on a page, for search results (real answers only). */
export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
