import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { requireSellerPage } from "@/lib/require-role";
import { upsertService, deleteService } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/money-input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { ImagePicker } from "@/components/image-picker";
import { formatMwk } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";

export default async function ServicesPage() {
  const supabase = createClient();
  const user = await getSessionUser();
  if (!user) redirect("/login");
  // Clients have no business here; the nav hid it, the route did not.
  await requireSellerPage();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold">Your rate card</h1>
        <p className="mt-1 text-sm text-ink/65">
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
                <MoneyInput id="price_mwk" name="price_mwk" required placeholder="50,000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price_mwk_max">Up to (MWK, optional)</Label>
                <MoneyInput id="price_mwk_max" name="price_mwk_max" placeholder="150,000" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="delivery_days">Typical delivery (days)</Label>
              <Input id="delivery_days" name="delivery_days" type="number" min={1} defaultValue={7} />
            </div>
            <div className="space-y-1.5">
              {/* Item 42 (§G4): the questions you already answer in DMs,
                  answered once. One per line, question and answer split by a
                  pipe — no repeater widget, unlimited entries. */}
              <Label htmlFor="faqs">Common questions (optional)</Label>
              <Textarea
                id="faqs"
                name="faqs"
                rows={4}
                placeholder={"Do you do rush jobs? | Yes, 50% surcharge for 48-hour turnaround.\nDo I get the source files? | Yes, AI and PDF on every logo."}
              />
              <p className="text-xs text-ink/55">
                One per line: question, then a <span className="font-mono">|</span>, then your
                answer. Shown on your public profile.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Image (optional)</Label>
              <ImagePicker name="image_file" shape="square" label="Upload image" />
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
                <div className="flex items-start gap-4">
                  {s.image_url && (
                    <img src={s.image_url} alt={s.title} className="h-16 w-16 shrink-0 rounded-md object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{s.title}</p>
                    {s.description && <p className="mt-1 text-sm text-ink/65 whitespace-pre-wrap">{s.description}</p>}
                    <p className="mt-2 text-sm">
                      <span className="font-medium">{formatMwk(s.price_mwk)}</span>
                      {s.price_mwk_max && <span> &ndash; {formatMwk(s.price_mwk_max)}</span>}
                      {s.delivery_days && <span className="text-ink/55"> &middot; ~{s.delivery_days} day{s.delivery_days === 1 ? "" : "s"}</span>}
                    </p>
                  </div>
                  <SavingForm action={deleteService} silent>
                    <input type="hidden" name="id" value={s.id} />
                    <Button type="submit" size="sm" variant="outline">Delete</Button>
                  </SavingForm>
                </div>
              </CardContent>
            </Card>
          ))}
          {/* Quiet weight (§H2): the form above is the action. */}
          {(!services || services.length === 0) && (
            <EmptyState
              tone="quiet"
              title="No services yet"
              body="Clients filter Browse by price. Without a priced service you never appear in those results — add one above."
            />
          )}
        </div>
      </section>
    </div>
  );
}
