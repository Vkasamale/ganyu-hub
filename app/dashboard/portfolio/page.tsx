import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addPortfolioItem } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { MultiImagePicker } from "@/components/multi-image-picker";
import { EmptyState } from "@/components/empty-state";
import { CaseStudyFields } from "@/components/case-study-fields";
import { CATEGORIES } from "@/lib/types";

export default async function PortfolioPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: items } = await supabase.from("portfolio_items").select("*").eq("profile_id", user.id).order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <Card>
        <CardHeader><CardTitle>Add portfolio item</CardTitle></CardHeader>
        <CardContent>
          <SavingForm action={addPortfolioItem} successText="Portfolio item added." resetOnSuccess className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Images</Label>
              <MultiImagePicker name="cover_files" max={10} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project_url">Project URL</Label>
              <Input id="project_url" name="project_url" type="url" placeholder="https://..." />
            </div>

            {/* §M10: cost and duration are the two questions every client asks
                before they message. Answering them here saves both sides a
                round trip. All optional — a blank field shows nothing rather
                than a zero. */}
            <CaseStudyFields categories={CATEGORIES} />

            <SubmitButton pendingText="Adding…">Add</SubmitButton>
            <p className="text-xs text-ink/55">
              By posting, you agree to our <a href="/content-policy" className="underline hover:text-ink">content policy</a>.
            </p>
          </SavingForm>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-xl font-semibold">Your items ({items?.length || 0})</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(items || []).map((it: any) => {
            const extra = Array.isArray(it.images) ? it.images.length : 0;
            return (
              <Link key={it.id} href={`/dashboard/portfolio/${it.id}`} className="block transition-transform hover:-translate-y-0.5">
                <Card>
                  {it.cover_url && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                      <Image src={it.cover_url} alt={it.title} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
                      {extra > 0 && (
                        <span className="absolute right-2 top-2 rounded-full bg-ink/85 px-2 py-0.5 text-[10px] font-medium text-paper">
                          +{extra} more
                        </span>
                      )}
                    </div>
                  )}
                  <CardContent className="p-4">
                    <p className="font-semibold">{it.title}</p>
                    {it.description && <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{it.description}</p>}
                    <p className="mt-2 text-xs text-ink/50">Click to edit</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
          {/* Quiet weight (§H2): the add form is directly above, so this only
              has to explain why it matters. */}
          {(!items || items.length === 0) && (
            <EmptyState
              tone="quiet"
              title="No portfolio items yet"
              body="Creatives without a single piece of work are hidden from Browse — this is the one that gets you listed."
            />
          )}
        </div>
      </section>
    </div>
  );
}
