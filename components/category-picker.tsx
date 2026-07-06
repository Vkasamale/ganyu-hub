import { CATEGORIES } from "@/lib/types";

// Constrained category input: a checkbox per canonical category, all sharing
// name="categories". Server reads them with formData.getAll("categories").
// ponytail: native checkboxes, no client JS — replaces the old free-text
// comma-separated <Input> that let "Dev"/"Developers" drift into the DB.
export function CategoryPicker({ selected = [] }: { selected?: string[] }) {
  const set = new Set(selected);
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {CATEGORIES.map((c) => (
        <label key={c} className="flex items-center gap-2 rounded-lg border border-ink/15 px-3 py-2 text-sm">
          <input type="checkbox" name="categories" value={c} defaultChecked={set.has(c)} />
          <span>{c}</span>
        </label>
      ))}
    </div>
  );
}
