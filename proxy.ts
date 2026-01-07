import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./lib/session";
import { cookies } from "next/headers";

const publicRoutes = ["/", "/signup", "/maintenance"];

const roleRedirects: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  TEACHER: "/dashboard", 
};

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  const isLoggedIn = !!session?.userId;
  const userRole = session?.role as string | undefined;
  console.log("userRole",userRole);
  
  // const userRole = "ADMIN"

  const isPublicRoute = publicRoutes.includes(path);
  const isDashboard =
    path.startsWith("/dashboard") || path.startsWith("/admin/dashboard");

  
  if (isLoggedIn && isPublicRoute) {
    const redirectPath = roleRedirects[userRole || ""] || "/dashboard";
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

  
  if (!isLoggedIn && !isPublicRoute && isDashboard) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  
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
