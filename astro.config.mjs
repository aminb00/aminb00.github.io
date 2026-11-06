import fs from 'node:fs';
import { defineConfig } from 'astro/config';

// The original portrait can carry EXIF data (camera, GPS). Pages use the WebP
// that scripts/docs.mjs makes from it, so the JPG is removed from the build.
const dropOriginals = {
  name: 'drop-originals',
  hooks: {
    'astro:build:done': ({ dir }) => {
      fs.rmSync(new URL('img/portrait.jpg', dir), { force: true });
    },
  },
};

export default defineConfig({
  // The only place the domain lives (see README, "Custom domain").
  site: process.env.SITE_URL ?? 'https://aminb00.github.io',
  trailingSlash: 'always',
  outDir: process.env.OUT_DIR ?? './dist',
  build: { format: 'directory', inlineStylesheets: 'always' },
  // Astro 7 defaults to 'jsx', which drops the spaces between inline
  // elements and would glue "[code] [PDF]" together.
  compressHTML: true,
  devToolbar: { enabled: false },
  integrations: [dropOriginals],
});
