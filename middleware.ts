import { NextRequest, NextResponse } from "next/server";

// Protege /dashboard e /pedido/* com uma sessão simples baseada em cookie.
// A senha (ADMIN_PASSWORD) é conferida em app/api/auth/login/route.ts.

const COOKIE_NAME = "tatim_admin_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const precisaAuth =
    (pathname.startsWith("/dashboard") && pathname !== "/dashboard/login") ||
    pathname.startsWith("/pedido/");

  if (!precisaAuth) return NextResponse.next();

  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const esperado = process.env.ADMIN_PASSWORD ?? "";

  if (!cookie || !esperado || cookie !== esperado) {
    const loginUrl = new URL("/dashboard/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/pedido/:path*"],
};
