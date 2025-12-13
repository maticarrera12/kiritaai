import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { UserProfileView } from "@/components/profile/user-profile-view";
import { redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ username: string; locale: string }>;
}

export default async function InternalProfilePage({ params }: Props) {
  const { username, locale } = await params;
  const decodedName = decodeURIComponent(username);
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session?.user) {
    const publicPath = `/u/${username}`;
    redirect({ href: publicPath, locale: locale as "en" | "es" });
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { name: decodedName },
    include: {
      userGamification: true,
      userAchievements: true,
    },
  });

  if (!user) {
    notFound();
  }

  if (!user.userGamification) {
    await prisma.userGamification.create({
      data: {
        userId: user.id,
        xp: 0,
        level: 1,
        totalAnalyses: 0,
        highestScoreFound: 0,
        streakDays: 0,
      },
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        userGamification: true,
        userAchievements: true,
      },
    });

    if (!updatedUser || !updatedUser.userGamification) {
      notFound();
    }

    const isOwnProfile = session?.user?.id === updatedUser.id;

    return (
      <div className="pb-12">
        <UserProfileView user={updatedUser} isPublic={false} isOwnProfile={isOwnProfile} />
      </div>
    );
  }

  const isOwnProfile = session?.user?.id === user.id;

  return (
    <div className="pb-12">
      <UserProfileView user={user} isPublic={false} isOwnProfile={isOwnProfile} />
    </div>
  );
}
