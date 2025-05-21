import { withApiContext } from "@/lib/api-handler";
import { TaskService } from "@/services/task-service";

export const GET = withApiContext(async ({ db }) => {
  const taskService = new TaskService(db);
  return await taskService.getAllTasks();
});

export const POST = withApiContext(async ({ db }, request: Request) => {
  if (!request) throw new Error("Request is required");

  const body = await request.json();
  const taskService = new TaskService(db);

  return await taskService.createTask({
    title: body.title,
    description: body.description,
    value: body.value,
    isDiscount: body.isDiscount,
    isBonus: body.isBonus,
  });
});
