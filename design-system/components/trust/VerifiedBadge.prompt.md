The verification mark on a creative's name.

```jsx
<VerifiedBadge verifiedAt={profile.verified_at} size="lg" />
```

Two rules carry the whole design:

1. **The wording is "Checked by Ganyu Hub"** — not "Verified professional", not "Trusted". We have checked an identity and a body of work; that is a claim about our process. Promising more is how a trust badge becomes a liability the first time a vetted creative disappears with a deposit.
2. **There is no unverified state.** Pass a null date and it renders nothing. Everyone starts unverified, and a grey "not verified" badge on every new creative reads as an accusation.

Reserved green (`--gh-mark` on `--gh-mark-10`), which it shares with budget pills and nothing else.
