import { withApiContext } from "@/lib/api-handler";
import { ChildService } from "@/services/child-service";

export const PUT = withApiContext(async ({ db }, request, { params }) => {
  if (!request) throw new Error("Request is required");

  const body = await request.json();
  const childService = new ChildService(db);

  return await childService.updateChild(params.id, {
    name: body.name
  });
});

export const DELETE = withApiContext(async ({ db }, _, { params }) => {
  const childService = new ChildService(db);
  await childService.deleteChild(params.id);
  return { success: true };
});
