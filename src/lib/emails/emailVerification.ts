import { sendEmail } from "./sendEmail";
import WelcomeEmail from "@/emails/welcome-email";

interface EmailVerificationData {
  user: {
    name: string;
    email: string;
  };
  url: string;
}

export async function sendEmailVerificationEmail({
  user,
  url,
}: EmailVerificationData) {
  return sendEmail({
    to: user.email,
    subject: "Welcome! Verify your email address 🎉",
    react: WelcomeEmail({
      userName: user.name,
      verificationUrl: url,
    }),
  });
}
