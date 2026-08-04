import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Sign-in link expired or invalid. Please request a new one.")}`);
    }
  }
  if (type === "recovery") return NextResponse.redirect(`${origin}/reset-password`);
  return NextResponse.redirect(`${origin}/dashboard`);
}
