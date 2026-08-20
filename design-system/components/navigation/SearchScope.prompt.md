Sits above the results on /browse and /jobs and says which of the two things you are searching.

```jsx
<SearchScope current="jobs" onSelect={setScope} />
```

**Keep the sentences.** "Search people — their work, prices and reviews." / "Search jobs clients have posted, with budgets." They are the whole point: someone typing "logo" on the wrong surface gets zero results, which reads as "this platform has nothing" rather than "you are on the wrong page".

Selected = teal border on teal-6%; unselected = paper with an ink-15 border. Carry the query across when switching so nobody retypes it.
