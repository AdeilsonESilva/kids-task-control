import { NextResponse } from "next/server";
import { withApiContext } from "@/lib/api-handler";
import { CompletedTaskService } from "@/services/completed-task-service";

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

  const completedTaskService = new CompletedTaskService(db);
  return await completedTaskService.getCompletedTasksByChildAndDate(childId, dateStr);
});

export const POST = withApiContext(async ({ db }, request) => {
  if (!request) throw new Error("Request is required");

  const body = await request.json();
  const { taskId, childId, date } = body;

  const completedTaskService = new CompletedTaskService(db);
  return await completedTaskService.toggleTaskCompletion(taskId, childId, date);
});
