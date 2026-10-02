import { collection, config, fields, singleton } from "@keystatic/core";
import type { ComponentSchema } from "@keystatic/core";
import { routing, type Locale } from "@/i18n/routing";
import { guideCategoryKeys } from "@/lib/guide-categories";

/**
 * Keystatic content model.
 *
 * Keystatic gives the editing UI at /keystatic. Every save writes plain files
 * into content/ (YAML for fields, .mdoc for long text) and images into
 * public/images/, so all content lives in git next to the code.
 *
 * Translation pattern: fields that are the same in every language (map
 * position, links, images, "featured") are stored once. Everything a reader
 * reads is inside `content`, which has one block per language (see
 * `localized` below). Adding a language in src/i18n/routing.ts adds a block
 * here automatically.
 */

// --- Storage -----------------------------------------------------------------

// "local" (default): edits are written straight to disk. Used with
// `npm run dev` on your own machine.
// "github": edits are committed to the GitHub repo, which triggers a new
// Cloudflare build. Used on the live site once the GitHub app is set up
// (see docs/content-editing.md). NEXT_PUBLIC_ because the editor UI runs in
// the browser and needs to know it too.
const storage =
  process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github"
    ? ({ kind: "github", repo: "westofmauritius/westofmauritius" } as const)
    : ({ kind: "local" } as const);

// --- Shared building blocks --------------------------------------------------

const localeLabels: Record<Locale, string> = { en: "English", fr: "Français" };

/**
 * One block of fields per language: { en: {...}, fr: {...} }.
 * `schema` is a function so every language gets its own field instances.
 */
function localized<S extends Record<string, ComponentSchema>>(schema: () => S) {
  const perLocale = Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      fields.object(schema(), { label: localeLabels[locale] }),
    ]),
  ) as Record<Locale, ReturnType<typeof fields.object<S>>>;
  return fields.object(perLocale, { label: "Text per language" });
}

/**
 * The URL of an entry in one language, e.g. "meilleures-plages" in French.
 * Optional: when empty, the internal name's URL is used.
 */
const localSlug = () =>
  fields.text({
    label: "URL in this language",
    description:
      "Lower-case words joined by hyphens, e.g. meilleures-plages. Leave empty to use the internal name.",
    validation: {
      pattern: {
        regex: /^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        message:
          "Use lower-case letters, digits and hyphens only, e.g. meilleures-plages",
      },
    },
  });

const placeholder = fields.checkbox({
  label: "Placeholder",
  description:
    "Tick while this entry contains invented layout text. Placeholder pages show a visible label, are hidden from search engines and left out of the sitemap.",
  defaultValue: false,
});

/** Gradient shown until a real photo is uploaded. */
const placeholderTone = fields.select({
  label: "Placeholder colour",
  description: "Used only while no image is uploaded.",
  options: [
    { label: "Lagoon", value: "lagoon" },
    { label: "Sunset", value: "sunset" },
    { label: "Sand", value: "sand" },
    { label: "Ocean", value: "ocean" },
  ],
  defaultValue: "lagoon",
});

const location = (label: string) =>
  fields.object(
    {
      lat: fields.number({
        label: "Latitude",
        description: "e.g. -20.3256 (negative = south of the equator)",
        validation: { isRequired: true, min: -21, max: -19.9 },
        step: 0.000001,
      }),
      lng: fields.number({
        label: "Longitude",
        description: "e.g. 57.3708",
        validation: { isRequired: true, min: 57.2, max: 57.9 },
        step: 0.000001,
      }),
    },
    {
      label,
      description:
        "Right-click the spot in Google Maps and click the numbers to copy them: the first is latitude, the second longitude.",
    },
  );

const seoDescription = () =>
  fields.text({
    label: "Search engine description",
    description:
      "About 150 characters, shown under the title in Google. Leave empty to use the intro.",
    validation: { length: { max: 170 } },
  });

/** One photo with alt text per language and an optional photographer credit. */
const photo = (directory: string) =>
  fields.object({
    image: fields.image({
      label: "Image",
      directory: `public/images/${directory}`,
      publicPath: `/images/${directory}/`,
      validation: { isRequired: true },
    }),
    alt: localized(() => ({
      text: fields.text({
        label: "Alt text",
        description: "Describe the photo for people who cannot see it.",
      }),
    })),
    credit: fields.text({ label: "Photographer / credit" }),
    creditUrl: fields.url({ label: "Credit link" }),
  });

/**
 * Where the facts in an entry come from. Shown as a "Sources" list at the
 * end of the page, so readers (and search engines) can check our work.
 */
const sources = () =>
  fields.array(
    fields.object({
      title: fields.text({
        label: "Title",
        description: "The page or document, e.g. Le Morne Brabant.",
        validation: { isRequired: true },
      }),
      publisher: fields.text({
        label: "Publisher",
        description: "e.g. Wikipedia, Statistics Mauritius, UNESCO.",
      }),
      url: fields.url({ label: "Link", validation: { isRequired: true } }),
      checkedAt: fields.date({
        label: "Checked on",
        description: "When you last checked the facts against this source.",
      }),
    }),
    {
      label: "Sources",
      description: "Add every source you checked facts against.",
      itemLabel: (props) => props.fields.title.value || "Source",
    },
  );

/** A simple page of text (About, privacy policy …), one block per language. */
function textPage(label: string, path: `${string}/`) {
  return singleton({
    label,
    path,
    format: { data: "yaml" },
    schema: {
      placeholder,
      updatedAt: fields.date({ label: "Last updated" }),
      content: localized(() => ({
        title: fields.text({
          label: "Title",
          validation: { isRequired: true },
        }),
        intro: fields.text({ label: "Intro", multiline: true }),
        body: fields.markdoc({ label: "Text" }),
        seoDescription: seoDescription(),
      })),
    },
  });
}

// --- Options used by several collections --------------------------------------

export const placeCategories = [
  { label: "Restaurant", value: "restaurant" },
  { label: "Activity", value: "activity" },
  { label: "Beach", value: "beach" },
  { label: "Sunset spot", value: "sunset" },
  { label: "Shopping", value: "shopping" },
] as const;

/** schema.org types a place can have; "auto" derives it from the category. */
export const placeKinds = [
  { label: "From the category", value: "auto" },
  { label: "Park or nature reserve", value: "Park" },
  { label: "Mountain", value: "Mountain" },
  {
    label: "Monument or historic site",
    value: "LandmarksOrHistoricalBuildings",
  },
  { label: "Museum", value: "Museum" },
  { label: "Tourist attraction", value: "TouristAttraction" },
] as const;

const weekdays = [
  { label: "Monday", value: "mo" },
  { label: "Tuesday", value: "tu" },
  { label: "Wednesday", value: "we" },
  { label: "Thursday", value: "th" },
  { label: "Friday", value: "fr" },
  { label: "Saturday", value: "sa" },
  { label: "Sunday", value: "su" },
] as const;

const time = (label: string) =>
  fields.text({
    label,
    description: "24-hour clock, e.g. 09:00",
    validation: {
      length: { min: 5, max: 5 },
      pattern: {
        regex: /^([01]\d|2[0-3]):[0-5]\d$/,
        message: "Use HH:MM, e.g. 09:00",
      },
    },
  });

// --- Collections ---------------------------------------------------------------

export default config({
  storage,
  ui: {
    brand: { name: "West of Mauritius" },
    navigation: {
      Site: ["homepage", "about", "author", "privacy", "cookies", "terms"],
      Guide: ["areas", "places", "guides"],
      "Live in the West": ["living"],
    },
  },
  singletons: {
    about: textPage("About us", "content/pages/about/"),
    privacy: textPage("Privacy policy", "content/pages/privacy/"),
    cookies: textPage("Cookies", "content/pages/cookies/"),
    terms: textPage("Terms of use", "content/pages/terms/"),
    author: singleton({
      label: "Author (Oliver)",
      path: "content/author/",
      format: { data: "yaml" },
      schema: {
        placeholder: fields.checkbox({
          label: "Placeholder",
          description:
            "Tick while the bio is not written yet. The author page is then hidden from search engines and the short bio is not shown elsewhere.",
          defaultValue: true,
        }),
        name: fields.text({
          label: "Name",
          validation: { isRequired: true },
        }),
        photo: fields.conditional(
          fields.checkbox({ label: "Has a portrait", defaultValue: false }),
          { true: photo("author"), false: fields.empty() },
        ),
        links: fields.array(
          fields.url({
            label: "Profile link",
            description: "e.g. your Instagram or LinkedIn page.",
          }),
          {
            label: "Profile links",
            description:
              "Public profiles that are yours. Search engines use them to know who the author is.",
            itemLabel: (props) => props.value || "Link",
          },
        ),
        content: localized(() => ({
          role: fields.text({
            label: "One line under your name",
            description: "e.g. Mauritian, founder and editor.",
          }),
          shortBio: fields.text({
            label: "Short bio",
            description: "Two or three sentences, shown on the start page.",
            multiline: true,
          }),
          body: fields.markdoc({ label: "Your story" }),
          seoDescription: seoDescription(),
        })),
      },
    }),
    homepage: singleton({
      label: "Start page",
      path: "content/homepage/",
      format: { data: "yaml" },
      schema: {
        hero: fields.conditional(
          fields.checkbox({
            label: "Use a photo at the top",
            description:
              "Without a photo, the start page shows an illustrated west-coast sunset. Choose a wide photo (at least 2400 px) that really shows the west coast.",
            defaultValue: false,
          }),
          { true: photo("home"), false: fields.empty() },
        ),
      },
    }),
  },
  collections: {
    areas: collection({
      label: "Areas",
      path: "content/areas/*/",
      format: { data: "yaml" },
      slugField: "name",
      columns: ["order"],
      schema: {
        name: fields.slug({
          name: {
            label: "Name",
            description: "The usual name, e.g. Black River. Also sets the URL.",
          },
        }),
        order: fields.integer({
          label: "Order",
          description: "Position in lists, north to south: 1 = first.",
          defaultValue: 1,
        }),
        placeholder,
        updatedAt: fields.date({ label: "Last updated" }),
        sources: sources(),
        location: location("Map centre"),
        mapZoom: fields.integer({
          label: "Map zoom",
          description: "12 shows a whole town, 14 a few streets.",
          defaultValue: 13,
          validation: { min: 9, max: 17 },
        }),
        hero: fields.conditional(
          fields.checkbox({ label: "Has a main photo", defaultValue: false }),
          { true: photo("areas"), false: fields.empty() },
        ),
        placeholderTone,
        content: localized(() => ({
          name: fields.text({
            label: "Name in this language",
            description: "e.g. Rivière Noire in French.",
            validation: { isRequired: true },
          }),
          tagline: fields.text({
            label: "Tagline",
            description: "One short line under the name.",
          }),
          intro: fields.text({ label: "Intro", multiline: true }),
          body: fields.markdoc({ label: "Main text" }),
          seoDescription: seoDescription(),
        })),
      },
    }),

    places: collection({
      label: "Places",
      path: "content/places/*/",
      format: { data: "yaml" },
      slugField: "name",
      columns: ["category", "area", "featured"],
      schema: {
        name: fields.slug({
          name: {
            label: "Name",
            description: "The official name. Also sets the URL.",
          },
        }),
        category: fields.select({
          label: "Category",
          options: placeCategories,
          defaultValue: "restaurant",
        }),
        area: fields.relationship({
          label: "Area",
          collection: "areas",
          validation: { isRequired: true },
        }),
        placeholder,
        kind: fields.select({
          label: "Kind (for search engines)",
          description:
            "What the place is, as search engines understand it. “From the category” suits most places.",
          options: placeKinds,
          defaultValue: "auto",
        }),
        featured: fields.checkbox({
          label: "Featured",
          description:
            "Shown first in lists with a “Featured” label. Use for paid or editorial placements.",
          defaultValue: false,
        }),
        featuredUntil: fields.date({
          label: "Featured until",
          description:
            "Optional. After this date the place is no longer featured.",
        }),
        location: location("Location"),
        address: fields.text({ label: "Address" }),
        website: fields.url({ label: "Website" }),
        affiliateUrl: fields.url({
          label: "Affiliate / booking link",
          description:
            "Optional. Shown as the main button instead of the website and marked as a partner link.",
        }),
        phone: fields.text({ label: "Phone / WhatsApp" }),
        openingHours: fields.array(
          fields.object({
            days: fields.multiselect({ label: "Days", options: weekdays }),
            opens: time("Opens"),
            closes: time("Closes"),
          }),
          {
            label: "Opening hours",
            description:
              "One row per set of days with the same hours. Leave empty if unknown.",
            itemLabel: (props) =>
              `${props.fields.days.value.join(", ") || "…"} ${props.fields.opens.value}–${props.fields.closes.value}`,
          },
        ),
        lastVerified: fields.date({
          label: "Details last checked",
          description: "When opening hours and links were last confirmed.",
        }),
        images: fields.array(photo("places"), {
          label: "Photos",
          description: "The first photo is the main image.",
          itemLabel: (props) => props.fields.credit.value || "Photo",
        }),
        placeholderTone,
        content: localized(() => ({
          // Optional: many names stay the same (Le Morne Brabant), but some
          // read better translated ("Le Morne public beach" / "Plage publique
          // du Morne").
          name: fields.text({
            label: "Name in this language",
            description: "Leave empty to use the name above.",
          }),
          summary: fields.text({
            label: "Summary",
            description: "One or two sentences for cards and lists.",
            multiline: true,
          }),
          body: fields.markdoc({ label: "Description" }),
          hoursNote: fields.text({
            label: "Note on opening hours",
            description: "e.g. “Closed in February” or “Booking recommended”.",
          }),
          seoDescription: seoDescription(),
        })),
      },
    }),

    guides: collection({
      label: "Guides",
      path: "content/guides/*/",
      format: { data: "yaml" },
      slugField: "slug",
      columns: ["category", "publishedAt"],
      schema: {
        slug: fields.slug({
          name: {
            label: "Internal name",
            description:
              "Short English name, e.g. Best sunset spots. Sets the URL.",
          },
        }),
        category: fields.select({
          label: "Category",
          // The categories and their URLs are defined in src/lib/guide-categories.ts.
          options: guideCategoryKeys.map((key) => ({
            label: key[0].toUpperCase() + key.slice(1),
            value: key,
          })),
          defaultValue: "restaurants",
        }),
        placeholder,
        featured: fields.checkbox({
          label: "Featured on the start page",
          defaultValue: false,
        }),
        publishedAt: fields.date({
          label: "Published",
          defaultValue: { kind: "today" },
        }),
        updatedAt: fields.date({ label: "Last updated" }),
        sources: sources(),
        areas: fields.multiRelationship({
          label: "Areas covered",
          collection: "areas",
        }),
        places: fields.multiRelationship({
          label: "Places mentioned",
          collection: "places",
        }),
        hero: fields.conditional(
          fields.checkbox({ label: "Has a main photo", defaultValue: false }),
          { true: photo("guides"), false: fields.empty() },
        ),
        placeholderTone,
        content: localized(() => ({
          title: fields.text({
            label: "Title",
            validation: { isRequired: true },
          }),
          slug: localSlug(),
          excerpt: fields.text({ label: "Intro", multiline: true }),
          body: fields.markdoc({ label: "Article" }),
          seoDescription: seoDescription(),
        })),
      },
    }),

    living: collection({
      label: "Live in the West articles",
      path: "content/living/*/",
      format: { data: "yaml" },
      slugField: "slug",
      columns: ["kind", "order"],
      schema: {
        slug: fields.slug({
          name: {
            label: "Internal name",
            description: "Short English name, e.g. PDS scheme. Sets the URL.",
          },
        }),
        kind: fields.select({
          label: "Type",
          options: [
            {
              label: "Buying scheme (PDS, IRS, RES, Smart City …)",
              value: "scheme",
            },
            { label: "Area guide for buyers", value: "area" },
            { label: "Buying process / general", value: "general" },
          ],
          defaultValue: "scheme",
        }),
        area: fields.relationship({
          label: "Area",
          description: "Only for area guides.",
          collection: "areas",
        }),
        order: fields.integer({ label: "Order", defaultValue: 1 }),
        placeholder,
        publishedAt: fields.date({
          label: "Published",
          defaultValue: { kind: "today" },
        }),
        updatedAt: fields.date({ label: "Last updated" }),
        sources: sources(),
        content: localized(() => ({
          title: fields.text({
            label: "Title",
            validation: { isRequired: true },
          }),
          slug: localSlug(),
          excerpt: fields.text({ label: "Intro", multiline: true }),
          body: fields.markdoc({ label: "Article" }),
          seoDescription: seoDescription(),
        })),
      },
    }),
  },
});
