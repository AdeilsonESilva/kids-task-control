import { NextResponse } from "next/server";
import { withApiContext } from "@/lib/api-handler";
import { MonthlySummaryService } from "@/services/monthly-summary-service";

export const GET = withApiContext(async ({ db }, request) => {
  if (!request) throw new Error("Request is required");

  const { searchParams } = new URL(request.url);
  const childId = searchParams.get("childId");
  const dateStr = searchParams.get("date");

  if (!childId || !dateStr) {
    return NextResponse.json(
      { error: "Child ID and date are required" },
      { status: 400 }
    );
  }

  const monthlySummaryService = new MonthlySummaryService(db);
  return await monthlySummaryService.getMonthlySummary(childId, dateStr);
});
