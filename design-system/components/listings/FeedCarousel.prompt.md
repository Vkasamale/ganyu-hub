Every row on the signed-in home is one of these.

```jsx
<FeedCarousel eyebrow="Near you" title="Creatives in Blantyre" seeAllHref="/browse" count={6}>
  <FeedCard><CreativeCard … /></FeedCard>
  <FeedCard><CreativeCard … /></FeedCard>
</FeedCarousel>
```

**The row must peek.** 48px right padding (`--carousel-peek`) keeps the next card half-visible — that is the only affordance telling anyone the row scrolls, and a row ending flush at the viewport edge reads as a static grid nobody swipes.

CSS scroll-snap, no arrows and no library: arrows solve a problem desktop does not have, since the row is already visible there. Slides are a fixed 16rem (18rem from sm) so the peek is predictable. `count={0}` renders nothing at all — an empty rail under a heading is worse than no heading.
