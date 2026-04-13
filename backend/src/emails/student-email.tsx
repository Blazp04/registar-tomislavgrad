import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface StudentEmailProps {
  firstName: string;
  lastName: string;
  messageBody: string;
  subject: string;
}

const PRIMARY_COLOR = "#c0392b";
const DARK_BG = "#2c3e50";

export function StudentEmail({ firstName, lastName, messageBody, subject }: StudentEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Grb_Tomislavgrada.svg/1200px-Grb_Tomislavgrada.svg.png"
              width="60"
              height="60"
              alt="Grb Tomislavgrad"
              style={logo}
            />
            <Heading style={headerTitle}>Općina Tomislavgrad</Heading>
            <Text style={headerSubtitle}>Registar studenata</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading as="h2" style={greeting}>
              Poštovani/a {firstName} {lastName},
            </Heading>

            <Text style={messageText}>{messageBody}</Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerTitle}>Općina Tomislavgrad</Text>
            <Text style={footerSubtitle}>
              Hercegbosanska županija · Federacija Bosne i Hercegovine
            </Text>
            <Text style={footerCopy}>
              © {new Date().getFullYear()} Općina Tomislavgrad. Sva prava pridržana.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// --- Styles ---
const main: React.CSSProperties = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container: React.CSSProperties = {
  margin: "0 auto",
  maxWidth: "600px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden",
  marginTop: "40px",
  marginBottom: "40px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
};

const header: React.CSSProperties = {
  backgroundColor: PRIMARY_COLOR,
  padding: "32px 40px",
  textAlign: "center" as const,
};

const logo: React.CSSProperties = {
  margin: "0 auto 12px",
  borderRadius: "8px",
};

const headerTitle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0",
  lineHeight: "1.3",
};

const headerSubtitle: React.CSSProperties = {
  color: "rgba(255, 255, 255, 0.85)",
  fontSize: "14px",
  margin: "6px 0 0",
};

const content: React.CSSProperties = {
  padding: "36px 40px 24px",
};

const greeting: React.CSSProperties = {
  color: "#1a1a1a",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 20px",
  lineHeight: "1.4",
};

const messageText: React.CSSProperties = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const divider: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "0 40px",
};

const footer: React.CSSProperties = {
  backgroundColor: DARK_BG,
  padding: "24px 40px",
  textAlign: "center" as const,
};

const footerTitle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
};

const footerSubtitle: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "12px",
  margin: "4px 0 0",
};

const footerCopy: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "11px",
  margin: "12px 0 0",
};
