import { useEffect, useState } from "react";
import {
  Card,
  ResourceList,
  ResourceItem,
  Text,
  Badge,
  Button,
  BlockStack,
  InlineStack,
} from "@shopify/polaris";
import { PlanService } from "../services/plan.service";
import { useSubmit } from "@remix-run/react";
import type { Plan } from "@prisma/client";

export function PlanList() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const submit = useSubmit();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansData = await PlanService.getAllPlans();
        setPlans(plansData);
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handlePlanSelect = (plan: Plan) => {
    const formData = new FormData();
    formData.append("plan", plan.code);
    formData.append("price", plan.price.toString());
    submit(formData, { method: "POST" });
  };

  if (loading) {
    return <Card>Loading plans...</Card>;
  }

  return (
    <Card>
      <ResourceList
        resourceName={{ singular: "plan", plural: "plans" }}
        items={plans}
        renderItem={(plan) => (
          <ResourceItem
            id={plan.id}
            accessibilityLabel={`View details for ${plan.name}`}
            name={plan.name}
            onClick={() => handlePlanSelect(plan)}
          >
            <InlineStack align="space-between">
              <BlockStack gap="400">
                <Text variant="headingMd" as="h3">{plan.name}</Text>
                <Text variant="bodyMd" as="p" tone="subdued">{plan.description}</Text>
                <InlineStack gap="400">
                  <Text variant="headingMd" as="h4">
                    {plan.price} {plan.currency}
                  </Text>
                  {!plan.isActive && (
                    <Badge tone="warning">Inactive</Badge>
                  )}
                </InlineStack>
              </BlockStack>
              <Button variant="primary">Select Plan</Button>
            </InlineStack>
          </ResourceItem>
        )}
      />
    </Card>
  );
} 