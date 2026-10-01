/**
 * The image widths we generate (scripts/optimize-images.mjs) and that Next.js
 * asks for (next.config.ts). Kept in one place so they always match.
 */
// 828 matches a typical phone (≈ 412 px wide at 2× density), so phones do not
// have to download the 960 px file.
export const deviceSizes = [640, 828, 960, 1280, 1920, 2560];
export const imageSizes = [256, 384];
export const allImageWidths = [...imageSizes, ...deviceSizes];

/** Photos the build resizes. SVGs and other files are served as they are. */
export const optimizableImage = /^\/images\/.+\.(jpe?g|png|webp|avif)$/i;
