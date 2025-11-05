import { sendEmail } from "./sendEmail";
import DeleteAccountVerification from "@/emails/delete-account-verification";

interface DeleteAccountVerificationData {
  user: {
    name: string;
    email: string;
  };
  url: string;
}

export async function sendDeleteAccountVerification({
  user,
  url,
}: DeleteAccountVerificationData) {
  return sendEmail({
    to: user.email,
    subject: "Confirm your account deletion ⚠️",
    react: DeleteAccountVerification({
      userName: user.name,
      verificationUrl: url,
    }),
  });
}
