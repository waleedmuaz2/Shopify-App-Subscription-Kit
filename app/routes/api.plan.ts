import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import { PlanService } from "app/modules/plan/services/plan.service";

export const loader: LoaderFunction = async ({ request }) => {
  const authSession = await authenticate.admin(request);
  const plans = await PlanService.getAllPlans();
  console.log('Plans from service:', plans); // Debug log
  return json({ plans });
}; 