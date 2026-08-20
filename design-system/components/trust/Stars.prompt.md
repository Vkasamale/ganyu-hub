Read-only rating display. Amber-400 (`--status-star`) filled, ink-25 outline for the rest.

```jsx
<Stars value={4.6} size={14} />
<span style={{fontSize:"var(--text-xs)",color:"var(--gh-ink-60)"}}>4.6 · 12 reviews</span>
```

Below the first review show "New · no reviews yet", never `0.0` and never zero stars — a fabricated number is worse than no number (§Q7). For collecting a rating use `StarRatingInput`.
