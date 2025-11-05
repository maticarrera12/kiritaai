import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { nextCookies } from "better-auth/next-js";
import { sendPasswordResetEmail } from "./emails/sendPasswordResetEmail";
import { sendEmailVerificationEmail } from "./emails/emailVerification";
import { sendChangeEmailVerification } from "./emails/sendChangeEmailVerification";
import { sendDeleteAccountVerification } from "./emails/sendDeleteAccountVerification";
const prisma = new PrismaClient();

async function assignAdminRole(userId: string, email: string) {
  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ||
    [];
  const isAdmin = adminEmails.includes(email.toLowerCase());

  if (isAdmin) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { role: "ADMIN" },
      });
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  }
}

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, url, newEmail }) => {
        await sendChangeEmailVerification({
          user,
          newEmail,
          url,
        });
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        await sendDeleteAccountVerification({
          user,
          url,
        });
      },
    },
    additionalFields: {
      credits: {
        type: "number",
        required: false,
      },
      plan: {
        type: "string",
        required: false,
      },
    },
  },
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({ user, url });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    callbackURL: "/verify-email-success",
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmailVerificationEmail({ user, url });
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  plugins: [nextCookies()],
});

// Exportar prisma y helper para uso manual
export { prisma, assignAdminRole };
