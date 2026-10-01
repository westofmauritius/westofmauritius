import { describe, expect, it } from "vitest";
import imageLoader from "./image-loader";

describe("imageLoader", () => {
  it("points photos at their resized WebP copy", () => {
    expect(imageLoader({ src: "/images/places/x/photo.jpg", width: 960 })).toBe(
      "/_img/images/places/x/photo-960.webp",
    );
  });

  it("rounds up to the nearest generated width", () => {
    expect(imageLoader({ src: "/images/a.PNG", width: 1000 })).toBe(
      "/_img/images/a-1280.webp",
    );
    expect(imageLoader({ src: "/images/a.png", width: 9999 })).toBe(
      "/_img/images/a-2560.webp",
    );
  });

  it("leaves SVGs and other files alone", () => {
    expect(imageLoader({ src: "/images/a.svg", width: 640 })).toBe(
      "/images/a.svg",
    );
    expect(imageLoader({ src: "https://example.com/a.jpg", width: 640 })).toBe(
      "https://example.com/a.jpg",
    );
  });
});
