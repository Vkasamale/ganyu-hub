A native `<select>` restyled to match `Input`. Native on purpose — it works before hydration and gets the OS picker on Android for free, which matters on the phones this product runs on.

```jsx
<Select defaultValue="Design">
  <option>Design</option>
  <option>Photography</option>
</Select>
```

The chevron is a background SVG (ink at 45%); `appearance: none` removes the OS arrow. Do not replace this with a JS combobox.
