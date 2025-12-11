"use client";

import {
  Rocket01Icon,
  Diamond01Icon,
  SkullIcon,
  Search01Icon,
  Message01Icon,
  FireIcon,
} from "hugeicons-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { pusherClient } from "@/lib/pusher";

// Mapeo de ID del logro -> Componente de icono
const ICON_MAP: Record<string, any> = {
  first_blood: Rocket01Icon,
  streak_master: FireIcon,
  gold_miner: Diamond01Icon,
  necromancer: SkullIcon,
  data_hoarder: Search01Icon,
  ai_whisperer: Message01Icon,
};

export function AchievementListener({ userId }: { userId: string }) {
  const howlerRef = useRef<typeof import("howler") | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Dynamically import howler to avoid SSR issues
    import("howler").then((module) => {
      howlerRef.current = module;
    });

    // Suscribirse al canal privado del usuario
    const channel = pusherClient.subscribe(`user-${userId}`);

    // Handler para Achievement Unlocked
    const handleAchievement = (data: any) => {
      if (howlerRef.current) {
        const sound = new howlerRef.current.Howl({ src: ["/sounds/achievement.mp3"] });
        sound.play();
      }

      const IconComponent = ICON_MAP[data.id] || Rocket01Icon;

      toast.custom(
        () => (
          <div className="flex items-center gap-4 bg-neutral-900 border border-yellow-500/30 text-white px-6 py-4 rounded-full shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2.5 rounded-full text-black shadow-lg shadow-orange-500/20">
              <IconComponent variant="solid" size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-0.5">
                Achievement Unlocked
              </p>
              <p className="text-base font-bold leading-tight">{data.title}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{data.description}</p>
            </div>
            <div className="h-8 w-px bg-white/10 mx-1" />
            <div className="flex items-baseline gap-0.5 whitespace-nowrap">
              <span className="text-base font-black text-yellow-400">+{data.xp}</span>
              <span className="text-[10px] font-bold text-neutral-500">XP</span>
            </div>
          </div>
        ),
        { duration: 5000, position: "bottom-center" }
      );
    };

    // Handler para Level Up
    const handleLevelUp = (data: any) => {
      if (howlerRef.current) {
        const levelSound = new howlerRef.current.Howl({ src: ["/sounds/levelup.mp3"] });
        levelSound.play();
      }

      toast.custom(
        () => (
          <div className="flex flex-col items-center justify-center bg-neutral-900 border-2 border-purple-500 text-white px-8 py-6 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              LEVEL UP!
            </h2>
            <p className="text-lg font-bold mt-1">You are now a {data.title}</p>
            <span className="text-sm text-neutral-400 mt-2">Level {data.level}</span>
          </div>
        ),
        { duration: 6000, position: "top-center" }
      );
    };

    // Handler para Set Completed (Daily/Weekly bonus)
    const handleSetCompleted = (data: any) => {
      if (howlerRef.current) {
        const bonusSound = new howlerRef.current.Howl({ src: ["/sounds/bonus.mp3"] });
        bonusSound.play();
      }

      toast.custom(
        () => (
          <div className="flex flex-col items-center justify-center bg-gradient-to-r from-indigo-900 to-violet-900 border border-indigo-500/50 text-white px-8 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-white/20 p-2 rounded-full mb-2">
              <FireIcon className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
              {data.title}
            </p>
            <p className="text-sm font-medium opacity-90">{data.description}</p>
            <div className="mt-2 bg-white/10 px-3 py-1 rounded-full text-sm font-bold text-yellow-300 border border-white/5">
              +{data.xp} XP Bonus
            </div>
          </div>
        ),
        { duration: 6000, position: "bottom-center" }
      );
    };

    // Handler para Quest Completed (individual)
    const handleQuestCompleted = (data: any) => {
      if (howlerRef.current) {
        const questSound = new howlerRef.current.Howl({ src: ["/sounds/quest.mp3"] });
        questSound.play();
      }

      toast.custom(
        () => (
          <div className="flex items-center gap-3 bg-emerald-950 border border-emerald-500/30 text-white px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-gradient-to-br from-emerald-400 to-green-600 p-2 rounded-lg text-black">
              <Search01Icon variant="solid" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Quest Complete
              </p>
              <p className="text-sm font-semibold">{data.title}</p>
            </div>
            <div className="flex items-baseline gap-0.5 ml-2">
              <span className="text-sm font-bold text-emerald-400">+{data.xp}</span>
              <span className="text-[10px] text-emerald-600">XP</span>
            </div>
          </div>
        ),
        { duration: 4000, position: "bottom-center" }
      );
    };

    // Bind all event handlers
    channel.bind("achievement-unlocked", handleAchievement);
    channel.bind("level-up", handleLevelUp);
    channel.bind("set-completed", handleSetCompleted);
    channel.bind("quest-completed", handleQuestCompleted);

    // Cleanup: Unbind all handlers before unsubscribing
    return () => {
      channel.unbind("achievement-unlocked", handleAchievement);
      channel.unbind("level-up", handleLevelUp);
      channel.unbind("set-completed", handleSetCompleted);
      channel.unbind("quest-completed", handleQuestCompleted);
      pusherClient.unsubscribe(`user-${userId}`);
    };
  }, [userId]);

  return null; // Componente invisible
}
