import { Prisma } from "@prisma/client";

import { PLANS, type PlanType } from "./constants";
import { prisma } from "@/lib/prisma";

export class CreditService {
  // 1. CALCULAR SALDO TOTAL (Suma de ambos bolsillos)
  static async getBalance(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { monthlyCredits: true, extraCredits: true },
    });
    return (user?.monthlyCredits ?? 0) + (user?.extraCredits ?? 0);
  }

  // 2. VERIFICAR SI ALCANZA
  static async hasCredits(userId: string, amount: number = 1): Promise<boolean> {
    const balance = await this.getBalance(userId);
    return balance >= amount;
  }

  // 3. GASTAR CRÉDITOS (Lógica de prioridad)
  // Primero gastamos los mensuales (que caducan), luego los extra.
  static async deduct(params: {
    userId: string;
    amount: number;
    reason: string;
    description?: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    const { userId, amount, reason, description, metadata } = params;

    try {
      return await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });

        if (!user) throw new Error("User not found");

        const totalBalance = user.monthlyCredits + user.extraCredits;
        if (totalBalance < amount) {
          throw new Error("Insufficient credits.");
        }

        // --- LÓGICA DE LOS DOS BOLSILLOS ---
        let newMonthly = user.monthlyCredits;
        let newExtra = user.extraCredits;
        let remainingToDeduct = amount;

        // A. Intentar pagar con créditos mensuales
        if (newMonthly >= remainingToDeduct) {
          newMonthly -= remainingToDeduct;
          remainingToDeduct = 0;
        } else {
          // Si no alcanza, gastamos todos los mensuales y pasamos al extra
          remainingToDeduct -= newMonthly;
          newMonthly = 0;
        }

        // B. Si falta, pagar con créditos extra
        if (remainingToDeduct > 0) {
          newExtra -= remainingToDeduct;
        }

        // Actualizar Usuario
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            monthlyCredits: newMonthly,
            extraCredits: newExtra,
          },
        });

        // Registrar Transacción (Guardamos el desglose en metadata si quieres)
        await tx.creditTransaction.create({
          data: {
            userId,
            type: "DEDUCTION",
            amount: -amount,
            balance: newMonthly + newExtra, // Saldo total resultante
            reason,
            description: description || `AI consumption: ${reason}`,
            metadata: {
              ...(metadata as object),
              split: {
                monthly: user.monthlyCredits - newMonthly,
                extra: user.extraCredits - newExtra,
              },
            },
          },
        });

        return { success: true, newBalance: newMonthly + newExtra };
      });
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Error" };
    }
  }

  // 4. AÑADIR CRÉDITOS (PACKS) -> Van al bolsillo EXTRA
  static async addPackCredits(userId: string, amount: number, description: string) {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: { extraCredits: { increment: amount } }, // Sumar a EXTRA
      });

      await tx.creditTransaction.create({
        data: {
          userId,
          type: "PURCHASE",
          amount: amount,
          balance: user.monthlyCredits + user.extraCredits,
          reason: "pack_purchase",
          description,
        },
      });
    });
  }

  // 5. REINICIO MENSUAL (SUBSCRIPCIÓN) -> Toca solo el bolsillo MENSUAL
  static async resetMonthlyCredits(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.plan === "FREE") return;

    const planLimit = PLANS[user.plan as PlanType].limits.aiCredits;

    // Simplemente reseteamos monthlyCredits al límite del plan.
    // Los extraCredits quedan INTACTOS (¡Esa es la clave!).
    if (user.monthlyCredits !== planLimit) {
      await prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: { monthlyCredits: planLimit }, // Reset forzado a 30 (o 100)
        });

        await tx.creditTransaction.create({
          data: {
            userId,
            type: "SUBSCRIPTION",
            amount: planLimit - user.monthlyCredits, // Solo para registro
            balance: updatedUser.monthlyCredits + updatedUser.extraCredits,
            reason: "monthly_reset",
            description: `Monthly plan refresh (${planLimit} credits)`,
          },
        });
      });
    }
  }
}
