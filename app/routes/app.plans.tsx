import { json } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { PlanService } from "../modules/plan/services/plan.service";
import { PlanList } from "../modules/plan/components/PlanList";
import { Page, Layout } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export const action: ActionFunction = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const method = request.method;

  if (method === "POST") {
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const features = JSON.parse(formData.get("features") as string);

    const plan = await PlanService.createPlan({
      name,
      code: code as any,
      description,
      price,
      features,
    });

    return json({ plan });
  }

  if (method === "PUT") {
    const id = formData.get("id") as string;
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      features: JSON.parse(formData.get("features") as string),
      isActive: formData.get("isActive") === "true",
    };

    const plan = await PlanService.updatePlan(id, data);
    return json({ plan });
  }

  if (method === "DELETE") {
    const id = formData.get("id") as string;
    await PlanService.deletePlan(id);
    return json({ success: true });
  }

  return json({ error: "Method not allowed" }, { status: 405 });
};

export const loader: LoaderFunction = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const plans = await PlanService.getAllPlans();
  return json({ plans });
};

export default function PlansPage() {
  return (
    <Page>
      <TitleBar title="Subscription Plans" />
      <Layout>
        <Layout.Section>
          <PlanList />
        </Layout.Section>
      </Layout>
    </Page>
  );
} 