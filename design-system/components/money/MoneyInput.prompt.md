Every field where someone types an amount. Shows `120,000` while they type, submits `120000`.

```jsx
<Label htmlFor="budget">Your budget</Label>
<MoneyInput id="budget" name="budget_mwk" placeholder="50,000" />
```

Plex Mono, tabular, with the teal `k` marker inside the field — the same marker `.gh-price` puts in front of every displayed MWK figure. Never use a bare `Input type="number"` for money: the spinner is unusable on a phone and unseparated digits are how people add a zero.
