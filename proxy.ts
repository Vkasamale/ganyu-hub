import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

// Changed function name from middleware to proxy
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};