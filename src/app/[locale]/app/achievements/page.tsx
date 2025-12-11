import {
  CheckmarkBadge01Icon,
  BookOpen01Icon,
  Search01Icon,
  Analytics01Icon,
  BulbIcon,
  Target02Icon,
  Diamond01Icon,
  MagicWand01Icon,
  Briefcase01Icon,
  Building03Icon,
  CrownIcon,
} from "hugeicons-react";
import { headers } from "next/headers";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { auth } from "@/lib/auth";
import { ACHIEVEMENTS_LIST, AchievementTier } from "@/lib/gamification/constants";
import { getLevelFromXP, getLevelProgress, getNextLevel } from "@/lib/gamification/levels";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

// Mapeo de string a componente de icono para niveles
const LEVEL_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  BookOpen01Icon,
  Search01Icon,
  Analytics01Icon,
  BulbIcon,
  Target02Icon,
  Diamond01Icon,
  CrystalBall01Icon: MagicWand01Icon,
  Briefcase01Icon,
  Building03Icon,
  CrownIcon,
};

// Colores del icono según rareza (solo para desbloqueados)
const TIER_ICON_COLORS: Record<AchievementTier, string> = {
  COMMON: "text-slate-500",
  RARE: "text-blue-500",
  LEGENDARY: "text-amber-500",
  MYTHIC: "text-purple-500",
};

const TIER_LABELS: Record<AchievementTier, { label: string; color: string }> = {
  COMMON: { label: "Common", color: "text-slate-400" },
  RARE: { label: "Rare", color: "text-blue-400" },
  LEGENDARY: { label: "Legendary", color: "text-amber-400" },
  MYTHIC: { label: "Mythic", color: "text-purple-400" },
};

export default async function AchievementsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return <div>Unauthorized</div>;

  // 1. Obtener datos del usuario
  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      userGamification: true, // Stats (XP, Nivel)
      userAchievements: true, // Logros desbloqueados
    },
  });

  const xp = userData?.userGamification?.xp || 0;
  const currentRank = getLevelFromXP(xp);
  const nextRank = getNextLevel(currentRank.level);
  const progress = getLevelProgress(xp);

  // Stats del JSON para calcular progreso de achievements
  const stats = (userData?.userGamification?.stats as Record<string, number>) || {};

  // Set de IDs desbloqueados para búsqueda rápida O(1)
  const unlockedIds = new Set(userData?.userAchievements.map((a) => a.achievementId));

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 md:px-8">
      {/* --- HEADER DE PROGRESO --- */}
      <div className="mb-12 bg-white dark:bg-neutral-900 border border-border rounded-3xl p-8 shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Career</h1>
            {(() => {
              const LevelIcon = LEVEL_ICONS[currentRank.icon];
              return (
                <div
                  className={cn(
                    "mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border",
                    currentRank.color
                  )}
                >
                  {LevelIcon && <LevelIcon size={16} />}
                  {currentRank.title}
                </div>
              );
            })()}
          </div>
          <div className="text-right">
            <span className="text-4xl font-black text-primary">Lvl {currentRank.level}</span>
          </div>
        </div>

        {/* Barra de XP */}
        <div className="relative h-4 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs font-medium text-muted-foreground">
          <span>{xp} XP</span>
          <span>{nextRank ? `${nextRank.minXp} XP (${nextRank.title})` : "Max Level"}</span>
        </div>
      </div>

      {/* --- GRID DE LOGROS --- */}
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <CheckmarkBadge01Icon className="text-green-500" />
        Achievements ({unlockedIds.size}/{ACHIEVEMENTS_LIST.length})
      </h2>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {ACHIEVEMENTS_LIST.map((achievement) => {
          const isUnlocked = unlockedIds.has(achievement.id);
          const Icon = achievement.icon;

          // Calcular progreso
          let currentProgress = 0;
          if (achievement.statKey) {
            // Campos especiales del modelo userGamification
            if (achievement.statKey === "totalAnalyses") {
              currentProgress = userData?.userGamification?.totalAnalyses || 0;
            } else if (achievement.statKey === "streakDays") {
              currentProgress = userData?.userGamification?.streakDays || 0;
            } else {
              // Stats del JSON
              currentProgress = (stats[achievement.statKey] as number) || 0;
            }
          }

          const progressPercent = isUnlocked
            ? 100
            : Math.min(100, Math.round((currentProgress / achievement.target) * 100));

          return (
            <Tooltip key={achievement.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl cursor-default transition-all duration-200",
                    isUnlocked ? "hover:bg-muted/50" : "opacity-60"
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      isUnlocked ? TIER_ICON_COLORS[achievement.tier] : "text-neutral-400 grayscale"
                    )}
                  >
                    <Icon size={28} />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium text-center leading-tight",
                      isUnlocked ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {achievement.title}
                  </span>

                  {/* Barra de Progreso */}
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-500 rounded-full",
                        isUnlocked
                          ? "bg-green-500"
                          : progressPercent > 0
                            ? "bg-primary/70"
                            : "bg-transparent"
                      )}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[220px] p-3">
                <p className="font-semibold mb-1">{achievement.title}</p>
                <p className="text-muted-foreground text-xs mb-2">{achievement.description}</p>

                {/* Progress en tooltip */}
                {achievement.statKey && !isUnlocked && (
                  <div className="mb-2">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {currentProgress}/{achievement.target}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-[10px] font-medium uppercase tracking-wide pt-1 border-t border-border/50">
                  <span className={TIER_LABELS[achievement.tier].color}>
                    {TIER_LABELS[achievement.tier].label}
                  </span>
                  <span className="text-yellow-500">+{achievement.xp} XP</span>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
