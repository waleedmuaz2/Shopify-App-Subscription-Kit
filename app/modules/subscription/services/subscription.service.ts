import prisma from "app/db.server";
import { SubscriptionPlan, SubscriptionStatus, PaymentStatus } from "@prisma/client";
import { PlanService } from "app/modules/plan/services/plan.service";

export class SubscriptionService {
  static async createSubscription(data: {
    shop: string;
    plan: SubscriptionPlan;
    price: number;
    currency?: string;
    trialDays?: number;
    paymentStatus?: PaymentStatus;
  }) {
    const plan = await PlanService.getPlanByCode(data.plan);
    if (!plan) {
      throw new Error(`Plan ${data.plan} not found`);
    }

    const startDate = new Date();
    const trialEndsAt = data.plan === "FREE" 
      ? null  // No trial for free plan
      : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days trial for paid plans
    
    const subscriptionEndDate = data.plan === "FREE"
      ? null  // No end date for free plan
      : new Date(trialEndsAt!.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month after trial ends

    // Delete any existing subscription for this shop
    await prisma.subscription.deleteMany({
      where: { shop: data.shop }
    });
    return prisma.subscription.create({
      data: {
        shop: data.shop,
        plan: data.plan,
        status: data.plan === "FREE" ? "ACTIVE" : "TRIAL",
        startDate,
        trialEndsAt: data.paymentStatus === "PAID" ? trialEndsAt : null,
        endDate: data.paymentStatus === "PAID" ? subscriptionEndDate : null,
        price: plan.price,
        currency: plan.currency,
        features: plan.features as any,
        paymentStatus: data.paymentStatus || (data.plan === "FREE" ? "NONE" : "PENDING"),
      },
    });
  }

  static async updateSubscriptionStatus(
    shop: string,
    status: SubscriptionStatus,
    plan: SubscriptionPlan,
    price: number,
  ) {
    const planDetails = await PlanService.getPlanByCode(plan);
    if (!planDetails) {
      throw new Error(`Plan ${plan} not found`);
    }

    const startDate = new Date();
    const trialEndsAt = plan === "FREE" 
      ? null 
      : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endDate = plan === "FREE"
      ? null
      : new Date(trialEndsAt!.getTime() + 30 * 24 * 60 * 60 * 1000);

    return prisma.subscription.update({
      where: { shop },
      data: { 
        status: plan === "FREE" ? "ACTIVE" : "TRIAL",
        plan, 
        features: planDetails.features as any, 
        price: planDetails.price, 
        currency: planDetails.currency,
        startDate, 
        trialEndsAt, 
        endDate,
        paymentStatus: plan === "FREE" ? "NONE" : "PENDING",
      },
    });
  }

  static async updatePaymentStatus(shop: string, paymentStatus: PaymentStatus) {
    const subscription = await prisma.subscription.findUnique({
      where: { shop }
    });

    if (!subscription) {
      throw new Error("No subscription found");
    }

    return prisma.subscription.update({
      where: { shop },
      data: { paymentStatus },
    });
  }

  static async getSubscription(shop: string) {
    return prisma.subscription.findUnique({
      where: { shop },
    });
  }

  static async cancelSubscription(shop: string) {
    return prisma.subscription.update({
      where: { shop },
      data: {
        status: "CANCELLED",
        trialEndsAt: null,
        endDate: null,
        paymentStatus: "NONE",
      },
    });
  }

  // private static getPlanFeatures(plan: SubscriptionPlan) {
  //   const features = {
  //     FREE: {
  //       update_template: true,
  //       create_template: false,
  //       custom_template: false,
  //       email_support: true,
  //       priority_support: false,
  //     },
  //     PREMIUM: {
  //       update_template: true,
  //       create_template: true,
  //       custom_template: true,
  //       email_support: true,
  //       priority_support: true,
  //     }
  //   } as const;

  //   return features[plan as keyof typeof features];
  // }
  static async purchaseSuccess(shopRecord: any){

    const startDate = new Date();
    const trialEndsAt =  new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(trialEndsAt!.getTime() + 30 * 24 * 60 * 60 * 1000);
    return await prisma.subscription.update({
      where: { shop: shopRecord.shop },
      data: { 
        paymentStatus: "PAID",
        startDate: startDate,
        trialEndsAt: trialEndsAt,
        endDate: endDate,
      }, // Adjust field name as needed
    });    
  }

  static async createSubscriptionHistory(data: {
    charge_id: string;
    shop_name: string;
  }) {
    return await prisma.subscriptionHistory.create({
      data: data,
    });
  }
} 