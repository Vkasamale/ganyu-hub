Pins the primary action on long mobile pages — job detail, creative profile.

```jsx
<StickyActionBar hint="MWK 120,000 held in escrow" label="Release payment" href="#release" />
```

**It is a link, never a second submit button.** The real action already exists exactly once further up the page; this carries the label and the amount and takes you there. Two live submit buttons for one payment is how double-charges happen.

Mobile only — a pinned bar on desktop covers content for no reason. Add a 80px spacer sibling so it does not cover the last element. `env(safe-area-inset-bottom)` keeps it clear of the iPhone home indicator. When both this and `BottomTabBar` would show, this one wins on a detail page.
