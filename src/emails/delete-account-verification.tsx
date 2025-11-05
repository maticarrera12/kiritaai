import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface DeleteAccountVerificationProps {
  userName?: string;
  verificationUrl?: string;
}

export const DeleteAccountVerification = ({
  userName = "there",
  verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/delete-account`,
}: DeleteAccountVerificationProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Preview>Confirm your account deletion</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo/Brand Section */}
          <Section style={logoSection}>
            <Heading style={logoText}>⚠️ Your Brand</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={heading}>Account Deletion Request</Heading>

            <Text style={paragraph}>Hi {userName},</Text>

            <Text style={paragraph}>
              We received a request to permanently delete your account. This
              action is irreversible and will result in the permanent deletion
              of all your data.
            </Text>

            <Section style={dangerBox}>
              <Text style={dangerText}>
                ⚠️ <strong>Warning:</strong> Once you confirm, you will lose
                access to:
              </Text>
              <Text style={dangerListItem}>• Your account and profile</Text>
              <Text style={dangerListItem}>• All your saved data</Text>
              <Text style={dangerListItem}>
                • Your subscription and credits
              </Text>
              <Text style={dangerListItem}>• Your purchase history</Text>
            </Section>

            <Text style={paragraph}>
              If you&apos;re sure you want to proceed, click the button below to
              confirm the deletion:
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={verificationUrl}>
                Confirm Account Deletion
              </Button>
            </Section>

            <Text style={paragraph}>
              Or copy and paste this URL into your browser:
            </Text>

            <Text style={link}>
              <Link href={verificationUrl} style={anchor}>
                {verificationUrl}
              </Link>
            </Text>

            <Section style={warningBox}>
              <Text style={warningText}>
                ⏰ For security reasons, this link will expire in{" "}
                <strong>1 hour</strong>.
              </Text>
            </Section>

            <Hr style={hr} />

            <Text style={paragraph}>
              If you didn&apos;t request this account deletion, please{" "}
              <strong>ignore this email</strong> and your account will remain
              active and secure. We also recommend changing your password as a
              precaution.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {currentYear} Your Brand. All rights reserved.
            </Text>
            <Text style={footerText}>
              This is an automated message, please do not reply.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default DeleteAccountVerification;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  marginTop: "40px",
  marginBottom: "40px",
  padding: "20px 0",
  borderRadius: "16px",
  maxWidth: "600px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
};

const logoSection = {
  padding: "32px 40px",
  textAlign: "center" as const,
  borderBottom: "1px solid #f0f0f0",
};

const logoText = {
  margin: "0",
  fontSize: "28px",
  fontWeight: "700",
  color: "#dc2626",
  textAlign: "center" as const,
};

const content = {
  padding: "40px 40px 32px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#1f2937",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#374151",
  margin: "0 0 16px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#dc2626",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
  cursor: "pointer",
};

const link = {
  fontSize: "14px",
  color: "#dc2626",
  textDecoration: "none",
  wordBreak: "break-all" as const,
  margin: "0 0 24px",
  display: "block",
};

const anchor = {
  color: "#dc2626",
  textDecoration: "underline",
};

const dangerBox = {
  backgroundColor: "#fee2e2",
  border: "2px solid #dc2626",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const dangerText = {
  fontSize: "15px",
  lineHeight: "22px",
  color: "#991b1b",
  margin: "0 0 12px",
  fontWeight: "600",
};

const dangerListItem = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#991b1b",
  margin: "4px 0",
  paddingLeft: "8px",
};

const warningBox = {
  backgroundColor: "#fef3c7",
  border: "1px solid #fbbf24",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
};

const warningText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#92400e",
  margin: "0",
  textAlign: "center" as const,
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
};

const footer = {
  padding: "0 40px 32px",
};

const footerText = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#6b7280",
  textAlign: "center" as const,
  margin: "4px 0",
};
