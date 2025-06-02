import { NextResponse } from "next/server";
import { withApiContext } from "@/lib/api-handler";
import { CompletedTaskService } from "@/services/completed-task-service";

export const GET = withApiContext(async ({ db }, request) => {
  if (!request) throw new Error("Request is required");

  const { searchParams } = new URL(request.url);
  const childId = searchParams.get("childId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!childId || !startDate || !endDate) {
    return NextResponse.json(
      { error: "Child ID, start date and end date are required" },
      { status: 400 }
    );
  }

  const completedTaskService = new CompletedTaskService(db);
  return await completedTaskService.getCompletedTasksByChildAndDateRange(childId, startDate, endDate);
});

export const POST = withApiContext(async ({ db }, request) => {
  if (!request) throw new Error("Request is required");

  const body = await request.json();
  const { taskId, childId, date } = body;

  const completedTaskService = new CompletedTaskService(db);
  return await completedTaskService.toggleTaskCompletion(taskId, childId, date);
});
