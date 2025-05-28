import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    // Atualizar a sessão
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Lista de rotas públicas
    const publicRoutes = ["/login", "/api"];
    const isPublicRoute = publicRoutes.some((route) =>
      req.nextUrl.pathname.startsWith(route)
    );

    // Se for uma rota pública
    if (isPublicRoute) {
      // Se estiver autenticado e tentar acessar login, redireciona para dashboard
      if (session && req.nextUrl.pathname.startsWith("/login")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return res;
    }

    // Se não estiver autenticado e tentar acessar rota protegida
    if (!session) {
      // Encontrar o cookie do Supabase (ele tem um prefixo específico)
      const supabaseCookie = req.cookies
        .getAll()
        .find(
          (cookie) =>
            cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")
        );

      if (!supabaseCookie) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      try {
        const tokenData = JSON.parse(decodeURIComponent(supabaseCookie.value));
        if (!tokenData.access_token) {
          return NextResponse.redirect(new URL("/login", req.url));
        }
      } catch {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return res;
  } catch (error) {
    console.error("Middleware error:", error);
    // Em caso de erro, permite o acesso
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
