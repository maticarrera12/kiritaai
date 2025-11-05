import { sendEmail } from "./sendEmail";
import ChangeEmailVerification from "@/emails/change-email-verification";

interface ChangeEmailVerificationData {
  user: {
    name: string;
    email: string;
  };
  newEmail: string;
  url: string;
}

export async function sendChangeEmailVerification({
  user,
  newEmail,
  url,
}: ChangeEmailVerificationData) {
  return sendEmail({
    to: newEmail,
    subject: "Verify your new email address 🔐",
    react: ChangeEmailVerification({
      userName: user.name,
      newEmail: newEmail,
      verificationUrl: url,
    }),
  });
}
