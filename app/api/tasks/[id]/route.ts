import { withApiContext } from "@/lib/api-handler";
import { TaskService } from "@/services/task-service";

export const PUT = withApiContext(async ({ db }, request, { params }) => {
  if (!request) throw new Error("Request is required");

  const body = await request.json();
  const taskService = new TaskService(db);

  const { id } = await params;

  return await taskService.updateTask(id, {
    title: body.title,
    description: body.description,
    value: body.value,
    isBonus: body.isBonus,
    isDiscount: body.isDiscount,
  });
});

export const DELETE = withApiContext(async ({ db }, _, { params }) => {
  const taskService = new TaskService(db);
  const { id } = await params;
  await taskService.deleteTask(id);
  return { success: true };
});
