import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./lib/session";
import { cookies } from "next/headers";

// Public pages that should only be accessible when not logged in
const publicRoutes = ["/", "/signup", "/maintenance"];

// Role-based dashboard paths
const roleRedirects: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  TEACHER: "/dashboard", // Customize if you have a separate teacher route
};

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Get session from cookies
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  const isLoggedIn = !!session?.userId;
  const userRole = session?.role as string | undefined;
  console.log(`User Role: ${userRole}, Is Logged In: ${isLoggedIn}`);

  const isPublicRoute = publicRoutes.includes(path);
  const isDashboard =
    path.startsWith("/dashboard") || path.startsWith("/admin/dashboard");

  // 🔁 Redirect logged-in users away from public pages (like /, /signup)
  if (isLoggedIn && isPublicRoute) {
    const redirectPath = roleRedirects[userRole || ""] || "/dashboard";
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

  // 🔒 Redirect non-logged-in users trying to access private pages
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 🔐 Optional: Restrict access to role-specific dashboards
  if (isLoggedIn && userRole) {
    if (path.startsWith("/admin") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (
      path.startsWith("/dashboard") &&
      userRole === "ADMIN" &&
      !path.startsWith("/admin")
    ) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
