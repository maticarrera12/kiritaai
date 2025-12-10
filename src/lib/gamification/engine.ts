import { ACHIEVEMENTS_LIST } from "./constants";
import { getLevelFromXP } from "./levels";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

// Definimos los tipos de eventos posibles
type GamificationEvent =
  | {
      type: "ANALYSIS_COMPLETED";
      userId: string;
      data: {
        opportunityScore: number;
        daysSinceUpdate: number;
        genreId: string;
        rating: number;
        installs: number;
        daysSinceRelease?: number;
        // Nuevos campos para análisis semántico
        painPointsText?: string; // Texto concatenado de los dolores
        description?: string; // Descripción de la app
      };
    }
  | {
      type: "CHAT_MESSAGE_SENT";
      userId: string;
    }
  | {
      type: "INTERACTION";
      userId: string;
      data: { action: "VIEW_SCREENSHOTS" | "DOWNLOAD_SCREENSHOT" };
    };

function isConsecutiveDay(lastDate: Date, currentDate: Date): boolean {
  const oneDay = 24 * 60 * 60 * 1000;
  const d1 = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
  const d2 = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const diff = Math.round(Math.abs((d1.getTime() - d2.getTime()) / oneDay));
  return diff === 1;
}

export class GamificationEngine {
  static async processEvent(event: GamificationEvent) {
    const { userId, type } = event;

    // 1. Obtener/Crear Perfil
    let profile = await prisma.userGamification.findUnique({ where: { userId } });
    if (!profile) {
      profile = await prisma.userGamification.create({ data: { userId } });
    }

    let xpGained = 0;
    let stats = (profile.stats as Record<string, number>) || {};

    // ==========================================
    // CASO 1: ANÁLISIS COMPLETADO (19 Logros)
    // ==========================================
    if (type === "ANALYSIS_COMPLETED") {
      const { data } = event;
      xpGained += 50;

      // --- RACHA & BONO DIARIO ---
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const lastUpdateStr = profile.lastStreakUpdate.toISOString().split("T")[0];
      let newStreak = profile.streakDays;
      let isStreakUpdated = false;

      if (todayStr !== lastUpdateStr) {
        xpGained += 150;
        if (isConsecutiveDay(profile.lastStreakUpdate, now) || newStreak === 0) newStreak += 1;
        else newStreak = 1;
        isStreakUpdated = true;
      }

      // --- STATS ---
      const totalAnalyses = profile.totalAnalyses + 1;

      if (data.opportunityScore >= 80) stats["score_80_plus"] = (stats["score_80_plus"] || 0) + 1;
      if (data.opportunityScore >= 90) stats["score_90_plus"] = (stats["score_90_plus"] || 0) + 1;
      if (data.opportunityScore >= 98) stats["score_98_plus"] = (stats["score_98_plus"] || 0) + 1;

      const genre = (data.genreId || "UNKNOWN").toUpperCase();
      if (genre.includes("FINANCE")) stats["cat_finance"] = (stats["cat_finance"] || 0) + 1;
      if (genre.includes("PRODUCTIVITY"))
        stats["cat_productivity"] = (stats["cat_productivity"] || 0) + 1;
      if (genre.includes("HEALTH") || genre.includes("FITNESS"))
        stats["cat_health"] = (stats["cat_health"] || 0) + 1;
      if (genre.includes("GAME")) stats["cat_game"] = (stats["cat_game"] || 0) + 1;
      if (genre.includes("SOCIAL")) stats["cat_social"] = (stats["cat_social"] || 0) + 1;
      if (genre.includes("TRAVEL")) stats["cat_travel"] = (stats["cat_travel"] || 0) + 1;

      // Guardar DB
      const updateData: any = {
        totalAnalyses: { increment: 1 },
        highestScoreFound: { set: Math.max(profile.highestScoreFound, data.opportunityScore) },
        stats: stats,
        ...(isStreakUpdated && { streakDays: newStreak, lastStreakUpdate: now }),
      };
      const updatedProfile = await prisma.userGamification.update({
        where: { userId },
        data: updateData,
      });

      // --- CHEQUEOS DE LOGROS ---
      if (updatedProfile.totalAnalyses === 1) await this.tryUnlock(userId, "first_blood", xpGained);
      if (newStreak >= 7) await this.tryUnlock(userId, "streak_master", xpGained);
      if (totalAnalyses === 10) await this.tryUnlock(userId, "research_rookie", xpGained);
      if (totalAnalyses === 50) await this.tryUnlock(userId, "research_expert", xpGained);
      if (totalAnalyses === 100) await this.tryUnlock(userId, "data_hoarder", xpGained);

      if (data.opportunityScore >= 85) await this.tryUnlock(userId, "gold_miner", xpGained);
      if (stats["score_80_plus"] >= 5) await this.tryUnlock(userId, "sniper", xpGained);
      if (stats["score_90_plus"] >= 3) await this.tryUnlock(userId, "elite_hunter", xpGained);
      if (data.opportunityScore >= 98) await this.tryUnlock(userId, "unicorn_spotter", xpGained);

      if (stats["cat_finance"] >= 3) await this.tryUnlock(userId, "wolf_of_wall_street", xpGained);
      if (stats["cat_productivity"] >= 5)
        await this.tryUnlock(userId, "productivity_guru", xpGained);
      if (stats["cat_game"] >= 5) await this.tryUnlock(userId, "gamer", xpGained);
      if (stats["cat_health"] >= 3) await this.tryUnlock(userId, "biohacker", xpGained);
      if (stats["cat_social"] >= 3) await this.tryUnlock(userId, "socialite", xpGained);
      if (stats["cat_travel"] >= 3) await this.tryUnlock(userId, "globetrotter", xpGained);

      if (data.daysSinceUpdate > 1095) await this.tryUnlock(userId, "necromancer", xpGained);
      if (data.installs > 10000000 && data.rating < 3.0)
        await this.tryUnlock(userId, "giant_slayer", xpGained);
      if (data.installs < 10000) await this.tryUnlock(userId, "niche_finder", xpGained);
      if (data.daysSinceRelease && data.daysSinceRelease < 30)
        await this.tryUnlock(userId, "fresh_blood", xpGained);

      // --- NUEVOS LOGROS SEMÁNTICOS ---
      // Bug Hunter: Busca palabras clave en los pain points
      const painText = data.painPointsText?.toLowerCase() || "";
      if (
        painText.includes("crash") ||
        painText.includes("bug") ||
        painText.includes("freeze") ||
        painText.includes("close")
      ) {
        await this.tryUnlock(userId, "bug_hunter", xpGained);
      }

      // Privacy Advocate: Busca palabras clave en descripción o categoría TOOLS
      const desc = data.description?.toLowerCase() || "";
      if (
        desc.includes("encrypted") ||
        desc.includes("privacy focused") ||
        desc.includes("no data collected") ||
        genre.includes("TOOLS")
      ) {
        // Opcional: Podrías hacerlo más estricto
        await this.tryUnlock(userId, "privacy_advocate", xpGained);
      }
    }

    // ==========================================
    // CASO 2: CHATBOT (2 Logros)
    // ==========================================
    else if (type === "CHAT_MESSAGE_SENT") {
      // Incrementamos contador
      stats["chat_msgs"] = (stats["chat_msgs"] || 0) + 1;

      // Damos 1 XP simbólico por mensaje para fomentar uso
      xpGained += 1;

      await prisma.userGamification.update({
        where: { userId },
        data: { stats: stats },
      });

      if (stats["chat_msgs"] >= 50) await this.tryUnlock(userId, "ai_whisperer", xpGained);
      if (stats["chat_msgs"] >= 200) await this.tryUnlock(userId, "prompt_engineer", xpGained);
    }

    // ==========================================
    // CASO 3: INTERACCIÓN UI
    // ==========================================
    else if (type === "INTERACTION") {
      // Visual Critic: Descargar screenshot del análisis
      if (event.data.action === "DOWNLOAD_SCREENSHOT") {
        await this.tryUnlock(userId, "visual_critic", xpGained);
      }
    }

    // --- ACTUALIZACIÓN FINAL DE XP & LEVEL UP ---
    // (Mismo código de antes para calcular niveles y notificar)
    if (xpGained > 0) {
      const currentXp = profile.xp;
      const newTotalXp = currentXp + xpGained;
      const oldRank = getLevelFromXP(currentXp);
      const newRank = getLevelFromXP(newTotalXp);

      await prisma.userGamification.update({
        where: { userId },
        data: { xp: { increment: xpGained }, level: newRank.level },
      });

      if (newRank.level > oldRank.level) {
        await pusherServer.trigger(`user-${userId}`, "level-up", {
          level: newRank.level,
          title: newRank.title,
          icon: newRank.icon,
          timestamp: Date.now(),
        });
      }
    }
  }

  // ... (Helpers tryUnlock y getXP iguales) ...
  private static getXP(achievementId: string): number {
    const achievement = ACHIEVEMENTS_LIST.find((a) => a.id === achievementId);
    return achievement ? achievement.xp : 0;
  }

  private static async tryUnlock(userId: string, achievementId: string, currentBatchXp: number) {
    const achievementConfig = ACHIEVEMENTS_LIST.find((a) => a.id === achievementId);
    if (!achievementConfig) return;

    const existing = await prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId } },
    });

    if (existing) return;

    await prisma.userAchievement.create({
      data: { userId, achievementId },
    });

    // Dar XP del logro inmediatamente en la DB
    await prisma.userGamification.update({
      where: { userId },
      data: { xp: { increment: achievementConfig.xp } },
    });

    await pusherServer.trigger(`user-${userId}`, "achievement-unlocked", {
      id: achievementConfig.id,
      title: achievementConfig.title,
      description: achievementConfig.description,
      xp: achievementConfig.xp,
      icon: achievementConfig.icon.displayName || "Rocket01Icon",
      timestamp: Date.now(),
    });
  }
}
