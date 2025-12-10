// lib/gamification/levels.ts

// lib/gamification/levels.ts

export type RankTier = {
  level: number;
  minXp: number;
  title: string;
  icon: string;
  color: string;
};

export const LEVELS: RankTier[] = [
  // --- EARLY GAME (Enganche rápido) ---
  {
    level: 1,
    minXp: 0,
    title: "Intern Analyst",
    icon: "BookOpen01Icon",
    color: "text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
  },
  {
    level: 2,
    minXp: 500, // Se consigue con los primeros logros + unos pocos análisis
    title: "Junior Scout",
    icon: "Search01Icon",
    color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300",
  },
  {
    level: 3,
    minXp: 1500,
    title: "Market Researcher",
    icon: "Analytics01Icon",
    color: "text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300",
  },

  // --- MID GAME (Consolidación) ---
  {
    level: 4,
    minXp: 3500,
    title: "Product Strategist",
    icon: "BulbIcon",
    color: "text-purple-500 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300",
  },
  {
    level: 5,
    minXp: 6500, // Aquí llegan si completan la mayoría de logros
    title: "Opportunity Hunter",
    icon: "Target02Icon",
    color: "text-orange-500 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300",
  },

  // --- LATE GAME (Expertos) ---
  {
    level: 6,
    minXp: 10000,
    title: "Unicorn Finder",
    icon: "Diamond01Icon",
    color: "text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300",
  },
  {
    level: 7,
    minXp: 14000,
    title: "Market Oracle",
    icon: "CrystalBall01Icon",
    color: "text-fuchsia-600 bg-fuchsia-100 dark:bg-fuchsia-900/30 dark:text-fuchsia-300",
  },

  // --- END GAME (Prestigio) ---
  {
    level: 8,
    minXp: 18000,
    title: "Venture Capitalist",
    icon: "Briefcase01Icon",
    color:
      "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200",
  },
  {
    level: 9,
    minXp: 22000,
    title: "Market Tycoon",
    icon: "Building03Icon",
    color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200",
  },
  {
    level: 10,
    minXp: 25000, // Tope alcanzable en unos meses
    title: "Industry Titan",
    icon: "CrownIcon",
    color:
      "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 shadow-sm",
  },
];

// ... (helpers getLevelFromXP, etc. igual que antes)

// --- HELPER FUNCTIONS ---

export function getLevelFromXP(xp: number): RankTier {
  // Busca el nivel más alto que el usuario ha superado
  // [...LEVELS] crea una copia para no mutar, reverse() para buscar de mayor a menor
  const match = [...LEVELS].reverse().find((lvl) => xp >= lvl.minXp);
  return match || LEVELS[0];
}

export function getNextLevel(currentLevel: number): RankTier | null {
  return LEVELS.find((l) => l.level === currentLevel + 1) || null;
}

export function getLevelProgress(xp: number) {
  const current = getLevelFromXP(xp);
  const next = getNextLevel(current.level);

  if (!next) return 100; // Nivel máximo alcanzado

  const xpNeeded = next.minXp - current.minXp;
  const xpEarnedInLevel = xp - current.minXp;

  return Math.min(Math.round((xpEarnedInLevel / xpNeeded) * 100), 100);
}
