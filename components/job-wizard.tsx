"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/money-input";
import { SubmitButton } from "@/components/saving-form";
import { CATEGORIES } from "@/lib/types";
import { inferCategory } from "@/lib/infer-category";
import { RichText } from "@/components/rich-text";
import { formatMwk } from "@/lib/utils";

/**
 * Phase 8 items 64-68 (§I1-§I6) — posting a job in three steps.
 *
 * It was one page of eight fields, two of which silently demanded 200 and 50
 * characters before they would submit. §I1's complaint is that a wall of
 * inputs reads as an exam, and the people we most need to post — a shop owner
 * who has never commissioned design — are exactly the ones who abandon it.
 *
 *  - **Three steps, not six (§I1).** Need → Deliver → Budget.
 *  - **A pencil on completed steps, never a lock (§I6).** Any finished step is
 *    clickable. Locking someone out of step 1 because they reached step 3
 *    treats a form like a queue at a bank.
 *  - **Field pattern (§I2):** heading, one plain line under it, the input,
 *    then a counter stating BOTH ends — "40 more characters needed" while
 *    short, "220 / 2000" once satisfied. The old form had a minimum you could
 *    only discover by failing.
 *  - **Reassurance (§I5)** kept permanently in view, because "is this final?"
 *    is the unasked question that stops people typing.
 *  - **Preview (§I1)** before posting: the job as a creative will read it.
 *
 * ponytail: ONE native form, steps hidden with `hidden`. Hidden inputs still
 * submit, so there is no cross-step state to marshal and the server action is
 * untouched. Per-step validation uses the browser's own checkValidity.
 */

const DRAFT_KEY = "gh_job_draft_v1";

export function JobWizard({ defaultCategory }: { defaultCategory?: string }) {
  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(defaultCategory || "");
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [brief, setBrief] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [restored, setRestored] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const guess = inferCategory(title);
  const effectiveCategory = categoryTouched ? category : category || guess || "";

  // §I5 as mechanism rather than copy: leaving does not lose the work.
  // ponytail: localStorage, not a drafts table. `job_status` is a Postgres
  // enum with no 'draft' value, so persisting server-side means a migration
  // plus a lifecycle (who deletes drafts? do they expire?) for something that
  // only has to survive a closed tab. Ceiling: one device, cleared on submit.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.title) setTitle(d.title);
      if (d.category) {
        setCategory(d.category);
        setCategoryTouched(true);
      }
      if (d.brief) setBrief(d.brief);
      if (d.deliverables) setDeliverables(d.deliverables);
      if (d.budget) setBudget(d.budget);
      if (d.deadline) setDeadline(d.deadline);
      if (d.title || d.brief) setRestored(true);
    } catch {
      // A corrupt draft must never block posting a job.
    }
  }, []);

  function saveDraft() {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ title, category: effectiveCategory, brief, deliverables, budget, deadline }),
      );
    } catch {
      // Private mode or full quota — nothing to do but carry on.
    }
  }

  /** Validate only what is on screen; hidden steps are not their problem yet. */
  function stepIsValid(): boolean {
    const pane = formRef.current?.querySelector(`[data-step="${step}"]`);
    if (!pane) return true;
    const fields = Array.from(
      pane.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        "input, textarea, select",
      ),
    );
    for (const f of fields) {
      if (!f.checkValidity()) {
        f.reportValidity();
        return false;
      }
    }
    return true;
  }

  function next() {
    if (!stepIsValid()) return;
    saveDraft();
    const n = Math.min(step + 1, 2);
    setStep(n);
    setFurthest((f) => Math.max(f, n));
  }

  const STEPS = ["What you need", "What you'll get", "Budget"];

  return (
    <div
      ref={formRef as unknown as React.RefObject<HTMLDivElement>}
      className="space-y-6"
      onSubmitCapture={() => {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {}
      }}
    >
      {/* Step rail. Completed steps carry a pencil and stay clickable (§I6). */}
      <ol className="flex items-center gap-2">
        {STEPS.map((label, i) => {
          const done = i < furthest || i < step;
          const current = i === step;
          const reachable = i <= furthest;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => reachable && setStep(i)}
                className={
                  "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors " +
                  (current
                    ? "border-brand bg-brand/[0.06] font-medium text-ink"
                    : reachable
                      ? "border-ink/15 text-ink/70 hover:border-ink/30"
                      : "border-ink/10 text-ink/35")
                }
              >
                <span
                  className={
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold " +
                    (done ? "bg-brand text-paper" : current ? "bg-ink text-paper" : "bg-ink/10 text-ink/50")
                  }
                >
                  {done ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className="truncate">{label}</span>
                {done && !current && <Pencil className="ml-auto h-3.5 w-3.5 shrink-0 text-ink/35" />}
              </button>
            </li>
          );
        })}
      </ol>

      {restored && step === 0 && (
        <p className="rounded-lg border border-brand/30 bg-brand/[0.05] px-4 py-2.5 text-sm text-ink/75">
          We kept what you started earlier. Change anything you like.
        </p>
      )}

      {/* ---------------------------------------------------------- step 1 -- */}
      <div data-step="0" hidden={step !== 0} className="space-y-5">
        <Field
          label="What do you need done?"
          help="Say it the way you would say it to a friend. No need for technical words."
        >
          <Input
            name="title"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Logo for my bakery"
          />
          <Counter value={title.length} min={8} max={120} unit="characters" />
        </Field>

        {/* Item 67: the guess is shown, never applied silently. */}
        <Field
          label="What kind of work is this?"
          help={
            guess && !categoryTouched
              ? "We had a guess from your title. Change it if we are wrong."
              : "Pick the closest one. It only decides who sees your job."
          }
        >
          <select
            name="category"
            required
            value={effectiveCategory}
            onChange={(e) => {
              setCategory(e.target.value);
              setCategoryTouched(true);
            }}
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
          >
            <option value="" disabled>
              Choose a category
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {guess && !categoryTouched && (
            <p className="text-xs text-ink/60">
              Sounds like <strong className="font-medium text-ink">{guess}</strong> — we have filled
              that in.
            </p>
          )}
        </Field>

        <Field
          label="Tell them more about it"
          help="What it is for, who will see it, and anything they need to know before starting. The more you say now, the fewer surprises later."
        >
          <textarea
            name="brief"
            required
            minLength={200}
            maxLength={4000}
            rows={7}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="We are opening a bakery in Zomba. We need a logo for the shopfront, our boxes and Facebook. Warm and homely rather than modern — our customers are families."
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
          />
          <Counter value={brief.length} min={200} max={4000} unit="characters" />
          {/* Item 69: the syntax people already use in WhatsApp, said once.
              No toolbar — the preview on the last step is the feedback. */}
          <p className="text-xs text-ink/45">
            Start a line with <code className="rounded bg-ink/[0.06] px-1">-</code> for a bullet, or
            wrap words in <code className="rounded bg-ink/[0.06] px-1">**</code> to make them bold.
          </p>
        </Field>
      </div>

      {/* ---------------------------------------------------------- step 2 -- */}
      <div data-step="1" hidden={step !== 1} className="space-y-5">
        <Field
          label="What should they hand over?"
          help="The actual files or items you expect at the end. This is what 'finished' means, so be specific."
        >
          <textarea
            name="deliverables"
            required
            minLength={50}
            maxLength={1500}
            rows={5}
            value={deliverables}
            onChange={(e) => setDeliverables(e.target.value)}
            placeholder={"- The logo as PNG and PDF\n- A version that works on a dark background\n- The original file so we can edit it later"}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
          />
          <Counter value={deliverables.length} min={50} max={1500} unit="characters" />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="When do you need it?" help="Leave blank if you are flexible.">
            <Input
              name="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </Field>
          <Field
            label="How many rounds of changes?"
            help="How many times they will adjust it before extra changes cost more."
          >
            <Input name="revisions_included" type="number" min={0} max={10} defaultValue={2} />
          </Field>
        </div>

        <Field
          label="Any size or format requirements?"
          help="Optional. Only if you already know — otherwise leave it and agree later."
        >
          <Input name="format_spec" placeholder="e.g. 1080×1920 video, under 60 seconds" />
        </Field>
      </div>

      {/* ---------------------------------------------------------- step 3 -- */}
      <div data-step="2" hidden={step !== 2} className="space-y-5">
        <Field
          label="What is your budget?"
          help="A number gets far more replies than leaving it open — creatives skip jobs they cannot price. You can still negotiate."
        >
          <MoneyInput name="budget_mwk" placeholder="e.g. 150,000" onValueChange={setBudget} />
        </Field>

        {/* Item 65: the job as a creative will actually read it. */}
        <section className="rounded-xl border border-ink/12 bg-wash/40 p-5">
          <p className="eyebrow text-ink/55">How creatives will see it</p>
          <h3 className="mt-2 text-lg font-semibold text-ink">{title || "Your title goes here"}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink/60">
            <span className="rounded-full bg-paper px-2.5 py-0.5 font-medium text-ink/75">
              {effectiveCategory || "No category yet"}
            </span>
            <span aria-hidden>·</span>
            <span>Budget: {budget && Number(budget) > 0 ? formatMwk(Number(budget)) : "not given"}</span>
            {deadline && (
              <>
                <span aria-hidden>·</span>
                <span>by {deadline}</span>
              </>
            )}
          </div>
          {brief ? (
            <RichText className="mt-3">{brief}</RichText>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-ink/45">
              Your description will appear here.
            </p>
          )}
          {deliverables && (
            <div className="mt-3 border-t border-ink/10 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink/55">
                They will hand over
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink/75">{deliverables}</p>
            </div>
          )}
        </section>
      </div>

      {/* Nav. §I5: the reassurance is permanent, not one line on step 1. */}
      <div className="flex flex-wrap items-center gap-3 border-t border-ink/10 pt-5">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="rounded-lg border border-ink/20 px-4 py-2 text-sm font-medium text-ink/75 hover:border-ink/40"
          >
            Back
          </button>
        )}

        {step < 2 ? (
          <button
            type="button"
            onClick={next}
            className="rounded-lg bg-stamp px-5 py-2 text-sm font-medium text-paper transition-colors hover:bg-stamp-dark"
          >
            Continue
          </button>
        ) : (
          <SubmitButton pendingText="Posting…">Post this job</SubmitButton>
        )}

        <button
          type="button"
          onClick={saveDraft}
          className="text-sm text-ink/60 underline decoration-ink/25 underline-offset-4 hover:text-ink"
        >
          Save and finish later
        </button>
      </div>

      <p className="text-xs text-ink/55">
        You can always come back and change your job later — posting it does not commit you to
        anything, and nobody is paid until you approve the work.{" "}
        <a href="/content-policy" className="underline hover:text-ink">
          Content policy
        </a>
        .
      </p>
    </div>
  );
}

/** §I2's field pattern: heading, one plain line, the input. */
function Field({ label, help, children }: { label: string; help: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-ink">{label}</p>
      <p className="text-xs leading-relaxed text-ink/60">{help}</p>
      <div className="space-y-1.5 pt-0.5">{children}</div>
    </div>
  );
}

/**
 * §I2's counter, stating BOTH ends. While short it says what is still needed;
 * once satisfied it switches to a ceiling. A bare "12/200" reads as failure.
 */
function Counter({ value, min, max, unit }: { value: number; min: number; max: number; unit: string }) {
  const short = value < min;
  return (
    <p className={"text-xs " + (short ? "text-ink/55" : "text-ink/40")}>
      {short
        ? value === 0
          ? `At least ${min} ${unit}.`
          : `${min - value} more ${unit} needed.`
        : `${value} / ${max} ${unit}.`}
    </p>
  );
}
