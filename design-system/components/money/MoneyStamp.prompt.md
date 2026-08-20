The money-state stamp — the five stages a job's money passes through, and the one element in the product meant to be memorable.

```jsx
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
  <span className="gh-price" style={{fontSize:"var(--text-4xl)",fontVariantNumeric:"tabular-nums"}}>120,000</span>
  <MoneyStamp state="payment_held" size="lg" />
</div>
```

`state` is one of `none` · `payment_pending` · `payment_held` · `payment_released` · `payment_disputed`, and the five inks are grey · orange · blue · green · red. Never collapse them to one colour, and never render four of five — a money state the user cannot see is the thing they came to check.

`size` is `sm` (80px, dense rows), `md` (104px, mobile), `lg` (148px, md and up).

**It is supplied artwork**, one PNG per state in `assets/stamps/`, keyed to transparent so it sits on any ground. Each stamp carries "Ganyu Hub" arced around a double ring with the state on an angled label band, worn and unevenly inked. Do not rebuild it as a chip, a badge, a dashed border, or a coded imitation — the wear is the whole point and it does not survive being approximated.

The wording is part of the image, so `label` only retitles it for screen readers; it cannot change what the stamp reads. There is no stamp for "empty" or "nothing yet": the stamps mark stages of money, so they do not belong on a surface where nothing has happened.
