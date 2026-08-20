A line on a creative's rate card. Paper, 8px radius, an ink-10 hairline — it sits *inside* a white card, so it recesses rather than stacking another white surface.

```jsx
<ServiceCard title="Logo and brand basics" description="Wordmark, one icon, colour and type in a two-page guide."
  priceMwk={45000} priceMaxMwk={90000} deliveryDays={7} rating={{avg:4.8,count:12}} />
```

Two rules, both from "never a fabricated number":

- **"From" leads** because `price_mwk` is the low end of a span, not the price.
- **The rating is the creative's**, spelled out as "across 12 reviews of this creative". There is no per-service rating and inventing one would be a lie about what was measured.

No save heart here — this card already lives on the creative's page where the real ♡ is, and a second heart that silently saves something else misrepresents the click.
