import { CATEGORIES } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Kind = "creatives" | "jobs";

type Props = {
  kind: Kind;
  action: string;
  q?: string;
  categories?: string[];
  skills?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
};

const SORTS: Record<Kind, { value: string; label: string }[]> = {
  creatives: [
    { value: "newest", label: "Newest" },
    { value: "rate_asc", label: "Lowest rate" },
    { value: "rate_desc", label: "Highest rate" },
  ],
  jobs: [
    { value: "newest", label: "Newest" },
    { value: "budget_desc", label: "Highest budget" },
    { value: "budget_asc", label: "Lowest budget" },
  ],
};

export function FiltersBar({ kind, action, q, categories = [], skills, minPrice, maxPrice, sort }: Props) {
  const priceLabel = kind === "creatives" ? "Hourly rate (MWK)" : "Budget (MWK)";
  const placeholder =
    kind === "creatives"
      ? "Search by name, headline, or bio"
      : "Search jobs by title or brief";
  const sorts = SORTS[kind];

  return (
    <form action={action} method="get" className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="q">Search</Label>
          <Input id="q" name="q" defaultValue={q || ""} placeholder={placeholder} />
        </div>
        <div className="space-y-1.5 md:w-48">
          <Label htmlFor="sort">Sort</Label>
          <select
            id="sort"
            name="sort"
            defaultValue={sort || "newest"}
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <Button type="submit">Apply</Button>
        <a
          href={action}
          className="inline-flex h-10 items-center justify-center rounded-md px-3 text-sm text-neutral-500 hover:text-neutral-900"
        >
          Clear
        </a>
      </div>

      <div className={`mt-4 grid gap-4 ${kind === "creatives" ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        <div className="space-y-1.5">
          <Label>Categories</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const checked = categories.includes(c);
              return (
                <label
                  key={c}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
                    checked ? "border-brand bg-brand/10 text-brand" : "border-neutral-300 text-neutral-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="category"
                    value={c}
                    defaultChecked={checked}
                    className="hidden"
                  />
                  {c}
                </label>
              );
            })}
          </div>
        </div>

        {kind === "creatives" && (
          <div className="space-y-1.5">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input id="skills" name="skills" defaultValue={skills || ""} placeholder="Figma, React, Branding" />
          </div>
        )}

        <div className="space-y-1.5">
          <Label>{priceLabel}</Label>
          <div className="flex gap-2">
            <Input name="min_price" type="number" min={0} defaultValue={minPrice || ""} placeholder="Min" />
            <Input name="max_price" type="number" min={0} defaultValue={maxPrice || ""} placeholder="Max" />
          </div>
        </div>
      </div>
    </form>
  );
}
