import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/dashboard')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}

export async function middleware(req: NextRequest) {
  return await updateSession(req)
  

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
