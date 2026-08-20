repo: Vkasamale/ganyu-hub
branch: main
path: public

## Last sync

date: 2026-08-13T21:07:46Z

### Updated in this project

- Imported `public/hero-photographer.webp` as `assets/hero-photographer.webp`.
- Built the token layer (colour, type, spacing, elevation, motion) from the attached `ganyu-design-handoff` codebase and `DESIGN.md`.
- Authored 22 components across core, money, listings, navigation and trust.
- Built two UI kits: the desktop web surface and the mobile PWA shell.

## Screen map

| Project file | Built from |
|---|---|
| `tokens/colors.css` | `tailwind.config.ts`, `app/globals.css`, `components/job-header.tsx`, `components/job-progress-bar.tsx` |
| `tokens/typography.css` | `app/globals.css`, `app/layout.tsx` |
| `tokens/elevation.css` | `app/globals.css`, `components/ui/card.tsx`, `components/creative-card.tsx` |
| `components/core/*` | `components/ui/{button,input,textarea,select,label,badge,card}.tsx`, `components/logo.tsx` |
| `components/money/*` | `components/job-header.tsx`, `job-progress-bar.tsx`, `money-input.tsx`, `pricing-explainer.tsx` |
| `components/listings/*` | `components/creative-card.tsx`, `job-card.tsx`, `service-card.tsx`, `feed-carousel.tsx` |
| `components/navigation/*` | `components/bottom-tab-bar.tsx`, `primary-nav.tsx`, `page-tabs.tsx`, `sticky-action-bar.tsx`, `search-scope.tsx`, `lib/nav.ts`, `components/nav-icons.tsx` |
| `components/trust/*` | `components/verified-badge.tsx`, `stars.tsx`, `star-rating-input.tsx`, `save-button.tsx`, `empty-state.tsx`, `tag-input.tsx`, `style-swatch.tsx`, `lib/styles.ts` |
| `ui_kits/web/*` | `app/page.tsx`, `components/home-hero.tsx`, `home-sections.tsx`, `home-proof.tsx`, `pre-footer.tsx`, `footer.tsx`, `navbar.tsx`, `filters-bar.tsx` |
| `ui_kits/mobile/*` | `components/bottom-tab-bar.tsx`, `signed-in-home.tsx`, `home-action-cards.tsx`, `thread-list.tsx`, `job-wizard.tsx`, `sticky-action-bar.tsx` |

Note: `commit` is omitted deliberately — the import resolved a tree hash, not a
commit sha, and recording a guess would break the next diff.
