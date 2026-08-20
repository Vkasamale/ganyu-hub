The desktop header nav — three items, phrased as verbs.

```jsx
<PrimaryNav items={CREATIVE_NAV} active="/jobs" />
```

Creative: **Find work · Deliver work · Get paid.** Client: **Find someone · Manage work · Finances.** That is the whole relationship with the product, in order, and the wording is the design — do not swap it back to "Browse / Dashboard / Payments".

Three and no more: a header that lists everything is a dropdown with extra steps. Active gets an ink-6% tinted rounded rectangle, never an underline (that treatment belongs to `PageTabs`). Hide it below 768px; the bottom tab bar owns mobile.
