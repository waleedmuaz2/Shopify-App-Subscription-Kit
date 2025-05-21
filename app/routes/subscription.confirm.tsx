import { data, json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

import {
  AppProvider as PolarisAppProvider,
  Banner,
  Layout,
  Page,
  Text,
  Link,
  Card,
  Button,
  Icon,
  BlockStack,
  InlineStack,
  Box,
  Divider,
} from "@shopify/polaris";
import { AlertDiamondIcon, CheckCircleIcon } from '@shopify/polaris-icons';
import shopify from "app/shopify.server";
import prisma from "app/db.server";
import { SubscriptionService } from "app/modules/subscription/services/subscription.service";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const chargeId = url.searchParams.get("charge_id");
  if (!chargeId) {
    return json({ success: false, message: "Charge_id is required" });
  }
  if (!shop) {
    return json({ success: false, message: "Shop is required" });
  }
  const session = await shopify.sessionStorage.findSessionsByShop(shop);
  if (!session) {
    return json({ success: false, message: "Session not found" });
  }
  const shopRecord = await prisma.session.findUnique({
    where: { shop: session[0].shop }
  });
  if (!shopRecord) {
    return redirect('/app/subscription');
  }

  // --- Shopify GraphQL verification ---
  const SUBSCRIPTION_QUERY = `
    query GetSubscription($id: ID!) {
      node(id: $id) {
        ... on AppSubscription {
          id
          name
          status
          test
          lineItems {
            id
            plan {
              pricingDetails {
                __typename
                ... on AppRecurringPricing {
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  if (!shopRecord.accessToken) {
    return json({ success: false, message: "Access token not found in session" });
  }
  const gql_charge_id = `gid://shopify/AppSubscription/${chargeId}`;
  const response = await fetch(`https://${shop}/admin/api/2023-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": shopRecord.accessToken,
    },
    body: JSON.stringify({
      query: SUBSCRIPTION_QUERY,
      variables: { id: gql_charge_id },
    }),
  });
  const result = await response.json();
  console.log(result);
  const subscription = result.data?.node;

  if (subscription && subscription.status === "ACTIVE") {
    SubscriptionService.purchaseSuccess(shopRecord);
    SubscriptionService.createSubscriptionHistory({
      charge_id: chargeId,
      shop_name: shopRecord.shop,
    });
    return json({
      success: true,
      message: "Subscription activated and payment status updated to Paid.",
    });
  }

  return json({
    success: false,
    message: "Subscription not active or not found.",
  });
};

export default function SubscriptionConfirm() {
  const { success, message } = useLoaderData<{ success: boolean; message: string }>();
  const loaderData = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <PolarisAppProvider i18n={loaderData.polarisTranslations}>
    <Page
      title={success ? "Subscription Confirmed" : "Subscription Status"}
      primaryAction={
        {
          content: "Return to Subscription Page",
          onAction: () => {
            navigate("/app/subscription");
          }
        }
      }
    >
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: '2rem' }}>
              <BlockStack gap="400" align="center">
                <Box paddingBlock="400">
                  <div style={{ fontSize: '3rem' }}>
                    <Icon
                      source={success ?  CheckCircleIcon : AlertDiamondIcon}
                      tone={success ? "success" : "critical"}
                    />
                  </div>
                </Box>
                <Text variant="headingLg" as="h2" alignment="center">
                  {success ? "Thank You for Subscribing!" : "Subscription Issue"}
                </Text>
                <Text as="p" alignment="center" tone="subdued">
                  {message}
                </Text>
                <Divider />
                <Box paddingBlock="400">
                  <InlineStack gap="200" align="center">
                    <Button onClick={() => navigate("/app/subscription")} variant={!success ? "primary" : "secondary"}>
                      Return to Subscription Page
                    </Button>
                  </InlineStack>
                </Box>
              </BlockStack>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
    </PolarisAppProvider>
  );
} 