import { json } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { SubscriptionService } from "app/modules/subscription/services/subscription.service";
import { authenticate } from "app/shopify.server";
import { PaymentService } from "app/modules/payment/services/payment.service";
import shopify from "app/shopify.server";
import { PlanService } from "app/modules/plan/services/plan.service";


export const action: ActionFunction = async ({ request }) => {
  const authSession = await authenticate.admin(request);
  const formData = await request.formData();
  const method = request.method;
  if (method === "POST") {
    const plan = formData.get("plan") as string;
    const planDetails = await PlanService.getPlanByCode(plan as any);
    try {
      // For paid plans, process payment first
      if (plan !== "FREE") {
        const paymentResult = await PaymentService.processPayment(
          authSession,
          Number(planDetails?.price),
          plan
        );
        await shopify.sessionStorage.storeSession(authSession.session);

        // Return the confirmation URL - subscription will be created after payment confirmation
        return json({ 
          confirmationUrl: paymentResult.confirmationUrl,
          subscriptionId: paymentResult.subscriptionId,
          trialEndsOn: paymentResult.trialEndsOn,
          shop: authSession.session.shop
        });
      } else {
        // For free plans, create subscription immediately
        const subscription = await SubscriptionService.createSubscription({
          shop: authSession.session.shop,
          price: Number(planDetails?.price),
          plan: plan as any,
        });
        return json({ subscription });
      }
    } catch (error: any) {
      return json({ error: error.message || 'Failed to process subscription' }, { status: 400 });
    }
  }

  if (method === "DELETE") {
    try {
      await SubscriptionService.cancelSubscription(authSession.session.shop);
      return json({ success: true });
    } catch (error: any) {
      return json({ error: error.message || 'Failed to cancel subscription' }, { status: 400 });
    }
  }

  return json({ error: "Method not allowed" }, { status: 405 });
};

export const loader: LoaderFunction = async ({ request }) => {
  const authSession = await authenticate.admin(request);
  const subscription = await SubscriptionService.getSubscription(authSession.session.shop);
  return json({ subscription });
}; 