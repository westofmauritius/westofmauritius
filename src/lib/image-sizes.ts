/**
 * The image widths we generate (scripts/optimize-images.mjs) and that Next.js
 * asks for (next.config.ts). Kept in one place so they always match.
 */
export const deviceSizes = [640, 960, 1280, 1920, 2560];
export const imageSizes = [256, 384];
export const allImageWidths = [...imageSizes, ...deviceSizes];

/** Photos the build resizes. SVGs and other files are served as they are. */
export const optimizableImage = /^\/images\/.+\.(jpe?g|png|webp|avif)$/i;
