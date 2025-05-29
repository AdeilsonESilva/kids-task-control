import { withApiContext } from "@/lib/api-handler";
import { TaskService } from "@/services/task-service";

export const POST = withApiContext(async ({ db }, request) => {
  if (!request) throw new Error("Request is required");

  const { taskIds } = await request.json();
  const taskService = new TaskService(db);

  const tasks = taskIds.map((taskId: string, index: number) => ({
    id: taskId,
    order: index,
  }));

  return await taskService.updateTasksOrder(tasks);
});
