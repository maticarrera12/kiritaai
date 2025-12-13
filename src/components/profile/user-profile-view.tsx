"use client";

import {
  Calendar01Icon,
  Share01Icon,
  CheckmarkBadge01Icon,
  Settings01Icon,
  LinkSquare01Icon,
} from "hugeicons-react";
import Image from "next/image";
import { toast } from "sonner";

import { CertificateDownload } from "@/app/[locale]/app/_components/certificate-dowload";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { calculateArchetype } from "@/lib/gamification/archetypes";
import { ACHIEVEMENTS_LIST } from "@/lib/gamification/constants";
import { getLevelFromXP } from "@/lib/gamification/levels";

interface UserProfileProps {
  user: any; // El objeto user con userGamification y userAchievements
  isPublic: boolean;
  isOwnProfile: boolean;
}

export function UserProfileView({ user, isPublic, isOwnProfile }: UserProfileProps) {
  // 1. Cálculos de Gamificación
  const xp = user.userGamification?.xp || 0;
  const rank = getLevelFromXP(xp);
  const archetype = calculateArchetype(user.userGamification);

  // Filtrar y ordenar logros desbloqueados
  const unlockedIds = new Set(user.userAchievements.map((ua: any) => ua.achievementId));
  const myAchievements = ACHIEVEMENTS_LIST.filter((a) => unlockedIds.has(a.id)).sort((a, b) => {
    const tiers = { COMMON: 1, RARE: 2, LEGENDARY: 3, MYTHIC: 4 };
    return tiers[b.tier] - tiers[a.tier];
  });

  const isMaxLevel = rank.level >= 10;

  // Acción de Compartir
  const handleShare = () => {
    // Construimos la URL pública manualmente
    const publicUrl = `${window.location.origin}/en/u/${encodeURIComponent(user.name)}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Public profile link copied to clipboard!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* --- HEADER CARD --- */}
      <div className="bg-card rounded-[2rem] p-8 border border-border shadow-sm relative overflow-hidden">
        {/* Banner de Fondo */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/10 to-purple-500/10" />

        {/* Botones de Acción (Top Right) */}
        <div className="absolute top-6 right-6 z-10 flex gap-2">
          {isOwnProfile && !isPublic && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-2 bg-card/50 backdrop-blur-md"
              >
                <Share01Icon size={16} /> Share Public Profile
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/settings">
                  <Settings01Icon size={18} />
                </Link>
              </Button>
            </>
          )}

          {isPublic && (
            <Button
              asChild
              className="bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform"
            >
              <Link href="/signin">
                Join KiritaAI <LinkSquare01Icon size={16} className="ml-2" />
              </Link>
            </Button>
          )}
        </div>

        <div className="relative flex flex-col md:flex-row items-end md:items-center gap-6 mt-16">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full border-4 border-card shadow-xl overflow-hidden bg-muted flex items-center justify-center shrink-0">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={128}
                height={128}
                className="object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-muted-foreground">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Info Principal */}
          <div className="flex-1 mb-2">
            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
              {user.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span
                className={`px-3 py-1 rounded-full text-xs md:text-sm font-bold border ${rank.color}`}
              >
                Lvl {rank.level} • {rank.title}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground text-xs md:text-sm">
                <Calendar01Icon size={14} /> Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Archetype Badge */}
          <div
            className={`px-5 py-4 rounded-2xl border ${archetype.color} bg-opacity-5 backdrop-blur-sm flex items-center gap-4 min-w-[200px]`}
          >
            <div className="p-2 bg-card/20 rounded-xl">
              {/* Nota: Asegúrate de renderizar el icono como componente */}
              {/* <archetype.icon /> no funciona directo si es string en JSON, pero aquí archetype viene del helper TS */}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Playstyle</p>
              <p className="font-bold text-lg leading-none">{archetype.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Analyses Run" value={user.userGamification.totalAnalyses} />
        <StatCard label="Best Find (Score)" value={user.userGamification.highestScoreFound} />
        <StatCard label="Active Streak" value={`${user.userGamification.streakDays} Days`} />
        <StatCard label="Total XP" value={xp.toLocaleString()} />
      </div>

      {/* --- CERTIFICATE (Solo Nivel 10) --- */}
      {isMaxLevel && (
        <CertificateDownload userName={user.name} date={new Date().toLocaleDateString()} />
      )}

      {/* --- TROPHY CASE --- */}
      <div>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <CheckmarkBadge01Icon className="text-primary" />
          Trophy Case ({myAchievements.length})
        </h2>

        {myAchievements.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {myAchievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`p-3 rounded-xl shrink-0 ${getTierColor(achievement.tier)}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground">No achievements yet. Start analyzing!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm text-center hover:border-primary/30 transition-colors">
      <p className="text-3xl font-black text-foreground mb-1">{value}</p>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        {label}
      </p>
    </div>
  );
}

function getTierColor(tier: string) {
  switch (tier) {
    case "MYTHIC":
      return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
    case "LEGENDARY":
      return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
    case "RARE":
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  }
}
