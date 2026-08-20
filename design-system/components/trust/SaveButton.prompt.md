The save control on `CreativeCard` and `JobCard` — 32px circle, absolutely positioned top-right inside the card.

```jsx
<SaveButton saved={false} onToggle={(next) => save(next)} />
```

Saved = teal fill, white ♥. Unsaved = white, neutral-300 border, ♡ in neutral-500. It flips optimistically and pops to `scale(1.3)` over 350ms — the round trip is slow on the connections this runs on, so the UI must answer immediately. `stopPropagation` keeps the tap off the card's own link. The heart glyphs (♥ ♡) are the shipped ones and are the only unicode-as-icon in the product.
