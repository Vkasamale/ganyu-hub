import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { upsertService, deleteService } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { formatMwk } from "@/lib/utils";

export default async function ServicesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold">Your rate card</h1>
        <p className="mt-1 text-sm text-neutral-600">
          List the services you offer with a price (or price range). Clients see this on your public profile and can also request quotes for anything not on the list.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Add a service</CardTitle></CardHeader>
        <CardContent>
          <SavingForm action={upsertService} successText="Service added." resetOnSuccess className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required placeholder="e.g. Logo design, Poster (A2), Wedding video edit" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">What's included (optional)</Label>
              <Textarea id="description" name="description" rows={3} placeholder="Deliverables, revisions, turnaround." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price_mwk">From (MWK)</Label>
                <Input id="price_mwk" name="price_mwk" type="number" min={0} required placeholder="50000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price_mwk_max">Up to (MWK, optional)</Label>
                <Input id="price_mwk_max" name="price_mwk_max" type="number" min={0} placeholder="150000" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="delivery_days">Typical delivery (days)</Label>
              <Input id="delivery_days" name="delivery_days" type="number" min={1} defaultValue={7} />
            </div>
            <SubmitButton pendingText="Adding…">Add to rate card</SubmitButton>
          </SavingForm>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-xl font-semibold">Your services ({services?.length || 0})</h2>
        <div className="mt-4 space-y-3">
          {(services || []).map((s: any) => (
            <Card key={s.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{s.title}</p>
                    {s.description && <p className="mt-1 text-sm text-neutral-600 whitespace-pre-wrap">{s.description}</p>}
                    <p className="mt-2 text-sm">
                      <span className="font-medium">{formatMwk(s.price_mwk)}</span>
                      {s.price_mwk_max && <span> &ndash; {formatMwk(s.price_mwk_max)}</span>}
                      <span className="text-neutral-500"> &middot; ~{s.delivery_days} day{s.delivery_days === 1 ? "" : "s"}</span>
                    </p>
                  </div>
                  <form action={deleteService}>
                    <input type="hidden" name="id" value={s.id} />
                    <Button type="submit" size="sm" variant="outline">Delete</Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!services || services.length === 0) && (
            <p className="text-neutral-500">No services yet. Add at least one above so clients know what you charge for.</p>
          )}
        </div>
      </section>
    </div>
  );
}
