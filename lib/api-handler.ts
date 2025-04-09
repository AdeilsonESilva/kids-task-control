/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { ApiContext, getApiContext } from "./api-context";

type ApiHandler<T = any> = (
  context: ApiContext,
  request: Request,
  params?: any
) => Promise<T>;

export function withApiContext<T>(
  handler: ApiHandler<T>
): (request: Request, params?: any) => Promise<NextResponse> {
  return async (request: Request, params?: any) => {
    try {
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
