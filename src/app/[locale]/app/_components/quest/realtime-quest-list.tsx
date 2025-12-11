"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { CountdownTimer } from "./countdown-timer";
import { QuestItem } from "./quest-item";
import { pusherClient } from "@/lib/pusher";

interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  xpReward: number;
  status: string; // "ACTIVE" | "COMPLETED" | "CLAIMED"
  type: string;
  expiresAt: Date;
}

interface RealtimeQuestListProps {
  initialQuests: Quest[];
  userId: string;
}

export function RealtimeQuestList({ initialQuests, userId }: RealtimeQuestListProps) {
  const [quests, setQuests] = useState<Quest[]>(initialQuests);

  // Sincronizar si cambian los props (navegación)
  useEffect(() => {
    setQuests(initialQuests);
  }, [initialQuests]);

  // Escuchar eventos de Pusher
  useEffect(() => {
    if (!userId) return;

    const channel = pusherClient.subscribe(`user-${userId}`);

    const handleProgress = (data: {
      questId: string;
      newProgress: number;
      isCompleted: boolean;
    }) => {
      setQuests((prevQuests) =>
        prevQuests.map((q) => {
          if (q.id === data.questId) {
            return {
              ...q,
              progress: data.newProgress,
              status: data.isCompleted ? "COMPLETED" : "ACTIVE",
            };
          }
          return q;
        })
      );
    };

    channel.bind("quest-progress", handleProgress);

    return () => {
      channel.unbind("quest-progress", handleProgress);
      pusherClient.unsubscribe(`user-${userId}`);
    };
  }, [userId]);

  // Derivados para renderizar
  const dailyQuests = quests.filter((q) => q.type === "DAILY");
  const weeklyQuests = quests.filter((q) => q.type === "WEEKLY");

  const dailyExpires = dailyQuests[0]?.expiresAt || new Date();
  const weeklyExpires = weeklyQuests[0]?.expiresAt || new Date();

  // Helper para ordenar: Incompletas primero
  const sortByCompletion = (a: Quest, b: Quest) => {
    const aCompleted = a.status === "COMPLETED" || a.status === "CLAIMED";
    const bCompleted = b.status === "COMPLETED" || b.status === "CLAIMED";
    if (aCompleted === bCompleted) return 0;
    return aCompleted ? 1 : -1;
  };

  return (
    <div className="space-y-8">
      {/* --- DAILY QUESTS --- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Daily Quests
          </h4>
          <CountdownTimer targetDate={new Date(dailyExpires)} />
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {dailyQuests.length > 0 ? (
              dailyQuests.sort(sortByCompletion).map((quest) => (
                <motion.div
                  key={quest.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <QuestItem
                    title={quest.title}
                    description={quest.description}
                    progress={quest.progress}
                    target={quest.target}
                    xp={quest.xpReward}
                    isCompleted={quest.status === "COMPLETED" || quest.status === "CLAIMED"}
                  />
                </motion.div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">No active quests.</p>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* --- WEEKLY QUESTS --- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Weekly Quests
          </h4>
          <CountdownTimer targetDate={new Date(weeklyExpires)} />
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {weeklyQuests.length > 0 ? (
              weeklyQuests.sort(sortByCompletion).map((quest) => (
                <motion.div
                  key={quest.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <QuestItem
                    title={quest.title}
                    description={quest.description}
                    progress={quest.progress}
                    target={quest.target}
                    xp={quest.xpReward}
                    isCompleted={quest.status === "COMPLETED" || quest.status === "CLAIMED"}
                  />
                </motion.div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">No active quests.</p>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
