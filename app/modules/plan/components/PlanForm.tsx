import { useState } from "react";
import {
  Form,
  FormLayout,
  TextField,
  Select,
  Button,
  Card,
  BlockStack,
  InlineStack,
} from "@shopify/polaris";
import { useSubmit } from "@remix-run/react";

interface PlanFormProps {
  plan?: {
    id: string;
    name: string;
    code: string;
    description?: string;
    price: number;
    features: any;
    isActive: boolean;
  };
  mode: "create" | "edit";
}

export function PlanForm({ plan, mode }: PlanFormProps) {
  const submit = useSubmit();
  const [formData, setFormData] = useState({
    name: plan?.name || "",
    code: plan?.code || "",
    description: plan?.description || "",
    price: plan?.price?.toString() || "0",
    features: JSON.stringify(plan?.features || {}, null, 2),
    isActive: plan?.isActive?.toString() || "true",
  });

  const handleSubmit = () => {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    if (mode === "edit" && plan?.id) {
      data.append("id", plan.id);
    }

    submit(data, {
      method: mode === "create" ? "POST" : "PUT",
    });
  };

  return (
    <Card>
      <BlockStack gap="400">
        <Form onSubmit={handleSubmit}>
          <FormLayout>
            <TextField
              label="Plan Name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              autoComplete="off"
              requiredIndicator
            />
            <TextField
              label="Plan Code"
              value={formData.code}
              onChange={(value) => setFormData({ ...formData, code: value })}
              autoComplete="off"
              requiredIndicator
              disabled={mode === "edit"}
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              multiline={3}
              autoComplete="off"
            />
            <TextField
              label="Price"
              value={formData.price}
              onChange={(value) => setFormData({ ...formData, price: value })}
              type="number"
              prefix="$"
              autoComplete="off"
              requiredIndicator
            />
            <TextField
              label="Features (JSON)"
              value={formData.features}
              onChange={(value) => setFormData({ ...formData, features: value })}
              multiline={4}
              autoComplete="off"
              requiredIndicator
            />
            {mode === "edit" && (
              <Select
                label="Status"
                options={[
                  { label: "Active", value: "true" },
                  { label: "Inactive", value: "false" },
                ]}
                value={formData.isActive}
                onChange={(value) => setFormData({ ...formData, isActive: value })}
              />
            )}
            <InlineStack gap="400" align="end">
              <Button variant="primary" submit>
                {mode === "create" ? "Create Plan" : "Update Plan"}
              </Button>
            </InlineStack>
          </FormLayout>
        </Form>
      </BlockStack>
    </Card>
  );
} 