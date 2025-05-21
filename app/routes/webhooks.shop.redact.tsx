import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);
  
  console.log(`Received ${topic} webhook from ${shop}`);
  
  // Process the shop data erasure request
  // Delete all data associated with this shop
  // This is typically called 48 hours after a shop has uninstalled your app
  
  // Example: Delete all shop data from your database
  await db.subscription.deleteMany({ where: { shop } });
  await db.session.deleteMany({ where: { shop } });
  // Add any other shop-specific data cleanup here
  
  return new Response(null, { status: 200 });
}; 