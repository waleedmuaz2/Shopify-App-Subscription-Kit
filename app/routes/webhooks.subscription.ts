import { BillingService } from "app/modules/billing/services/billing.service";
import type { ActionFunction } from "@remix-run/node";


export const action: ActionFunction = async ({ request }) => {
    await BillingService.handleWebhook(request);
    return new Response(null, { status: 200 });
  }