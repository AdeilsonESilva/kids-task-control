import { withApiContext } from "@/lib/api-handler";
import { ChildService } from "@/services/child-service";

export const GET = withApiContext(async ({ db }) => {
  const childService = new ChildService(db);
  return await childService.getAllChildren();
});

export const POST = withApiContext(async ({ db }, request) => {
  if (!request) throw new Error("Request is required");

  const body = await request.json();
  const childService = new ChildService(db);

  return await childService.createChild({
    name: body.name,
  });
});
