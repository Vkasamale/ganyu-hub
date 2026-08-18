import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

function hardenCookie(options?: CookieOptions): CookieOptions {
  return {
    ...options,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: options?.sameSite ?? "lax",
    path: options?.path ?? "/",
  };
}

// Combined proxy: refreshes the Supabase session cookie AND sets x-pathname
// so RootLayout can strip nav/footer on public share-link pages (/j/*).
export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  let response = NextResponse.next({ request: { headers: requestHeaders } });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet: CookieToSet[]) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: requestHeaders } });
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, hardenCookie(options))
          );
        },
      },
    }
  );
  await supabase.auth.getUser();
  return response;
}

// `monitoring` is Sentry's tunnelRoute (next.config.mjs). It must skip this
// proxy: it carries no Supabase session, so running the session refresh on it
// wastes an auth round-trip per event, and it is a machine endpoint that should
// never be redirected by anything meant for a browsing user.
export const config = {
  matcher: ["/((?!monitoring|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};