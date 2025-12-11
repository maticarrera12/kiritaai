import { Medal05Icon } from "hugeicons-react";
import { headers } from "next/headers";

import { RealtimeQuestList } from "./quest/realtime-quest-list";
import { auth } from "@/lib/auth";
import { QuestGenerator } from "@/lib/gamification/quest-generator";
import { prisma } from "@/lib/prisma";

export default async function AppRightSidebar() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const userId = session.user.id;

  // 1. Generar (Lazy)
  try {
    await Promise.all([
      QuestGenerator.generateDailyQuests(userId),
      QuestGenerator.generateWeeklyQuests(userId),
    ]);
  } catch (error) {
    console.error("Error generating quests:", error);
  }

  // 2. Obtener Datos iniciales
  const quests = await prisma.userQuest.findMany({
    where: {
      userId: userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <aside className="hidden xl:flex w-80 flex-col gap-8 bg-card/50 p-6 h-screen sticky top-0 overflow-y-auto">
      {/* Header Estático */}
      <div className="flex items-center gap-3 pb-4 border-b border-border/50">
        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600">
          <Medal05Icon size={20} />
        </div>
        <div>
          <h3 className="font-bold text-sm">Quest Log</h3>
          <p className="text-xs text-muted-foreground">Earn XP & Badges</p>
        </div>
      </div>

      {/* COMPONENTE REACTIVO */}
      {/* Le pasamos la data inicial y el userId para que se conecte a Pusher */}
      <RealtimeQuestList initialQuests={quests as any} userId={userId} />
    </aside>
  );
}
