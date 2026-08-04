import { NextRequest, NextResponse } from "next/server";

// ponytail: only job here is to surface the pathname to server components via
// a request header, so RootLayout can strip the navbar on public share-link
// pages (/j/[token]). Next.js doesn't expose the current path to server
// layouts natively.
export function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
