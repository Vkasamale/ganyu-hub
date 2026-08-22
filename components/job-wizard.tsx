"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/money-input";
import { TagInput } from "@/components/tag-input";
import { PricingExplainer } from "@/components/pricing-explainer";
import { SubmitButton } from "@/components/saving-form";
import { CATEGORIES } from "@/lib/types";
import { inferCategory } from "@/lib/infer-category";
import { RichText } from "@/components/rich-text";
import { formatMwk } from "@/lib/utils";

/**
 * Posting a job in three steps, ported to the Claude Design screens
 * (`pwa job 3.png`, `PWA job 2.png`, `PWA Job 4.png`).
 *
 *  - **What you need** — title, category, describe the work, skills.
 *  - **Budget & deadline** — budget, deadline, where the work is, and the
 *    money explainer as a collapsed panel.
 *  - **Review** — the job as one card, then the line that answers the only
 *    question that stops people posting: nothing leaves your account yet.
 *
 * The rail of clickable step buttons is gone. The design heads each step with
 * "STEP n OF 3", the step name, and a three-segment bar — the bar is the
 * progress, and Back is the way backwards.
 *
 * `deliverables` stays on step 1 under the description because the server
 * action requires 50+ characters of it. `revisions_included` and `format_spec`
 * are not in the design and are no longer asked for; both columns are
 * nullable and postJob already handles their absence.
 *
 * ponytail: ONE native form, steps hidden with `hidden`. Hidden inputs still
 * submit, so there is no cross-step state to marshal and the server action is
 * untouched. Per-step validation uses the browser's own checkValidity.
 */

const DRAFT_KEY = "gh_job_draft_v1";

const STEPS = ["What you need", "Budget & deadline", "Review"];

export function JobWizard({ defaultCategory }: { defaultCategory?: string }) {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(defaultCategory || "");
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [brief, setBrief] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [restored, setRestored] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const guess = inferCategory(title);
  const effectiveCategory = categoryTouched ? category : category || guess || "";

  // Leaving does not lose the work.
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
    setStep((s) => Math.min(s + 1, 2));
  }

  return (
    <div
      ref={formRef}
      className="space-y-6"
      onSubmitCapture={() => {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {}
      }}
    >
      {/* Step heading and the three-segment bar. */}
      <div className="space-y-3">
        <p className="eyebrow text-ink/55">Step {step + 1} of 3</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">{STEPS[step]}</h2>
        <ol className="flex gap-2" aria-label={`Step ${step + 1} of 3`}>
          {STEPS.map((label, i) => (
            <li
              key={label}
              aria-current={i === step ? "step" : undefined}
              className={"h-[3px] flex-1 rounded-full " + (i <= step ? "bg-stamp" : "bg-ink/12")}
            >
              <span className="sr-only">{label}</span>
            </li>
          ))}
        </ol>
      </div>

      {restored && step === 0 && (
        <p className="rounded-lg border border-brand/30 bg-brand/[0.05] px-4 py-2.5 text-sm text-ink/75">
          We kept what you started earlier. Change anything you like.
        </p>
      )}

      {/* ---------------------------------------------------------- step 1 -- */}
      <div data-step="0" hidden={step !== 0} className="space-y-5">
        <Field label="What do you need done?">
          <Input
            name="title"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Logo and signage for a new bakery"
          />
          <Counter value={title.length} min={8} max={120} unit="characters" />
        </Field>

        {/* The guess is shown, never applied silently. */}
        <Field label="Category">
          <select
            name="category"
            required
            value={effectiveCategory}
            onChange={(e) => {
              setCategory(e.target.value);
              setCategoryTouched(true);
            }}
            className="h-10 w-full rounded-md border border-ink/15 bg-white px-3 text-sm"
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
              that in. Change it if we are wrong.
            </p>
          )}
        </Field>

        <Field
          label="Describe the work"
          help="The more specific you are, the fewer questions you will get back."
        >
          <textarea
            name="brief"
            required
            minLength={200}
            maxLength={4000}
            rows={7}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="We open in Limbe next month and need a logo we can put on the shopfront, plus a simple sign layout the printer can work from. Two colours if possible, the sign painter charges by colour."
            className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm"
          />
          <Counter value={brief.length} min={200} max={4000} unit="characters" />
          {/* The syntax people already use in WhatsApp, said once. No toolbar —
              the review step is the feedback. */}
          <p className="text-xs text-ink/45">
            Start a line with <code className="rounded bg-ink/[0.06] px-1">-</code> for a bullet, or
            wrap words in <code className="rounded bg-ink/[0.06] px-1">**</code> to make them bold.
          </p>
        </Field>

        <Field
          label="What should they hand over?"
          help="The actual files or items you expect at the end. This is what 'finished' means."
        >
          <textarea
            name="deliverables"
            required
            minLength={50}
            maxLength={1500}
            rows={4}
            value={deliverables}
            onChange={(e) => setDeliverables(e.target.value)}
            placeholder={"- The logo as PNG and PDF\n- A version that works on a dark background\n- The original file so we can edit it later"}
            className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm"
          />
          <Counter value={deliverables.length} min={50} max={1500} unit="characters" />
        </Field>

        <Field label="Skills you are looking for" help="Type and press Enter to add each one.">
          <TagInput name="skills" placeholder="e.g. Logo design" />
        </Field>
      </div>

      {/* ---------------------------------------------------------- step 2 -- */}
      <div data-step="1" hidden={step !== 1} className="space-y-5">
        <Field
          label="Your budget"
          help="You can leave this open, but jobs with a budget get about twice as many proposals."
        >
          <MoneyInput name="budget_mwk" placeholder="e.g. 120,000" onValueChange={setBudget} />
        </Field>

        <Field label="Deadline" help="Leave blank if you are flexible.">
          <Input
            name="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </Field>

        <Field label="Where is the work?" help="Optional. Say remote if it does not matter.">
          <Input name="location" maxLength={120} placeholder="e.g. Limbe, Blantyre" />
        </Field>

        <PricingExplainer audience="client" />
      </div>

      {/* ---------------------------------------------------------- step 3 -- */}
      <div data-step="2" hidden={step !== 2} className="space-y-5">
        {/* The job as a creative will actually read it. */}
        <section className="rounded-2xl border border-ink/12 bg-paper p-5 shadow-e1">
          <h3 className="text-xl font-semibold leading-snug text-ink">
            {title || "Your title goes here"}
          </h3>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-wash px-3 py-1.5 text-sm font-medium text-ink/80">
            <span aria-hidden>💸</span>
            Budget: {budget && Number(budget) > 0 ? formatMwk(Number(budget)) : "not given"}
          </p>
          {brief ? (
            <RichText className="mt-4">{brief}</RichText>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-ink/45">
              Your description will appear here.
            </p>
          )}
          {deliverables && (
            <div className="mt-4 border-t border-ink/10 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink/55">
                They will hand over
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink/75">{deliverables}</p>
            </div>
          )}
        </section>

        <p className="flex items-start gap-3 rounded-xl bg-wash px-4 py-3 text-sm leading-relaxed text-ink/75">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-stamp" aria-hidden />
          Posting is free. Nothing leaves your account until you pick someone and fund the job.
        </p>
      </div>

      {/* Nav. */}
      <div className="flex flex-wrap items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex-1 rounded-lg border border-ink/20 px-4 py-3 text-sm font-medium text-ink/75 hover:border-ink/40"
          >
            Back
          </button>
        )}

        {step < 2 ? (
          <button
            type="button"
            onClick={next}
            className="flex-1 rounded-lg bg-stamp px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-stamp-dark"
          >
            Continue
          </button>
        ) : (
          <SubmitButton pendingText="Posting…">Post the job</SubmitButton>
        )}
      </div>

      {step < 2 && (
        <button
          type="button"
          onClick={saveDraft}
          className="text-sm text-ink/60 underline decoration-ink/25 underline-offset-4 hover:text-ink"
        >
          Save and finish later
        </button>
      )}

      <p className="text-xs text-ink/55">
        You can always come back and change your job later, and nobody is paid until you approve the
        work.{" "}
        <a href="/content-policy" className="underline hover:text-ink">
          Content policy
        </a>
        .
      </p>
    </div>
  );
}

/** Heading, one plain line when it earns its place, then the input. */
function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-ink">{label}</p>
      {help && <p className="text-xs leading-relaxed text-ink/60">{help}</p>}
      <div className="space-y-1.5 pt-0.5">{children}</div>
    </div>
  );
}

/**
 * The counter states BOTH ends. While short it says what is still needed;
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
