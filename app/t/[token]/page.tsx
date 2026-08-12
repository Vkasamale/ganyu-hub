import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { submitTestimonial } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { Logo } from "@/components/logo";
import { Turnstile } from "@/components/turnstile";

/**
 * Item 27 — the past client's side of a testimonial request, reusing the
 * `/j/[token]` share-link pattern: unauthenticated, service-role read, the
 * token is the only credential.
 *
 * The person landing here has very likely never heard of Ganyu Hub. They were
 * sent a link by someone they hired once. So the page explains what it is
 * before asking for anything, and asks for as little as possible — a name, how
 * they know the creative, and what they thought.
 */

export const metadata = { robots: { index: false, follow: false } };

function admin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export default async function TestimonialLinkPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const db = admin();
  const { data: row } = await db
    .from("testimonials")
    .select("id, status, creative_id")
    .eq("token", token)
    .maybeSingle();
  if (!row) notFound();

  const { data: creative } = await db
    .from("profiles")
    .select("full_name, headline, avatar_url, location")
    .eq("id", row.creative_id)
    .maybeSingle();

  const name = creative?.full_name || "This creative";

  // Already used. Say so warmly rather than 404-ing — the likeliest visitor is
  // the person who just filled it in and pressed back.
  if (row.status !== "pending") {
    return (
      <Shell>
        <Card>
          <CardHeader>
            <CardTitle>Thank you — this one is already done</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ink/70">
              This link has already been used. If you meant to write something else about {name},
              ask them to send you a fresh link.
            </p>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <Card>
        <CardHeader>
          <CardTitle>Say a few words about working with {name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {creative && (
            <div className="flex items-center gap-3 rounded-md border border-ink/10 bg-wash/40 p-3">
              {creative.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={creative.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-ink/10" />
              )}
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{creative.full_name}</div>
                <div className="truncate text-xs text-ink/60">
                  {creative.headline || "Creative on Ganyu Hub"}
                  {creative.location ? ` · ${creative.location}` : ""}
                </div>
              </div>
            </div>
          )}

          <p className="text-sm leading-relaxed text-ink/70">
            {name} asked you to vouch for work you hired them for. Ganyu Hub is where they take on
            new work, and clients there want to know what they are like to deal with. It takes a
            minute, and what you write appears on their profile with your name.
          </p>

          <SavingForm action={submitTestimonial} successText="Sent — thank you." className="space-y-4">
            <input type="hidden" name="token" value={token} />

            <div className="space-y-1.5">
              <Label htmlFor="client_name">Your name</Label>
              <Input id="client_name" name="client_name" required maxLength={80} placeholder="Grace Banda" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="relationship">How do you know them?</Label>
              <Input
                id="relationship"
                name="relationship"
                maxLength={120}
                placeholder="Owner, Blantyre Bakery — they designed our packaging"
              />
              <p className="text-xs text-ink/55">Shown under your name. Leave it blank if you would rather not.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="body">What were they like to work with?</Label>
              <Textarea
                id="body"
                name="body"
                required
                rows={6}
                minLength={40}
                maxLength={1500}
                placeholder="What you asked them for, how it went, and whether you would hire them again."
              />
              <p className="text-xs text-ink/55">
                Please write it in your own words — this is worth nothing to them if it reads as
                though they wrote it themselves.
              </p>
            </div>

            <Turnstile />
            <SubmitButton pendingText="Sending…">Send testimonial</SubmitButton>

            <p className="text-xs text-ink/55">
              {name} chooses whether to show this on their profile, but cannot change a word of it.
              Your name and what you write may be shown publicly; nothing else is collected.
            </p>
          </SavingForm>
        </CardContent>
      </Card>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>
      {children}
    </div>
  );
}
