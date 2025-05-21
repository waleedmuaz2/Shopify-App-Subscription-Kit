import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);
  
  console.log(`Received ${topic} webhook from ${shop}`);
  
  // Process the customer data request
  // Payload contains customer.id, customer.email, customer.phone
  // You should generate and send back all customer data you have stored
  
  return new Response(null, { status: 200 });
}; 