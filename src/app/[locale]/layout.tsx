import "../globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { headers } from "next/headers";
import { Toaster } from "sonner";

import { AppProviders } from "../../../app-providers";
import { AchievementListener } from "@/components/gamification/achievement-listener";
import { auth } from "@/lib/auth";
import { loadMessages } from "@/lib/load-messages";
import MessagesProvider from "@/providers/message-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ⭐ Instrument Serif (para títulos)
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"], // Solo existe 400
  style: ["normal", "italic"],
});

export default async function LocaleLayout({ children, params }: any) {
  const { locale } = await params;
  const messages = await loadMessages(locale);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <html lang={locale}>
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          ${instrumentSerif.variable}
          antialiased
        `}
      >
        <MessagesProvider locale={locale} messages={messages}>
          <AppProviders>
            {children}
            <Toaster position="top-right" richColors />
            {session?.user?.id && <AchievementListener userId={session.user.id} />}
            <Analytics />
            <SpeedInsights />
          </AppProviders>
        </MessagesProvider>
      </body>
    </html>
  );
}
