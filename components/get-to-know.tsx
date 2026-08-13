import { RichText } from "@/components/rich-text";

/**
 * Item 78 (§G8) — "Get to know <name>", at the foot of the profile.
 *
 * §G8's argument: by the time someone has scrolled past the work, the prices
 * and the reviews, the remaining question is not "is this good" — it is "who
 * am I about to hand money to". A person answers that, and everything above
 * this card is output rather than person.
 *
 * Every field is DECLARED by the creative (§K2) and omitted when blank. No
 * invented "typically replies within an hour", no filler about passion: a
 * filled-in row we made up would be us writing someone's personality for them.
 */
export function GetToKnow({
  name,
  bio,
  location,
  languages,
  hoursPerWeek,
  memberSince,
}: {
  name: string;
  bio: string | null;
  location: string | null;
  languages: string[] | null;
  hoursPerWeek: number | null;
  memberSince: string | null;
}) {
  const facts: { label: string; value: string }[] = [];
  if (location) facts.push({ label: "Based in", value: location });
  if (languages?.length) facts.push({ label: "Speaks", value: languages.join(", ") });
  if (hoursPerWeek) facts.push({ label: "Available", value: `About ${hoursPerWeek} hours a week` });
  if (memberSince) {
    facts.push({
      label: "On Ganyu Hub since",
      value: new Date(memberSince).toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
    });
  }

  // Nothing declared and nothing written: a card headed "Get to know someone"
  // with nothing under it is worse than no card (§Q7).
  if (!bio && !facts.length) return null;

  const first = name.split(" ")[0] || name;

  return (
    <section className="card-soft p-6">
      <p className="eyebrow">Get to know {first}</p>

      {bio && <RichText className="mt-3">{bio}</RichText>}

      {facts.length > 0 && (
        <dl className="mt-4 grid gap-x-6 gap-y-2 border-t border-ink/10 pt-4 sm:grid-cols-2">
          {facts.map((f) => (
            <div key={f.label} className="flex items-baseline justify-between gap-3 text-sm">
              <dt className="text-ink/55">{f.label}</dt>
              <dd className="text-right font-medium text-ink/85">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
