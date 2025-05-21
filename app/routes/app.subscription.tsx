import { json } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { SubscriptionPlans } from "../modules/subscription/components/SubscriptionPlans";
import { authenticate } from "../shopify.server";
import { SubscriptionService } from "../modules/subscription/services/subscription.service";
import { PlanService } from "../modules/plan/services/plan.service";

import {
    Box,
    Card,
    Layout,
    Link,
    List,
    Page,
    Text,
    BlockStack,
  } from "@shopify/polaris";
  import { TitleBar } from "@shopify/app-bridge-react";
  
  export const action: ActionFunction = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const formData = await request.formData();
    const method = request.method;

    if (method === "POST") {
      const plan = formData.get("plan") as string;
      const price = parseFloat(formData.get("price") as string);
      
      // Check if subscription exists
      const existingSubscription = await SubscriptionService.getSubscription(session.shop);
      
      if (existingSubscription) {
        // Update existing subscription
        const subscription = await SubscriptionService.updateSubscriptionStatus(
          session.shop,
          "ACTIVE",
          plan as any,
          price
        );
        return json({ subscription });
      } else {
        // Create new subscription
        const subscription = await SubscriptionService.createSubscription({
          shop: session.shop,
          plan: plan as any,
          price,
        });
        return json({ subscription });
      }
    }

    if (method === "DELETE") {
      await SubscriptionService.cancelSubscription(session.shop);
      return json({ success: true });
    }

    return json({ error: "Method not allowed" }, { status: 405 });
  };
  
  export const loader: LoaderFunction = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const plans = await PlanService.getAllPlans();
    const subscription = await SubscriptionService.getSubscription(session.shop);
    return json({ plans, subscription });
  };
  
  export default function SubscriptionPage() {
    return (
      <Page>
        <TitleBar title="Subscription" />
        <Layout>
          <Layout.Section>
            <Card>
               <SubscriptionPlans />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }  