Renders a Lucide icon. Lucide **is** the product's icon set — never mix in another family, an emoji, or a unicode glyph.

```html
<script src="https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js"></script>
```
```jsx
<Icon name="Wallet" size={20} />
<Icon name="BadgeCheck" size={14} strokeWidth={2} color="var(--gh-mark)" />
```

Sizes in use: 14px inline with 11–12px text · 18px drawer rows · 20px tab bar · 24px feature rows. Stroke 2 for UI, 1.5 for large decorative. Icons take `currentColor` and inherit the row's ink opacity — an icon is never a second colour next to its label.

The nav mapping the product ships (`lib/nav.ts` keys → Lucide): home→Home, search→Search, message→MessageSquare, briefcase→Briefcase, inbox→Inbox, bookmark→Bookmark, chart→ChartNoAxesColumn, folder→FolderOpen, list→List, user→User, shield→Shield, wallet→Wallet, external→ExternalLink, help→CircleHelp, flag→Flag, sparkle→Sparkles, settings→Settings, menu→Menu.
