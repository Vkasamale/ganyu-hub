import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient();
  await supabase.auth.signOut({ scope: "global" });
  // Without this the redirect can land on a cached render of "/" that still
  // shows the signed-in shell — the session is gone but the page says
  // otherwise, which reads as "sign out did nothing". Clearing the layout
  // cache makes the landing page render for a signed-out visitor.
  revalidatePath("/", "layout");
  return NextResponse.redirect(new URL("/", request.url), { status: 302 });
}

// Signing out stays a POST: a GET that ended a session could be fired by any
// page on the internet with <img src="/auth/signout">. But a signed-in person
// who types or bookmarks this URL used to get "Nothing here", because a route
// with no GET handler is a 404. Send them home instead, still signed in.
export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/", request.url), { status: 302 });
}
