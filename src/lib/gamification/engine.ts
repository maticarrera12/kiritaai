// lib/gamification/engine.ts

import { ACHIEVEMENTS_LIST, QUEST_SET_BONUSES } from "./constants";
import { getLevelFromXP } from "./levels";
import { QuestGenerator } from "./quest-generator";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

// Definición de eventos que el motor acepta
type GamificationEvent =
  | {
      type: "ANALYSIS_COMPLETED";
      userId: string;
      data: {
        opportunityScore: number;
        daysSinceUpdate: number;
        genreId: string; // Ej: "FINANCE", "GAME_ACTION"
        rating: number;
        installs: number;
        daysSinceRelease?: number;
        painPointsText?: string; // Para búsqueda de bugs
        description?: string; // Para búsqueda de privacidad
      };
    }
  | {
      type: "CHAT_MESSAGE_SENT";
      userId: string;
    }
  | {
      type: "INTERACTION";
      userId: string;
      data: { action: "VIEW_SCREENSHOTS" };
    };

// Helper para calcular días consecutivos
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

    // 0. Asegurar Misiones Diarias (Generate on Write/Read hybrid)
    await QuestGenerator.generateDailyQuests(userId);

    // 1. Obtener o Crear Perfil
    let profile = await prisma.userGamification.findUnique({ where: { userId } });
    if (!profile) {
      profile = await prisma.userGamification.create({ data: { userId } });
    }

    // Inicializamos acumuladores
    let xpGained = 0;
    // Casteamos el JSON a un objeto manipulable
    let stats = (profile.stats as Record<string, number>) || {};

    // ====================================================
    // CASO 1: ANÁLISIS COMPLETADO (Core Loop)
    // ====================================================
    if (type === "ANALYSIS_COMPLETED") {
      const { data } = event;

      // A. XP BASE
      xpGained += 50;

      // B. RACHA (STREAK) Y BONO DIARIO
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const lastUpdateStr = profile.lastStreakUpdate.toISOString().split("T")[0];

      let newStreak = profile.streakDays;
      let isStreakUpdated = false;
      const isFirstOfTheDay = todayStr !== lastUpdateStr;

      if (isFirstOfTheDay) {
        // ¡Bono por volver!
        xpGained += 150;

        if (isConsecutiveDay(profile.lastStreakUpdate, now) || newStreak === 0) {
          newStreak += 1;
        } else {
          newStreak = 1; // Racha rota
        }
        isStreakUpdated = true;
      }

      // C. ACTUALIZAR STATS (Contadores para logros)
      const totalAnalyses = profile.totalAnalyses + 1;

      // Scores
      if (data.opportunityScore >= 80) stats["score_80_plus"] = (stats["score_80_plus"] || 0) + 1;
      if (data.opportunityScore >= 90) stats["score_90_plus"] = (stats["score_90_plus"] || 0) + 1;
      if (data.opportunityScore >= 98) stats["score_98_plus"] = (stats["score_98_plus"] || 0) + 1;

      // Categorías (Normalizadas)
      const genre = (data.genreId || "UNKNOWN").toUpperCase();
      if (genre.includes("FINANCE")) stats["cat_finance"] = (stats["cat_finance"] || 0) + 1;
      if (genre.includes("PRODUCTIVITY"))
        stats["cat_productivity"] = (stats["cat_productivity"] || 0) + 1;
      if (genre.includes("HEALTH") || genre.includes("FITNESS"))
        stats["cat_health"] = (stats["cat_health"] || 0) + 1;
      if (genre.includes("GAME")) stats["cat_game"] = (stats["cat_game"] || 0) + 1;
      if (genre.includes("SOCIAL")) stats["cat_social"] = (stats["cat_social"] || 0) + 1;
      if (genre.includes("TRAVEL")) stats["cat_travel"] = (stats["cat_travel"] || 0) + 1;

      // Guardar cambios en DB (Stats y Racha)
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

      // D. CHEQUEO DE LOGROS (The 24 List)

      // Volumen
      if (updatedProfile.totalAnalyses === 1) await this.tryUnlock(userId, "first_blood");
      if (totalAnalyses === 10) await this.tryUnlock(userId, "research_rookie");
      if (totalAnalyses === 50) await this.tryUnlock(userId, "research_expert");
      if (totalAnalyses === 100) await this.tryUnlock(userId, "data_hoarder");

      // Racha
      if (newStreak >= 7) await this.tryUnlock(userId, "streak_master");

      // Calidad
      if (data.opportunityScore >= 85) await this.tryUnlock(userId, "gold_miner");
      if (stats["score_80_plus"] >= 5) await this.tryUnlock(userId, "sniper");
      if (stats["score_90_plus"] >= 3) await this.tryUnlock(userId, "elite_hunter");
      if (data.opportunityScore >= 98) await this.tryUnlock(userId, "unicorn_spotter");

      // Categorías
      if (stats["cat_finance"] >= 3) await this.tryUnlock(userId, "wolf_of_wall_street");
      if (stats["cat_productivity"] >= 5) await this.tryUnlock(userId, "productivity_guru");
      if (stats["cat_game"] >= 5) await this.tryUnlock(userId, "gamer");
      if (stats["cat_health"] >= 3) await this.tryUnlock(userId, "biohacker");
      if (stats["cat_social"] >= 3) await this.tryUnlock(userId, "socialite");
      if (stats["cat_travel"] >= 3) await this.tryUnlock(userId, "globetrotter");

      // Técnicos
      if (data.daysSinceUpdate > 1095) await this.tryUnlock(userId, "necromancer");
      if (data.installs > 10000000 && data.rating < 3.0)
        await this.tryUnlock(userId, "giant_slayer");
      if (data.installs < 10000) await this.tryUnlock(userId, "niche_finder");
      if (data.daysSinceRelease && data.daysSinceRelease < 30)
        await this.tryUnlock(userId, "fresh_blood");

      // Semánticos
      const painText = data.painPointsText?.toLowerCase() || "";
      if (painText.includes("crash") || painText.includes("bug") || painText.includes("freeze")) {
        await this.tryUnlock(userId, "bug_hunter");
      }
      const desc = data.description?.toLowerCase() || "";
      if (desc.includes("encrypted") || desc.includes("privacy") || desc.includes("no data")) {
        await this.tryUnlock(userId, "privacy_advocate");
      }
    }

    // ====================================================
    // CASO 2: CHATBOT INTERACTION
    // ====================================================
    else if (type === "CHAT_MESSAGE_SENT") {
      xpGained += 1; // XP simbólica por mensaje
      stats["chat_msgs"] = (stats["chat_msgs"] || 0) + 1;

      await prisma.userGamification.update({
        where: { userId },
        data: { stats: stats },
      });

      if (stats["chat_msgs"] >= 50) await this.tryUnlock(userId, "ai_whisperer");
      if (stats["chat_msgs"] >= 200) await this.tryUnlock(userId, "prompt_engineer");
    }

    // ====================================================
    // CASO 3: UI INTERACTION
    // ====================================================
    else if (type === "INTERACTION") {
      if (event.data.action === "VIEW_SCREENSHOTS") {
        await this.tryUnlock(userId, "visual_critic");
      }
    }

    // ====================================================
    // PROCESAMIENTO DE MISIONES (QUESTS)
    // ====================================================
    const activeQuests = await prisma.userQuest.findMany({
      where: { userId, status: "ACTIVE", expiresAt: { gt: new Date() } },
    });

    for (const quest of activeQuests) {
      const criteria = quest.criteria as any;
      let progressMade = 0;

      // Match Análisis
      if (type === "ANALYSIS_COMPLETED" && criteria.action === "ANALYSIS") {
        let matches = true;
        const eData = (event as any).data;

        if (criteria.genre && !eData.genreId.toUpperCase().includes(criteria.genre))
          matches = false;
        if (criteria.minScore && eData.opportunityScore < criteria.minScore) matches = false;
        if (criteria.minInstalls && eData.installs < criteria.minInstalls) matches = false;

        if (matches) progressMade = 1;
      }

      // Match Chat
      if (type === "CHAT_MESSAGE_SENT" && criteria.action === "CHAT") {
        progressMade = 1;
      }

      if (progressMade > 0) {
        const newProgress = quest.progress + progressMade;
        const isCompleted = newProgress >= quest.target;

        // 1. Actualizar DB
        await prisma.userQuest.update({
          where: { id: quest.id },
          data: { progress: newProgress, status: isCompleted ? "COMPLETED" : "ACTIVE" },
        });

        // 2. Notificar progreso en tiempo real (Para la barra lateral)
        await pusherServer.trigger(`user-${userId}`, "quest-progress", {
          questId: quest.id,
          newProgress: newProgress,
          isCompleted: isCompleted,
          timestamp: Date.now(),
        });

        // 3. Si se completó, dar XP y notificar logro
        if (isCompleted) {
          xpGained += quest.xpReward;

          await pusherServer.trigger(`user-${userId}`, "quest-completed", {
            title: quest.title,
            xp: quest.xpReward,
          });

          // 4. Verificar si completó el Set (Daily/Weekly)
          await this.checkSetCompletion(userId, quest.type, quest.expiresAt);
        }
      }
    }

    // ====================================================
    // FINAL: APLICAR XP TOTAL Y CHECK LEVEL UP
    // ====================================================
    if (xpGained > 0) {
      // Leemos la XP más reciente (los logros ya sumaron la suya en tryUnlock)
      const currentProfile = await prisma.userGamification.findUnique({ where: { userId } });
      const currentXp = currentProfile?.xp || 0;
      const newTotalXp = currentXp + xpGained;

      const oldRank = getLevelFromXP(currentXp);
      const newRank = getLevelFromXP(newTotalXp);

      // Guardamos la XP acumulada de eventos base + quests
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

  // --- HELPERS PRIVADOS ---

  // Verificar si el usuario completó todas las misiones de un set (Daily/Weekly)
  private static async checkSetCompletion(userId: string, type: string, expiresAt: Date) {
    // Buscamos todas las misiones de ese "lote" (mismo tipo y misma fecha de expiración)
    const setQuests = await prisma.userQuest.findMany({
      where: {
        userId,
        type, // "DAILY" o "WEEKLY"
        expiresAt: expiresAt, // Esto agrupa el set de hoy/esta semana
      },
    });

    // Verificamos si TODAS están completadas
    const allCompleted = setQuests.every((q) => q.status === "COMPLETED");

    if (allCompleted && setQuests.length > 0) {
      const bonusConfig = type === "DAILY" ? QUEST_SET_BONUSES.DAILY : QUEST_SET_BONUSES.WEEKLY;

      // Dar XP del Bono
      await prisma.userGamification.update({
        where: { userId },
        data: { xp: { increment: bonusConfig.xp } },
      });

      // Notificar con un evento especial
      await pusherServer.trigger(`user-${userId}`, "set-completed", {
        title: bonusConfig.title,
        description: bonusConfig.description,
        xp: bonusConfig.xp,
        icon: bonusConfig.icon,
        timestamp: Date.now(),
      });
    }
  }

  private static async tryUnlock(userId: string, achievementId: string) {
    const achievementConfig = ACHIEVEMENTS_LIST.find((a) => a.id === achievementId);
    if (!achievementConfig) return;

    // Verificar si ya existe para evitar duplicados
    const existing = await prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId } },
    });

    if (existing) return;

    // Crear registro
    await prisma.userAchievement.create({
      data: { userId, achievementId },
    });

    // Dar XP del logro inmediatamente
    await prisma.userGamification.update({
      where: { userId },
      data: { xp: { increment: achievementConfig.xp } },
    });

    // Notificar
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
