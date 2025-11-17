import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    const last30 = new Date();
    last30.setDate(now.getDate() - 30);

    const prev30 = new Date();
    prev30.setDate(now.getDate() - 60);

    // ============================================
    // USERS
    // ============================================

    const newUsers = await prisma.user.count({
      where: {
        createdAt: { gte: last30 },
      },
    });

    const prevNewUsers = await prisma.user.count({
      where: {
        createdAt: { gte: prev30, lt: last30 },
      },
    });

    const activeAccounts = await prisma.user.count({
      where: {
        planStatus: "ACTIVE",
      },
    });

    // Growth rate users
    const growthRate = prevNewUsers === 0 ? 100 : ((newUsers - prevNewUsers) / prevNewUsers) * 100;

    // ============================================
    // REVENUE (solo purchases completados)
    // ============================================

    const revenueData = await prisma.purchase.aggregate({
      _sum: { amount: true },
      where: { status: "COMPLETED" },
    });

    const totalRevenue = revenueData._sum.amount || 0;

    const last30RevenueData = await prisma.purchase.aggregate({
      _sum: { amount: true },
      where: {
        status: "COMPLETED",
        createdAt: { gte: last30 },
      },
    });

    const last30Revenue = last30RevenueData._sum.amount || 0;

    const prev30RevenueData = await prisma.purchase.aggregate({
      _sum: { amount: true },
      where: {
        status: "COMPLETED",
        createdAt: { gte: prev30, lt: last30 },
      },
    });

    const prev30Revenue = prev30RevenueData._sum.amount || 0;

    const revenueGrowth =
      prev30Revenue === 0 ? 100 : ((last30Revenue - prev30Revenue) / prev30Revenue) * 100;

    // ============================================
    // RESPONSE
    // ============================================

    return NextResponse.json({
      revenue: {
        total: totalRevenue,
        growth: revenueGrowth,
        trendingUp: revenueGrowth >= 0,
      },

      users: {
        new: newUsers,
        prev: prevNewUsers,
        trendingUp: newUsers >= prevNewUsers,
      },

      accounts: {
        active: activeAccounts,
      },

      growthRate: {
        percentage: growthRate,
        trendingUp: growthRate >= 0,
      },
    });
  } catch (err) {
    console.error("Error in /api/admin/metrics:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
