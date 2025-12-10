"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { GamificationEngine } from "@/lib/gamification/engine";

export async function trackInteraction(
  action: "VIEW_SCREENSHOTS" | "CHAT_SENT" | "DOWNLOAD_SCREENSHOT"
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return;

  if (action === "CHAT_SENT") {
    GamificationEngine.processEvent({
      userId: session.user.id,
      type: "CHAT_MESSAGE_SENT",
    }).catch(console.error);
  }

  if (action === "VIEW_SCREENSHOTS") {
    GamificationEngine.processEvent({
      userId: session.user.id,
      type: "INTERACTION",
      data: { action: "VIEW_SCREENSHOTS" },
    }).catch(console.error);
  }

  if (action === "DOWNLOAD_SCREENSHOT") {
    GamificationEngine.processEvent({
      userId: session.user.id,
      type: "INTERACTION",
      data: { action: "DOWNLOAD_SCREENSHOT" },
    }).catch(console.error);
  }
}
