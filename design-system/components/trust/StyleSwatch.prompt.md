Six drawn swatches standing in for six visual styles: Flat & simple · 3D & shiny · Hand-drawn · Vintage · Photographic · Big bold type.

```jsx
<StyleChoices name="styles" selected={["flat"]} />
<span style={{display:"block",width:64,height:64}}><StyleSwatch slug="vintage" /></span>
```

Why they exist: many clients on this platform have never commissioned design work and do not have the vocabulary. Letting someone point is the difference between briefing you and giving up.

They are inline SVG rather than photographs for two reasons — a swatch can never be a photo of work nobody on the platform made, and six images at the top of a filter panel would be the slowest thing on the page. **These drawings ship in the product; copy them, never redraw them.** Selected = 2px teal border plus a semibold label. Only offer them for visual categories (Design, Animation & Motion, Video & Photography, Crafts & Handmade) — asking a tax accountant whether their work is "vintage" teaches people to ignore the filter bar.
