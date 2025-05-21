import { authenticate } from "../../../shopify.server";
import { SubscriptionService } from "app/modules/subscription/services/subscription.service";

export class BillingService {
  static async cancelSubscription(request: Request, shop: string) {
    const { admin } = await authenticate.admin(request);
    const subscription = await SubscriptionService.getSubscription(shop);

    if (!subscription) {
      throw new Error("No subscription found");
    }

    const response = await admin.graphql(`
      mutation CancelSubscription($id: ID!) {
        appSubscriptionCancel(id: $id) {
          appSubscription {
            id
            status
          }
          userErrors {
            field
            message
          }
        }
      }
    `, {
      variables: {
        id: subscription.id
      }
    });

    const responseJson = await response.json();
    const { appSubscriptionCancel } = responseJson.data;

    if (appSubscriptionCancel.userErrors.length > 0) {
      throw new Error(appSubscriptionCancel.userErrors[0].message);
    }

    await SubscriptionService.cancelSubscription(shop);

    return {
      status: appSubscriptionCancel.appSubscription.status
    };
  }

  static async handleWebhook(request: Request) {
    const { admin } = await authenticate.admin(request);
    const body = await request.json();
    const { shop, topic } = body;

    if (topic === "APP_SUBSCRIPTIONS_UPDATE") {
      const subscription = await SubscriptionService.getSubscription(shop);
      if (!subscription) return;

      // Get the latest subscription status from Shopify
      const response = await admin.graphql(`
        query GetSubscription($id: ID!) {
          appSubscription(id: $id) {
            id
            status
            currentPeriodEnd
          }
        }
      `, {
        variables: {
          id: subscription.id
        }
      });

      const responseJson = await response.json();
      const { appSubscription } = responseJson.data;
      console.log(appSubscription);
      // Update our database based on Shopify's status
      if (appSubscription.status === "ACTIVE") {
        await SubscriptionService.updatePaymentStatus(shop, "PAID");
      } else if (appSubscription.status === "CANCELLED") {
        await SubscriptionService.updatePaymentStatus(shop, "NONE");
      } else if (appSubscription.status === "EXPIRED") {
        await SubscriptionService.updatePaymentStatus(shop, "FAILED");
      }
    }
  }
} 