import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updatePortfolioItem, deletePortfolioItem } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingForm, SubmitButton } from "@/components/saving-form";

export default async function EditPortfolioItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
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
            <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
          </SavingForm>
        </CardContent>
      </Card>

      {all.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Images ({all.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-ink/55">
              Image add/remove coming soon. Delete this item and re-add if you need to change images.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {all.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt=""
                  className="aspect-square w-full rounded-md border border-ink/10 object-cover"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
