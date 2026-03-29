import type { NextRequest } from "next/server";
import { updateSession } from "./src/lib/supabase/proxy";

export async function middleware(request: NextRequest) {
  return await updateSession(request as any);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};