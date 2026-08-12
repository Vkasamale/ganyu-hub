import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { MoneyInput } from "@/components/money-input";
import { formatMwk } from "@/lib/utils";

/**
 * Phase 1 item 9 (§M10) — the case-study half of a portfolio item, shared by
 * the add form and the edit page so the two can never drift apart.
 *
 * Everything here is optional. The plan calls this the highest-value item in
 * the phase because cost and duration answer what a client would otherwise
 * have to message to find out, and a creative can fill it in today from work
 * they did last year — no reviews, no ratings, no volume required.
 *
 * ponytail: a plain fieldset of native inputs. `type="date"` gives a real
 * picker on phone and desktop with no library and no client component; the
 * server action parses and nulls out anything blank.
 */
/**
 * The read side: the same facts as chips on a portfolio card. Renders nothing
 * when the creative stated nothing — §Q7 again, one card at a time. A
 * half-filled case study shows only the halves that exist rather than
 * "MWK — · — days".
 */
export function CaseStudyFacts({
  item,
}: {
  item: {
    cost_min_mwk?: number | null;
    cost_max_mwk?: number | null;
    duration_days?: number | null;
    completed_on?: string | null;
    category?: string | null;
  };
}) {
  const facts: string[] = [];

  const { cost_min_mwk: min, cost_max_mwk: max } = item;
  if (min != null && max != null && max !== min) facts.push(`${formatMwk(min)}–${formatMwk(max)}`);
  else if (min != null) facts.push(max == null ? `From ${formatMwk(min)}` : formatMwk(min));
  else if (max != null) facts.push(`Up to ${formatMwk(max)}`);

  if (item.duration_days != null) {
    facts.push(`${item.duration_days} day${item.duration_days === 1 ? "" : "s"}`);
  }
  if (item.completed_on) {
    // Month and year only: the exact day of a past project is noise, and it
    // reads as staler than it is.
    facts.push(
      new Date(item.completed_on).toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
    );
  }
  if (item.category) facts.push(item.category);

  if (!facts.length) return null;

  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      {facts.map((f) => (
        <span key={f} className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-medium text-ink/70">
          {f}
        </span>
      ))}
    </div>
  );
}

export function CaseStudyFields({
  categories,
  item,
}: {
  categories: readonly string[];
  item?: {
    cost_min_mwk?: number | null;
    cost_max_mwk?: number | null;
    duration_days?: number | null;
    completed_on?: string | null;
    category?: string | null;
  };
}) {
  return (
    <fieldset className="space-y-4 rounded-lg border border-ink/10 bg-wash/30 p-4">
      <legend className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink/55">
        Project details — optional
      </legend>
      <p className="text-xs text-ink/55">
        Clients compare on these. Anything you leave blank is simply not shown.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cost_min_mwk">Budget from (MWK)</Label>
          <MoneyInput id="cost_min_mwk" name="cost_min_mwk" defaultValue={item?.cost_min_mwk ?? undefined} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cost_max_mwk">Budget to (MWK)</Label>
          <MoneyInput id="cost_max_mwk" name="cost_max_mwk" defaultValue={item?.cost_max_mwk ?? undefined} />
        </div>
      </div>
      <p className="text-xs text-ink/45">
        A range, not a quote. Fill in only the first box for &ldquo;from MWK 50,000&rdquo;.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="duration_days">Turnaround (days)</Label>
          <Input
            id="duration_days"
            name="duration_days"
            type="number"
            min={1}
            inputMode="numeric"
            placeholder="e.g. 14"
            defaultValue={item?.duration_days ?? undefined}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="completed_on">Completed</Label>
          <Input
            id="completed_on"
            name="completed_on"
            type="date"
            defaultValue={item?.completed_on ?? undefined}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <Select id="category" name="category" defaultValue={item?.category ?? ""}>
          <option value="">Not stated</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>
    </fieldset>
  );
}
