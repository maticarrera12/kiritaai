import {
  Target02Icon,
  Message01Icon,
  GameController03Icon,
  ZapIcon,
  FishFoodIcon,
  UserIcon,
} from "hugeicons-react";

export type Archetype = {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
};

const ARCHETYPES: Record<string, Archetype> = {
  NOVICE: {
    id: "novice",
    title: "The Novice",
    description: "Just starting the journey.",
    icon: UserIcon,
    color: "text-slate-500 bg-slate-100",
  },
  SNIPER: {
    id: "sniper",
    title: "The Sniper",
    description: "High efficiency. Only analyzes promising apps.",
    icon: Target02Icon,
    color: "text-emerald-600 bg-emerald-100",
  },
  GRINDER: {
    id: "grinder",
    title: "The Grinder",
    description: "Volume over everything. Analyzing machine.",
    icon: ZapIcon,
    color: "text-orange-500 bg-orange-100",
  },
  CHATTY: {
    id: "chatty",
    title: "The Chatty",
    description: "Loves debating strategy with AI.",
    icon: Message01Icon,
    color: "text-blue-500 bg-blue-100",
  },
  GAMER: {
    id: "gamer",
    title: "The Gamer",
    description: "Specialized in the Gaming market.",
    icon: GameController03Icon,
    color: "text-purple-500 bg-purple-100",
  },
  SHARK: {
    id: "shark",
    title: "The Shark",
    description: "Hunts big prey: Giants with low ratings.",
    icon: FishFoodIcon,
    color: "text-red-600 bg-red-100",
  },
};

// Lógica para determinar el arquetipo
export function calculateArchetype(gamification: any): Archetype {
  if (!gamification || gamification.totalAnalyses < 5) return ARCHETYPES.NOVICE;

  const stats = (gamification.stats as any) || {};
  const total = gamification.totalAnalyses;

  // 1. THE CHATTY: Más mensajes que análisis x 2
  const chatMsgs = stats.chat_msgs || 0;
  if (chatMsgs > total * 3) return ARCHETYPES.CHATTY;

  // 2. THE GAMER: Más del 50% son juegos
  const games = stats.cat_game || 0;
  if (games > total * 0.5) return ARCHETYPES.GAMER;

  // 3. THE SNIPER: Alta tasa de "High Scores" (>80) en relación al total
  const highScores = stats.score_80_plus || 0;
  if (total > 10 && highScores / total > 0.4) return ARCHETYPES.SNIPER;

  // 4. THE SHARK: Ha encontrado "Giant Slayers" (logro técnico)
  // Como no tenemos el contador exacto, asumimos si tiene XP alta pero pocos análisis
  // O idealmente, agregar un contador "giant_slayer_count" en engine.ts
  // Por ahora, usaremos una lógica simple: si tiene el logro desbloqueado (necesitaríamos pasar logros aquí)
  // O podemos basarnos en si analiza Finanzas/Business que suelen ser Shark
  const finance = stats.cat_finance || 0;
  if (finance > total * 0.4) return ARCHETYPES.SHARK;

  // 5. THE GRINDER: Si analiza muchísimo (Default para heavy users)
  if (total > 50) return ARCHETYPES.GRINDER;

  return ARCHETYPES.NOVICE;
}
