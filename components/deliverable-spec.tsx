import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoneyInput } from "@/components/money-input";
import { formatMwk } from "@/lib/utils";
import { specFor, parseAddons } from "@/lib/deliverables";

/**
 * Phase 5 items 37-41 — the deliverables spec, captured where the promise is
 * actually made: on the proposal.
 *
 * This is dispute prevention. Nearly every creative-services dispute is one of
 * three arguments — "I thought the source file was included", "I expected
 * three concepts, not one", "that's a revision, not a fix". Each becomes a
 * lookup once written down at proposal time.
 *
 * The wording adapts to the category (§I4): concepts for design, edited photos
 * for photography, drafts for writing. See lib/deliverables.ts.
 */
export function DeliverableSpecFields({ category }: { category: string | null }) {
  const spec = specFor(category);

  return (
    <fieldset className="space-y-4 rounded-lg border border-ink/10 bg-wash/30 p-4">
      <legend className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink/55">
        What you will deliver
      </legend>
      <p className="text-xs text-ink/55">
        Spelling this out now is what stops an argument later. It is shown on the job if your
        proposal is accepted.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="concepts">{spec.unitLabel}</Label>
          <Input id="concepts" name="concepts" type="number" min={1} max={99} inputMode="numeric" placeholder="e.g. 3" />
          <p className="text-xs text-ink/55">{spec.unitHint}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="delivery_days">Delivery time (days)</Label>
          <Input id="delivery_days" name="delivery_days" type="number" min={1} max={365} inputMode="numeric" placeholder="e.g. 7" />
          <p className="text-xs text-ink/55">Working days from the day escrow is funded.</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>File formats delivered</Label>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {spec.formats.map((f) => (
            <label key={f} className="flex items-center gap-1.5 text-sm text-ink/80">
              <input type="checkbox" name="formats" value={f} className="h-4 w-4 rounded border-ink/30" />
              {f}
            </label>
          ))}
        </div>
      </div>

      {/* Three states, not two: yes, no, and unstated. "Not stated" is the one
          that gets argued about, so the client can see which it is. */}
      <div className="space-y-1.5">
        <Label htmlFor="source_files">{spec.sourceLabel}</Label>
        <select
          id="source_files"
          name="source_files"
          defaultValue=""
          className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm"
        >
          <option value="">Not stated</option>
          <option value="yes">Yes — included</option>
          <option value="no">No — final files only</option>
        </select>
      </div>

      {/* Item 40 — one add-on, priced. More than one wants a repeater and a
          client component; one covers the common case (express delivery) and
          can grow later. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="addon_label">Optional add-on</Label>
          <Input id="addon_label" name="addon_label" maxLength={80} placeholder="Express delivery" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="addon_price">Add-on price (MWK)</Label>
          <MoneyInput id="addon_price" name="addon_price" />
        </div>
      </div>

      {/* Item 41 (§G8) — free text, not a checkbox. "Background removal only"
          and "fully generated" are different answers; a boolean flattens them
          into the same one. */}
      <div className="space-y-1.5">
        <Label htmlFor="ai_disclosure">Any AI used? (optional)</Label>
        <Textarea
          id="ai_disclosure"
          name="ai_disclosure"
          rows={2}
          maxLength={300}
          placeholder="e.g. Upscaling and background removal only — all artwork drawn by hand."
        />
        <p className="text-xs text-ink/55">Clients increasingly ask. Saying so up front reads as confidence.</p>
      </div>
    </fieldset>
  );
}

/**
 * Item 39 — the spec rendered as a table on the job and the proposal. Renders
 * nothing when the creative filled none of it in, rather than a table of
 * dashes (§Q7).
 */
export function SpecTable({
  proposal,
  category,
  className = "",
}: {
  proposal: Record<string, any>;
  category: string | null;
  className?: string;
}) {
  const spec = specFor(category);
  const addons = parseAddons(proposal.addons);

  const rows: { label: string; value: string }[] = [];
  if (proposal.concepts) rows.push({ label: spec.unitLabel, value: String(proposal.concepts) });
  if (proposal.delivery_days) {
    rows.push({
      label: "Delivery",
      value: `${proposal.delivery_days} day${proposal.delivery_days === 1 ? "" : "s"}`,
    });
  }
  if (proposal.revisions_offered != null) {
    rows.push({ label: "Revisions included", value: String(proposal.revisions_offered) });
  }
  if (Array.isArray(proposal.formats) && proposal.formats.length) {
    rows.push({ label: "Formats", value: proposal.formats.join(", ") });
  }
  if (proposal.source_files != null) {
    rows.push({ label: spec.sourceLabel, value: proposal.source_files ? "Yes" : "No" });
  }

  if (!rows.length && !addons.length && !proposal.ai_disclosure) return null;

  return (
    <div className={"rounded-lg border border-ink/10 bg-paper " + className}>
      <p className="border-b border-ink/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/55">
        Agreed deliverables
      </p>
      <dl className="divide-y divide-ink/[0.07]">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-4 px-4 py-2">
            <dt className="text-xs text-ink/60">{r.label}</dt>
            <dd className="text-right text-sm font-medium text-ink">{r.value}</dd>
          </div>
        ))}
        {addons.map((a) => (
          <div key={a.label} className="flex items-baseline justify-between gap-4 px-4 py-2">
            <dt className="text-xs text-ink/60">Add-on · {a.label}</dt>
            <dd className="text-right text-sm font-medium text-ink">+{formatMwk(a.price_mwk)}</dd>
          </div>
        ))}
      </dl>
      {proposal.ai_disclosure && (
        <p className="border-t border-ink/10 px-4 py-2 text-xs text-ink/65">
          <span className="font-medium text-ink/80">AI use: </span>
          {proposal.ai_disclosure}
        </p>
      )}
    </div>
  );
}
