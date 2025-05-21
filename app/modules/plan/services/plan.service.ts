import prisma from "app/db.server";
import { Plan, SubscriptionPlan } from "@prisma/client";

export class PlanService {
    static async getAllPlans(): Promise<Plan[]> {
        const plans = await prisma.plan.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                price: 'asc',
            },
        });

        return plans;
    }

    static async getPlanByCode(code: SubscriptionPlan): Promise<Plan | null> {
        const plan = await prisma.plan.findUnique({
            where: {
               code: code,
            },
        });

        if (!plan) return null;

        return plan;
    }
}