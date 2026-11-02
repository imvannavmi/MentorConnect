import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const guardedRole = path.startsWith("/dashboard/mentee")
    ? "mentee"
    : path.startsWith("/dashboard/mentor")
      ? "mentor"
      : path.startsWith("/dashboard/admin")
        ? "admin"
      : null;
  if (!guardedRole) return NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.redirect(new URL("/login?setup=required", request.url));

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== guardedRole && profile?.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = { matcher: ["/dashboard/mentee/:path*", "/dashboard/mentor/:path*", "/dashboard/admin/:path*"] };
