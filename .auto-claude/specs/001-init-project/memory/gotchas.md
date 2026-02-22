# Gotchas & Pitfalls

Things to watch out for in this codebase.

## [2026-02-22 08:46]
Next.js 16 static export (output: 'export') does NOT support: redirects, rewrites, headers, middleware/proxy.ts, or Image Optimization. Must use images.unoptimized: true, client-side redirects via catch-all route, and trailingSlash: true.

_Context: Critical constraints for the entire project - every subtask must respect these limitations_

## [2026-02-22 08:46]
Tailwind CSS v4 uses CSS-first config with @theme directive in globals.css. No tailwind.config.js/ts file. PostCSS plugin is @tailwindcss/postcss (not tailwindcss). Single import: @import 'tailwindcss' replaces old @tailwind directives.

_Context: Phase 1 setup - incorrect Tailwind config will break all styling_

## [2026-02-22 08:46]
In Next.js 16 with App Router, params is a Promise and MUST be awaited: const { locale } = await params. This is different from Next.js 14/15. Every page and layout using params must handle this.

_Context: Affects every page.tsx and layout.tsx that receives params - critical for i18n routing_
