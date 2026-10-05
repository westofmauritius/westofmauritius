/**
 * The homepage hero's background video. Empty until the footage exists:
 * the photo shows on its own, exactly as before. See TODO_OLIVER.md for how
 * to prepare the files.
 *
 * Put the files in public/video/ and list them here, best format first.
 * The browser plays the first one it supports: AV1 or VP9 in WebM is about
 * half the size of H.264 MP4, which stays as the fallback for older
 * iPhones. `small` versions (about 720 px wide) are used on narrow screens.
 */
export type HeroVideoSource = { src: string; type: string };

export const heroVideo: {
  sources: HeroVideoSource[];
  small?: HeroVideoSource[];
} | null = null;

// Example, once the files are there:
// export const heroVideo = {
//   sources: [
//     { src: "/video/hero-1920.webm", type: 'video/webm; codecs="av01.0.08M.08"' },
//     { src: "/video/hero-1920.mp4", type: "video/mp4" },
//   ],
//   small: [
//     { src: "/video/hero-720.webm", type: 'video/webm; codecs="av01.0.05M.08"' },
//     { src: "/video/hero-720.mp4", type: "video/mp4" },
//   ],
// };
