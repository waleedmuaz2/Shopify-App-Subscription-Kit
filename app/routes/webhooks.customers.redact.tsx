import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);
  
  console.log(`Received ${topic} webhook from ${shop}`);
  
  // Process the customer data erasure request
  // Delete all customer data associated with this customer
  // Payload contains customer.id, customer.email, customer.phone
  
  // Example: Delete customer data from your database
  // await db.customerData.deleteMany({
  //   where: {
  //     shopDomain: shop,
  //     customerId: payload.customer.id
  //   }
  // });
  
  return new Response(null, { status: 200 });
}; 