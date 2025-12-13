import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProfileRoute = pathname.includes("/app/u/");

  if (isProfileRoute) {
    const sessionToken1 = request.cookies.get("better-auth.session_token");
    const sessionToken2 = request.cookies.get("__Secure-better-auth.session_token");
    const hasSession = !!sessionToken1 || !!sessionToken2;

    if (!hasSession) {
      const newPath = pathname.replace("/app/u/", "/u/");
      const redirectUrl = new URL(newPath, request.url);

      return NextResponse.redirect(redirectUrl, 307);
    }
  }

  const response = intlMiddleware(request);

  if (isProfileRoute) {
    response.headers.set("x-pathname", pathname);
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files, API routes, and other system paths
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};
