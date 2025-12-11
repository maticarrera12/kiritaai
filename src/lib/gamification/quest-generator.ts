import { QUEST_TEMPLATES, WEEKLY_QUEST_TEMPLATES } from "./quest-templates";
import { prisma } from "@/lib/prisma";

export class QuestGenerator {
  static async generateDailyQuests(userId: string) {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));

    // 1. Verificar si ya tiene misiones generadas hoy
    const count = await prisma.userQuest.count({
      where: {
        userId,
        type: "DAILY", // Asegúrate de tener este campo en tu DB o usar un tag
        createdAt: { gte: today },
      },
    });

    if (count > 0) return; // Ya tiene sus misiones de hoy

    // 2. Limpiar misiones viejas no completadas (Opcional, para no llenar la DB)
    // await prisma.userQuest.deleteMany({ ... });

    // 3. Generar 3 misiones nuevas
    // Barajamos las plantillas y tomamos 3
    const shuffledTemplates = [...QUEST_TEMPLATES].sort(() => 0.5 - Math.random()).slice(0, 3);

    const newQuestsData = shuffledTemplates.map((template) => {
      // INSTANCIAMOS LA MISIÓN DINÁMICA
      const { target, criteria, variableLabel } = template.generateCriteria();

      // Calculamos XP: Base + Bonus por dificultad
      const finalXp = template.baseXp + target * 10;

      // Generamos el título final
      const title = template.templateTitle(variableLabel); // Ej: "Finance Specialist"

      // Fecha de expiración: Final del día
      const expiresAt = new Date();
      expiresAt.setHours(23, 59, 59, 999);

      return {
        userId,
        questId: template.id, // Referencia a la plantilla base
        type: "DAILY",
        title: title,
        description: generateDescription(template.id, target, variableLabel),
        target: target,
        xpReward: finalXp,
        criteria: criteria, // Guardamos el JSON con las reglas específicas de ESTA instancia
        expiresAt,
      };
    });

    // 4. Guardar en DB
    await prisma.userQuest.createMany({
      data: newQuestsData,
    });
  }

  static async generateWeeklyQuests(userId: string) {
    const now = new Date();

    // 1. Calcular el Lunes de esta semana (Start of Week)
    const day = now.getDay(); // 0 (Domingo) - 6 (Sábado)
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Ajuste al Lunes
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    // 2. Verificar si ya tiene misiones semanales creadas desde el Lunes
    const count = await prisma.userQuest.count({
      where: {
        userId,
        type: "WEEKLY",
        createdAt: { gte: startOfWeek },
      },
    });

    if (count > 0) return; // Ya tiene las de esta semana

    // 3. Generar 2 Misiones Semanales
    // (Son más difíciles, con 2 basta)
    const shuffled = [...WEEKLY_QUEST_TEMPLATES].sort(() => 0.5 - Math.random()).slice(0, 2);

    // 4. Calcular Expiración (Próximo Domingo 23:59)
    const expiresAt = new Date(startOfWeek);
    expiresAt.setDate(startOfWeek.getDate() + 6);
    expiresAt.setHours(23, 59, 59, 999);

    const newQuestsData = shuffled.map((template) => {
      const { target, criteria, variableLabel } = template.generateCriteria();

      // XP Bonus por ser semanal
      const finalXp = template.baseXp + target * 5;

      return {
        userId,
        questId: template.id,
        type: "WEEKLY", // <--- Tipo Diferente
        title: template.templateTitle(variableLabel),
        description: generateDescription(template.id, target, variableLabel),
        target: target,
        xpReward: finalXp,
        criteria: criteria,
        expiresAt,
      };
    });

    await prisma.userQuest.createMany({
      data: newQuestsData as any, // Cast necesario a veces con Prisma Json
    });
  }
}

// Helper para formatear nombres de categoría (Ej: "GAME_CASINO" -> "Casino")
function formatCategoryName(cat: string) {
  return cat
    .replace(/_/g, " ")
    .replace("GAME ", "")
    .replace("AND", "&")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

// Helper para descripciones
function generateDescription(id: string, target: number, label: string) {
  const formattedLabel = label ? formatCategoryName(label) : "";

  // Daily Quests
  if (id === "category_explorer")
    return `Analyze ${target} ${target === 1 ? "app" : "apps"} in the ${formattedLabel} category.`;
  if (id === "score_hunter")
    return `Find ${target} ${target === 1 ? "app" : "apps"} with Opportunity Score > ${label}.`;
  if (id === "ai_talker") return `Send ${target} messages to KiritaAI.`;

  // Weekly Quests
  if (id === "weekly_researcher") return `Analyze ${target} apps this week. Keep pushing!`;
  if (id === "weekly_specialist") return `Analyze ${target} ${formattedLabel} apps this week.`;
  if (id === "weekly_headhunter")
    return `Find ${target} apps with Opportunity Score > ${label} this week.`;

  return "Complete the task.";
}
