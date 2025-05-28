/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { ApiContext, getApiContext } from "./api-context";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

type ApiHandler<T = any> = (
  context: ApiContext,
  request: Request,
  params?: any
) => Promise<T>;

async function checkAuth(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    return false;
  }

  return true;
}

export function withApiContext<T>(
  handler: ApiHandler<T>
): (request: Request, params?: any) => Promise<NextResponse> {
  return async (request: Request, params?: any) => {
    try {
      // Verificar autenticação
      const isAuthenticated = await checkAuth(request);

      if (!isAuthenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const context = getApiContext();
      const result = await handler(context, request, params);
      return NextResponse.json(result);
    } catch (error) {
      console.error("API error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
