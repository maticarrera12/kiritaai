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

interface ChangeEmailVerificationProps {
  userName?: string;
  newEmail?: string;
  verificationUrl?: string;
}

export const ChangeEmailVerification = ({
  userName = "there",
  newEmail = "new@example.com",
  verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email`,
}: ChangeEmailVerificationProps) => {
  const currentYear = new Date().getFullYear();
  return (
    <Html>
      <Head />
      <Preview>Verify your new email address</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Heading style={logoText}>🔐 Your Brand</Heading>
          </Section>
          <Section style={content}>
            <Heading style={heading}>Verify Your New Email</Heading>
            <Text style={paragraph}>Hi {userName},</Text>
            <Text style={paragraph}>
              You recently requested to change your email address to{" "}
              <strong>{newEmail}</strong>.
            </Text>
            <Text style={paragraph}>
              To complete this change, please verify your new email address by
              clicking the button below:
            </Text>
            <Section style={buttonContainer}>
              <Button style={button} href={verificationUrl}>
                Verify New Email
              </Button>
            </Section>
            <Text style={paragraph}>
              If the button doesn&apos;t work, copy and paste this link into
              your browser:
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
              If you didn&apos;t request this email change, please ignore this
              message and your email address will remain unchanged.
            </Text>
          </Section>
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

export default ChangeEmailVerification;

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
  borderRadius: "8px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
  maxWidth: "600px",
};

const logoSection = {
  padding: "32px 40px 20px",
  textAlign: "center" as const,
};

const logoText = {
  margin: "0",
  fontSize: "28px",
  fontWeight: "700",
  color: "#1a1a1a",
};

const content = {
  padding: "0 40px 40px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#1a1a1a",
  marginBottom: "24px",
  marginTop: "0",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#484848",
  marginBottom: "16px",
  marginTop: "0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#6366f1",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const link = {
  fontSize: "14px",
  color: "#6366f1",
  marginTop: "12px",
  marginBottom: "24px",
  wordBreak: "break-all" as const,
};

const anchor = {
  color: "#6366f1",
  textDecoration: "underline",
};

const warningBox = {
  backgroundColor: "#fef3c7",
  borderRadius: "6px",
  padding: "16px",
  margin: "24px 0",
};

const warningText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#92400e",
  margin: "0",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 0",
};

const footer = {
  padding: "0 40px",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "12px",
  color: "#8898aa",
  lineHeight: "18px",
  margin: "4px 0",
};
