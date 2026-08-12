import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { updatePortfolioItem, deletePortfolioItem, addPortfolioImages, removePortfolioImage } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { MultiImagePicker } from "@/components/multi-image-picker";
import { CaseStudyFields } from "@/components/case-study-fields";
import { CATEGORIES } from "@/lib/types";

export default async function EditPortfolioItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { data: item } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("id", id)
    .eq("profile_id", user.id)
    .single();
  if (!item) notFound();

  const all: string[] = [
    ...(item.cover_url ? [item.cover_url] : []),
    ...(Array.isArray(item.images) ? item.images : []),
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <Link
        href="/dashboard/portfolio"
        className="inline-flex items-center gap-1 text-sm text-ink/60 hover:text-ink"
      >
        ← Back to portfolio
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit item</CardTitle>
        </CardHeader>
        <CardContent>
          <SavingForm
            action={updatePortfolioItem}
            successText="Saved."
            className="space-y-4"
          >
            <input type="hidden" name="id" value={item.id} />
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required defaultValue={item.title} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={item.description || ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project_url">Project URL</Label>
              <Input
                id="project_url"
                name="project_url"
                type="url"
                placeholder="https://..."
                defaultValue={item.project_url || ""}
              />
            </div>
            <CaseStudyFields categories={CATEGORIES} item={item} />
            <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
          </SavingForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images ({all.length}/10)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {all.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {all.map((url, i) => (
                <div key={url} className="relative">
                  <img
                    src={url}
                    alt=""
                    className="aspect-square w-full rounded-md border border-ink/10 object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/85 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-paper">
                      cover
                    </span>
                  )}
                  <SavingForm action={removePortfolioImage} silent className="absolute right-1.5 top-1.5">
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="url" value={url} />
                    <button
                      type="submit"
                      aria-label="Remove image"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink/85 text-paper transition-colors hover:bg-ink"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </SavingForm>
                </div>
              ))}
            </div>
          )}

          {all.length < 10 && (
            <SavingForm action={addPortfolioImages} successText="Added." className="space-y-3 border-t border-ink/10 pt-4">
              <input type="hidden" name="id" value={item.id} />
              <p className="text-xs text-ink/55">
                Add more images (up to {10 - all.length} more). First image becomes the cover if there isn't one yet.
              </p>
              <MultiImagePicker name="cover_files" max={10 - all.length} />
              <SubmitButton pendingText="Uploading…">Add images</SubmitButton>
            </SavingForm>
          )}
          {all.length === 10 && (
            <p className="border-t border-ink/10 pt-4 text-xs text-ink/55">
              Item is at the 10-image limit. Remove one to add another.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <form action={deletePortfolioItem}>
            <input type="hidden" name="id" value={item.id} />
            <Button type="submit" variant="outline">
              Delete item
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
