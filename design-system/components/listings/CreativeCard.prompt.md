The card that represents a person. Cover, identity row, one line of headline, up to three skill chips, then rating and price above a hairline.

```jsx
<CreativeCard
  name="Thandiwe Banda" location="Blantyre" category="Design"
  headline="Brand identity and packaging for Malawian food businesses."
  skills={["Logo design","Packaging","Illustration","Brand guides"]}
  rating={4.8} reviewCount={12} fromPriceMwk={45000} showSave
/>
```

- **No avatar means a teal radial gradient with initials in Inter at 600** — never a grey silhouette. A missing photo should not look like a missing person.
- **Say how many skills were cut.** Three chips plus `+4`; truncating silently makes a ten-skill creative look like a three-skill one.
- **Below the first review it reads "New · no reviews yet"**, never `0.0`.
- Hover: 2px lift, shadow deepens, cover scales to 1.03 over 300ms. 100ms on the card itself.
