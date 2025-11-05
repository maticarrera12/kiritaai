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

interface WelcomeEmailProps {
  userName?: string;
  verificationUrl?: string;
}

export const WelcomeEmail = ({
  userName = "there",
  verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email`,
}: WelcomeEmailProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Preview>Welcome! Please verify your email address</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo/Brand Section */}
          <Section style={logoSection}>
            <Heading style={logoText}>✨ Your Brand</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={heading}>Welcome aboard! 🎉</Heading>

            <Text style={paragraph}>Hi {userName},</Text>

            <Text style={paragraph}>
              Thank you for joining us! We&apos;re excited to have you on board.
              To get started, please verify your email address by clicking the
              button below:
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={verificationUrl}>
                Verify Email Address
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

            <Hr style={hr} />

            <Text style={paragraph}>
              If you didn&apos;t create an account, you can safely ignore this
              email.
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

export default WelcomeEmail;

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
  color: "#6366f1",
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
  backgroundColor: "#6366f1",
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
  color: "#6366f1",
  textDecoration: "none",
  wordBreak: "break-all" as const,
  margin: "0 0 24px",
  display: "block",
};

const anchor = {
  color: "#6366f1",
  textDecoration: "underline",
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
