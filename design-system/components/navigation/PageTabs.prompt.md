Sections within one page — Saved (creatives/jobs), My jobs (open/in progress/done), Proposals (sent/received).

```jsx
<PageTabs active="open" onSelect={setTab} tabs={[
  { key: "open", label: "Open", count: 3 },
  { key: "progress", label: "In progress", count: 1 },
  { key: "done", label: "Done" },
]} />
```

**Underline, not filled pills.** A filled dark pill reads as a button — something that *acts* — where a tab only changes what you are looking at. Active is a 2px teal bottom border with ink text; hover raises an ink-20 border.

Counts are omitted at zero, not shown as "0": a tab reading 0 is a tab you have already been told not to press. This is the one tab treatment in the product; four pages once had four, which taught nobody what a tab looks like.
