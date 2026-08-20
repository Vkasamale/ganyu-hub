Fills a surface that has nothing in it — and tells the reader the way out.

```jsx
<EmptyState
  title="No proposals yet"
  body="Creatives usually reply within a day. You can also invite someone directly."
  actionLabel="Browse creatives"
  actionHref="/browse"
/>
<EmptyState tone="quiet" title="No messages in this thread yet." />
```

Pick the weight honestly: `prompt` (dashed ink-20 border on paper, 64px vertical padding, outline button) for a whole empty page; `quiet` for one empty region on a page that is otherwise full. Using the loud one everywhere is its own kind of noise. An empty message thread needs no call to action — the reply box is right there.
