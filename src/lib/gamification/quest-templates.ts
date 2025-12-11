// lib/gamification/quest-templates.ts

export type QuestCriteria = {
  action: "ANALYSIS" | "CHAT";
  genre?: string; // ej: "FINANCE"
  minScore?: number; // ej: 80
  minInstalls?: number; // ej: 1000000
};

type QuestTemplate = {
  id: string;
  templateTitle: (var1: string) => string;
  baseXp: number;
  generateCriteria: () => { target: number; criteria: QuestCriteria; variableLabel: string };
};

// --- LISTA COMPLETA DE CATEGORÍAS DE GOOGLE PLAY ---
const CATEGORIES = [
  // Apps Generales
  "ART_AND_DESIGN",
  "AUTO_AND_VEHICLES",
  "BEAUTY",
  "BOOKS_AND_REFERENCE",
  "BUSINESS",
  "COMICS",
  "COMMUNICATION",
  "DATING",
  "EDUCATION",
  "ENTERTAINMENT",
  "EVENTS",
  "FINANCE",
  "FOOD_AND_DRINK",
  "HEALTH_AND_FITNESS",
  "HOUSE_AND_HOME",
  "LIBRARIES_AND_DEMO",
  "LIFESTYLE",
  "MAPS_AND_NAVIGATION",
  "MEDICAL",
  "MUSIC_AND_AUDIO",
  "NEWS_AND_MAGAZINES",
  "PARENTING",
  "PERSONALIZATION",
  "PHOTOGRAPHY",
  "PRODUCTIVITY",
  "SHOPPING",
  "SOCIAL",
  "SPORTS",
  "TOOLS",
  "TRAVEL_AND_LOCAL",
  "VIDEO_PLAYERS",
  "WEATHER",

  // Juegos (Genres)
  "GAME_ACTION",
  "GAME_ADVENTURE",
  "GAME_ARCADE",
  "GAME_BOARD",
  "GAME_CARD",
  "GAME_CASINO",
  "GAME_CASUAL",
  "GAME_EDUCATIONAL",
  "GAME_MUSIC",
  "GAME_PUZZLE",
  "GAME_RACING",
  "GAME_ROLE_PLAYING",
  "GAME_SIMULATION",
  "GAME_SPORTS",
  "GAME_STRATEGY",
  "GAME_TRIVIA",
  "GAME_WORD",
];

// Helper para que el título se vea bonito (Ej: "GAME_ACTION" -> "Game Action")
const formatCategoryName = (cat: string) => {
  return cat
    .replace(/_/g, " ")
    .replace("GAME ", "") // Opcional: Quitar "GAME" para que diga "Action Specialist" en vez de "Game Action Specialist"
    .replace("AND", "&")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export const QUEST_TEMPLATES: QuestTemplate[] = [
  // --- PLANTILLA 1: EXPLORADOR DE CATEGORÍAS ---
  {
    id: "category_explorer",
    baseXp: 100,
    // Usamos el helper para el título
    templateTitle: (cat) => `${formatCategoryName(cat)} Specialist`,
    generateCriteria: () => {
      // Elegimos una categoría al azar de la lista completa
      const randomCat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

      // Target: 1 o 2 apps (para que no sea muy difícil encontrar categorías raras)
      const target = Math.floor(Math.random() * 2) + 1;

      return {
        target,
        variableLabel: randomCat, // Guardamos el ID crudo para la lógica
        criteria: {
          action: "ANALYSIS",
          genre: randomCat, // El motor comparará usando .includes()
        },
      };
    },
  },

  // --- PLANTILLA 2: CAZADOR DE CALIDAD ---
  {
    id: "score_hunter",
    baseXp: 150,
    templateTitle: (score) => `Find ${score}+ Score Apps`,
    generateCriteria: () => {
      const scores = [80, 85, 90];
      const selectedScore = scores[Math.floor(Math.random() * scores.length)];

      return {
        target: 1,
        variableLabel: selectedScore.toString(),
        criteria: {
          action: "ANALYSIS",
          minScore: selectedScore,
        },
      };
    },
  },

  // --- PLANTILLA 3: INTERACCIÓN IA ---
  {
    id: "ai_talker",
    baseXp: 50,
    templateTitle: () => "Curious Mind",
    generateCriteria: () => {
      const target = Math.floor(Math.random() * 5) + 3;
      return {
        target,
        variableLabel: "",
        criteria: {
          action: "CHAT",
        },
      };
    },
  },
];

export const WEEKLY_QUEST_TEMPLATES: QuestTemplate[] = [
  // 1. VOLUMEN MASIVO
  {
    id: "weekly_researcher",
    baseXp: 400,
    templateTitle: () => "Market Marathon",
    generateCriteria: () => {
      // Objetivo: Entre 15 y 25 apps en una semana
      const target = Math.floor(Math.random() * 11) + 15;
      return {
        target,
        variableLabel: "",
        criteria: { action: "ANALYSIS" },
      };
    },
  },

  // 2. ESPECIALISTA SEMANAL
  {
    id: "weekly_specialist",
    baseXp: 500,
    templateTitle: (cat) => `Weekly ${formatCategoryName(cat)} Focus`,
    generateCriteria: () => {
      const randomCat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      // Objetivo: 5 apps de una misma categoría
      const target = 5;
      return {
        target,
        variableLabel: randomCat,
        criteria: { action: "ANALYSIS", genre: randomCat },
      };
    },
  },

  // 3. CAZADOR DE ALTO NIVEL
  {
    id: "weekly_headhunter",
    baseXp: 600,
    templateTitle: () => "Headhunter",
    generateCriteria: () => {
      // Encontrar 3 apps buenas (Score > 85)
      return {
        target: 3,
        variableLabel: "85",
        criteria: { action: "ANALYSIS", minScore: 85 },
      };
    },
  },
];
