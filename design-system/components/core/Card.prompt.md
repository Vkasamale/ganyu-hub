The white surface. Paper is the page; white is what lifts off it. 16px radius, a warm three-layer ink shadow, a 6% hairline border.

```jsx
<Card>
  <CardHeader>
    <CardTitle>Payout method</CardTitle>
    <CardDescription>Where released escrow is sent.</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
</Card>
```

24px padding throughout. `CardContent` sets `min-width: 0` and `break-words` so long unbroken strings (URLs, emails) wrap inside instead of overflowing. Recessed panels *inside* a card use `--surface-inset` (wash at 25%), not another white card.
