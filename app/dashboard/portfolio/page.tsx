import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addPortfolioItem } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
          <form action={addPortfolioItem} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cover_url">Cover image URL</Label>
              <Input id="cover_url" name="cover_url" type="url" placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project_url">Project URL</Label>
              <Input id="project_url" name="project_url" type="url" placeholder="https://..." />
            </div>
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-xl font-semibold">Your items ({items?.length || 0})</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(items || []).map((it) => (
            <Card key={it.id}>
              {it.cover_url && <img src={it.cover_url} alt={it.title} className="aspect-video w-full rounded-t-lg object-cover" />}
              <CardContent className="p-4">
                <p className="font-semibold">{it.title}</p>
                {it.description && <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{it.description}</p>}
              </CardContent>
            </Card>
          ))}
          {(!items || items.length === 0) && <p className="text-neutral-500">No items yet.</p>}
        </div>
      </section>
    </div>
  );
}
