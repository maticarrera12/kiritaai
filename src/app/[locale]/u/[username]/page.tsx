import { Metadata } from "next";
import { notFound } from "next/navigation";

import { UserProfileView } from "@/components/profile/user-profile-view";
import { getLevelFromXP } from "@/lib/gamification/levels";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ username: string }>;
}

// 1. SEO Dinámico (Importante para LinkedIn/Twitter cards)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const decodedName = decodeURIComponent(username);

  const user = await prisma.user.findUnique({
    where: { name: decodedName },
    include: { userGamification: true },
  });

  if (!user) return { title: "User not found - KiritaAI" };

  const xp = user.userGamification?.xp || 0;
  const rank = getLevelFromXP(xp);

  return {
    title: `${user.name} (${rank.title}) | KiritaAI Profile`,
    description: `Check out ${user.name}'s market analysis portfolio. Level ${rank.level} Analyst with ${user.userGamification?.totalAnalyses} apps analyzed.`,
    openGraph: {
      images: [user.image || "/og-default.png"], // Muestra su avatar si tiene
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const decodedName = decodeURIComponent(username);

  // Buscar usuario por 'name' (@unique)
  const user = await prisma.user.findUnique({
    where: { name: decodedName },
    include: {
      userGamification: true,
      userAchievements: true,
    },
  });

  if (!user) notFound();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar Minimalista (Solo para la vista pública) */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-black text-xl tracking-tight">KiritaAI</span>
          {/* Aquí podrías poner un botón de "Sign In" pequeño */}
        </div>
      </nav>

      <main className="py-12 px-4">
        <UserProfileView user={user} isPublic={true} isOwnProfile={false} />
      </main>
    </div>
  );
}
