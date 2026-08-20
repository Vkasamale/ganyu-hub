The card that represents work to be done.

```jsx
<JobCard
  title="Logo and signage for a new bakery" category="Design" postedAgo="2 days ago"
  clientName="Grace Phiri" budgetMwk={120000} proposalsCount={4}
  trustBits={["Has paid into escrow","Hires 80% of the time","3 jobs posted"]}
  brief="We open in Limbe next month and need a logo we can put on the shopfront…"
  showSave
/>
```

Order is the argument: title, when and what, who posted it, **whether they have ever actually paid into escrow**, then the budget. That trust line leads because it is the most useful thing a creative can know before spending an evening writing a proposal.

- **Omit a trust signal rather than showing a zero or an "unknown"** (§Q7), and never say "verified" — the platform verifies nothing about clients.
- Budget sits in the reserved green (`--gh-mark` on 10%) with a `HandCoins` icon. Null budget reads "Open".
- Hover wipes a 4px teal edge in from the left over 200ms — the card's only decoration.
