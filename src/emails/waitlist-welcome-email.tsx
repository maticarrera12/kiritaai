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

interface WaitlistWelcomeEmailProps {
  userName?: string;
  referralCode?: string;
  referralUrl?: string;
  position?: number;
}

export const WaitlistWelcomeEmail = ({
  userName = "there",
  referralCode = "ABC12345",
  referralUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/waitlist?ref=ABC12345`,
  position = 150,
}: WaitlistWelcomeEmailProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Preview>Welcome to the waitlist! Share your referral link</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo/Brand Section */}
          <Section style={logoSection}>
            <Heading style={logoText}>🚀 Your Brand</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={heading}>You&apos;re on the list! 🎉</Heading>

            <Text style={paragraph}>Hi {userName},</Text>

            <Text style={paragraph}>
              Thank you for joining our waitlist! We&apos;re excited to have you
              as one of our early supporters.
            </Text>

            {/* Position Badge */}
            <Section style={positionBadge}>
              <Text style={positionText}>
                You&apos;re <strong>#{position}</strong> in line
              </Text>
            </Section>

            <Text style={paragraph}>
              Want to skip ahead? Share your unique referral link with friends!
              For every person who joins using your link, you&apos;ll both move
              up in the queue.
            </Text>

            {/* Referral Code Box */}
            <Section style={referralBox}>
              <Text style={referralLabel}>Your Referral Code:</Text>
              <Text style={referralCodeStyle}>{referralCode}</Text>
            </Section>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={referralUrl}>
                Share Your Link
              </Button>
            </Section>

            <Text style={paragraph}>Or copy and share this URL:</Text>

            <Text style={link}>
              <Link href={referralUrl} style={anchor}>
                {referralUrl}
              </Link>
            </Text>

            <Hr style={hr} />

            <Text style={paragraph}>
              We&apos;ll notify you as soon as we&apos;re ready to launch. In
              the meantime, follow us on social media for updates and sneak
              peeks!
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {currentYear} Your Brand. All rights reserved.
            </Text>
            <Text style={footerText}>
              You received this email because you joined our waitlist.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WaitlistWelcomeEmail;

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

const positionBadge = {
  backgroundColor: "#fef3c7",
  border: "2px solid #fbbf24",
  borderRadius: "12px",
  padding: "20px",
  margin: "32px 0",
  textAlign: "center" as const,
};

const positionText = {
  fontSize: "18px",
  lineHeight: "24px",
  color: "#92400e",
  margin: "0",
  textAlign: "center" as const,
  fontWeight: "600",
};

const referralBox = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const referralLabel = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0 0 8px",
  textAlign: "center" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const referralCodeStyle = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#6366f1",
  margin: "0",
  textAlign: "center" as const,
  fontFamily: "monospace",
  letterSpacing: "2px",
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
