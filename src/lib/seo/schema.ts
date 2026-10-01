import type {
  Area,
  Guide,
  Place,
  PlaceCategory,
  Weekday,
} from "@/lib/content/types";
import { siteUrl } from "@/lib/site";

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
    "@type": schemaType[place.category],
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
    locale: string;
    brand: string;
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
    author: { "@type": "Organization", name: options.brand, url: siteUrl },
    publisher: { "@type": "Organization", name: options.brand, url: siteUrl },
    ...(options.mentions.length > 0 && {
      mentions: options.mentions.map((m) => ({
        "@type": "Place",
        name: m.name,
        url: m.url,
      })),
    }),
  };
}
