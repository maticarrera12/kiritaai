import { sendEmail } from "./sendEmail";
import PasswordResetEmail from "@/emails/password-reset-email";

export function sendPasswordResetEmail({
  user,
  url,
}: {
  user: { email: string; name: string };
  url: string;
}) {
  return sendEmail({
    to: user.email,
    subject: "Reset your password 🔐",
    react: PasswordResetEmail({
      userName: user.name,
      resetUrl: url,
    }),
  });
}
