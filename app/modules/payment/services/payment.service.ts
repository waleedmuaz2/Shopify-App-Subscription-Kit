import { authenticate } from "app/shopify.server";
import { SubscriptionService } from "app/modules/subscription/services/subscription.service";
import config from "app/config";

export class PaymentService {
    static async processPayment(authSession : any, amount: number, plan: string, currency: string = "USD") {
      const { admin, session } = authSession;
      try {
        const response = await admin.graphql(
          `mutation appSubscriptionCreate(
          $name: String!
          $lineItems: [AppSubscriptionLineItemInput!]!
          $returnUrl: URL!
          $trialDays: Int
          $test: Boolean
        ) {
          appSubscriptionCreate(
            name: $name
            lineItems: $lineItems
            returnUrl: $returnUrl
            trialDays: $trialDays
            test: $test
          ) {
            appSubscription {
              id
              status
              lineItems {
                id
                plan {
                  pricingDetails {
                    ... on AppRecurringPricing {
                      price {
                        amount
                        currencyCode
                      }
                      interval
                    }
                  }
                }
              }
            }
            confirmationUrl
            userErrors {
              field
              message
            }
          }
        }`,
        {
          variables: {
            name: `${plan} Plan`,
            lineItems: [
              {
                plan: {
                  appRecurringPricingDetails: {
                    interval: "EVERY_30_DAYS",
                    price: {
                      amount: Number(amount),
                      currencyCode: "USD"
                    }
                  }
                }
              }
            ],
            returnUrl: `${config.APP_URL}/subscription/confirm?shop=${session.shop}`,
            trialDays: 7,
            test: process.env.NODE_ENV !== "production"
          }
        }
      );

      // Handle the response
      if (response.ok) {
        const responseJson = await response.json();
        console.log("GraphQL Response:", responseJson);
        
        if (!responseJson.data) {
          console.error("GraphQL Error:", responseJson);
          throw new Error(responseJson.errors?.[0]?.message || "Failed to create subscription");
        }

        const { appSubscriptionCreate } = responseJson.data;

        if (appSubscriptionCreate.userErrors?.length > 0) {
          throw new Error(appSubscriptionCreate.userErrors[0].message);
        }

        // Create subscription with trial
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 7);

        await SubscriptionService.createSubscription({
          shop: session.shop,
          plan: plan as any,
          price: amount,
          paymentStatus: "PENDING",
          trialDays: 7,
        });
        return {
          confirmationUrl: appSubscriptionCreate.confirmationUrl,
          subscriptionId: appSubscriptionCreate.appSubscription.id,
          trialEndsOn: trialEndsAt.toISOString(),
        };
      } else {  
        throw new Error("Failed to create subscription");
      }
    } catch (error: any) {
      console.error("Payment processing error:", error);
      throw new Error(error.message || "Failed to process payment");
    }
  }

  static async verifySubscription(
    request: Request,
    shop: string,
    subscriptionId: string
  ) {
    const { admin } = await authenticate.admin(request);
    try {
      const response = await admin.graphql(
        `query getSubscription($id: ID!) {
          node(id: $id) {
            ... on AppSubscription {
              id
              status
              lineItems {
                id
                plan {
                  pricingDetails {
                    ... on AppRecurringPricing {
                      price {
                        amount
                        currencyCode
                      }
                      interval
                    }
                  }
                }
              }
            }
          }
        }`,
        {
          variables: {
            id: subscriptionId
          }
        }
      );

      const responseJson = await response.json();

      if (!responseJson.data?.node) {
        throw new Error("Subscription not found");
      }

      const subscription = responseJson.data.node;

      if (subscription.status === "ACTIVE") {
        await SubscriptionService.updatePaymentStatus(shop, "PAID");
        return true;
      } else {
        await SubscriptionService.updatePaymentStatus(shop, "FAILED");
        return false;
      }
    } catch (error: any) {
      console.error("Subscription verification error:", error);
      throw error;
    }
  }
}
