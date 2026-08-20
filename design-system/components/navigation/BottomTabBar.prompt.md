The mobile shell. Use it on every signed-in mobile screen; never together with `PrimaryNav` at the same breakpoint.

```jsx
<BottomTabBar tabs={CREATIVE_TABS} active="/jobs" unreadCount={3} onMenu={() => setDrawer(true)} />
{drawer && <NavDrawer groups={groups} version="1.4.0" onClose={() => setDrawer(false)} />}
```

**Four tabs plus Menu, and no create action among them.** A "+" in a tab bar competes with the tab beside it and is the thing people hit by accident; posting a job stays a deliberate button on the page.

**Labels are verbs, not nouns.** "Find work" / "Find someone" tells you what you get; "Dashboard" is a word for the team, not for a tailor in Blantyre. Role changes the wording of the second slot only — never what someone can do.

Active is `--gh-teal-dark`, inactive ink-55, both with a 20px Lucide icon over a 10px label. The bar is paper at 95% with a backdrop blur and `env(safe-area-inset-bottom)` padding; the page needs `--tabbar-clearance` of bottom padding so the last element is not covered. The drawer is grouped Your work / Settings / Help, log out in red-600, version at the foot.
