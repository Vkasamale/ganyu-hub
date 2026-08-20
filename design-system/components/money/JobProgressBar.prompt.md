The escrow lifecycle, always shown in full so a client can see what has not happened yet.

```jsx
<JobProgressBar currentIdx={2} />
<JobProgressBar currentIdx={3} overlay={{ stageIdx: 3, kind: "disputed" }} />
```

Stage labels name the money, not the workflow — "Money in escrow", not "Funded". Five stages get five colours (sky → indigo → violet → amber → emerald); completed connectors take the colour of the stage they lead into and fill over 700ms with a 180ms-per-stage stagger. A cancelled overlay greys the whole run.
