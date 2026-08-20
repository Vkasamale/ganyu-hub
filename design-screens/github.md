repo: Vkasamale/ganyu-hub
branch: main

## Last sync

date: 2026-08-21T00:52:00Z

### Updated in this project

- Screen 07 rebuilt on the rail → list → detail architecture from the user's messaging blueprint, in Ganyu Hub's own language (white ground, teal, Inter, stamp ring at 3% behind the stream). Twelve unread across six threads; chips filter by money state; escrow events read as their own stamped line.
- Screen 01 hero now carries photography: five drop-in slots crossfading every 6s behind the search and the skill list, scrimmed per the design system's photo rule (ink 90% → 52% on desktop). Mobile carries one slot.
- Mobile messages gained a floating pill dock; the flush five-item bar stays on screens 02 and 04.

## Screen map

| Screen | Built from |
|---|---|
| 01 Signed-out landing | `app/page.tsx`, `components/home-hero.tsx`, `components/home-sections.tsx`, `components/pre-footer.tsx`, `components/footer.tsx`, `components/navbar.tsx`, `lib/task-phrases.ts` |
| 02 Browse (jobs / creatives) | `app/jobs/page.tsx`, `app/browse/page.tsx`, `components/job-card.tsx`, `components/creative-card.tsx`, `components/search-scope.tsx`, `components/filters-bar.tsx`, `components/bottom-tab-bar.tsx` |
| 03 Creative profile | `app/creatives/[id]/page.tsx`, `components/stars.tsx`, `components/verified-badge.tsx`, `components/sticky-action-bar.tsx` |
| 04 Dashboard home (creative) | `components/signed-in-home.tsx`, `components/home-action-cards.tsx` |
| 05 Job detail — in escrow | `components/job-header.tsx`, `components/escrow-panel.tsx`, `components/job-progress-bar.tsx`, `lib/job-stages.ts`, `lib/fees.ts` |
| 06 Job detail — released | same as 05, `escrow_status: payment_released` |
| 07 Messages | `app/messages/page.tsx`, `app/messages/[threadId]/page.tsx`, `components/thread-list.tsx`, `components/message-attachment.tsx` |
| 08 Empty states | `components/empty-state.tsx`, `app/dashboard/saved/page.tsx` |

## Notes

- Shared tokens: `app/globals.css`, `tailwind.config.ts`, `lib/utils.ts` (`formatMwk` = `MWK` + en-GB grouping).
- Icons are Lucide via the design system's `Icon` wrapper. The five money stamps and `nothing-yet` are the supplied PNGs in `assets/stamps/` — placed, never redrawn.
- Desktop frames render 1440 at `zoom: .55`; the job-detail frames scroll so the sticky money card is genuinely sticky.
