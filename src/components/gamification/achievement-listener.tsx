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

    channel.bind("achievement-unlocked", (data: any) => {
      // 1. Reproducir sonido (only if howler is loaded)
      if (howlerRef.current) {
        const sound = new howlerRef.current.Howl({ src: ["/sounds/achievement.mp3"] });
        sound.play();
      }

      // 2. Renderizar Toast Customizado "Xbox Style"
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
    });

    // Listener para Level Up
    channel.bind("level-up", (data: any) => {
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
    });

    return () => {
      pusherClient.unsubscribe(`user-${userId}`);
    };
  }, [userId]);

  return null; // Componente invisible
}
