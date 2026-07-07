import { CATEGORIES } from "@/lib/types";

// Constrained category input: a checkbox per canonical category, all sharing
// name="categories". Server reads them with formData.getAll("categories").
// ponytail: native checkboxes, no client JS — replaces the old free-text
// comma-separated <Input> that let "Dev"/"Developers" drift into the DB.
export function CategoryPicker({ selected = [] }: { selected?: string[] }) {
  const set = new Set(selected);
  // Chip styling mirrors the /browse category filters (components/filters-bar.tsx).
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((c) => (
        <label
          key={c}
          className="relative cursor-pointer rounded-full border border-ink/25 bg-paper px-3.5 py-1.5 text-xs font-medium text-ink/80 transition-colors hover:border-ink/50 hover:bg-wash/40 has-[:checked]:border-stamp has-[:checked]:bg-stamp has-[:checked]:text-paper has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-stamp"
        >
          <input type="checkbox" name="categories" value={c} defaultChecked={set.has(c)} className="sr-only" />
          {c}
        </label>
      ))}
    </div>
  );
}
