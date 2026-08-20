Ganyu Hub's button — use it for every action; teal fill is reserved for the one primary action on a view.

```jsx
<Button>Post a job</Button>
<Button variant="outline">Save for later</Button>
<Button variant="ghost" size="sm">Cancel</Button>
<Button variant="link">How the money works</Button>
```

Variants: `default` (teal #069494, white text, darkens to #046B6B on hover) · `outline` (white, neutral-300 border) · `ghost` · `link`.
Sizes: `sm` 36px · `default` 40px · `lg` 44px. On mobile use `lg` — 44px is the touch minimum.
Press is `scale(0.97)` over 150ms ease-out; that physical acknowledgement is deliberate and shared with the stamp motif. Never restyle it into a gradient or a pill.
