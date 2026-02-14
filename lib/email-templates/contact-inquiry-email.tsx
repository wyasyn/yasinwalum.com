import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";

type ContactInquiryEmailProps = {
  name: string;
  email: string;
  company: string;
  inquiryType: string;
  budget: string;
  message: string;
};

function ContactInquiryEmail({
  name,
  email,
  company,
  inquiryType,
  budget,
  message,
}: ContactInquiryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New inquiry from {name}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading as="h2" style={styles.heading}>
            New contact inquiry
          </Heading>

          <Section>
            <Text style={styles.item}>
              <strong>Name:</strong> {name}
            </Text>
            <Text style={styles.item}>
              <strong>Email:</strong> {email}
            </Text>
            <Text style={styles.item}>
              <strong>Company:</strong> {company}
            </Text>
            <Text style={styles.item}>
              <strong>Inquiry Type:</strong> {inquiryType}
            </Text>
            <Text style={styles.item}>
              <strong>Budget:</strong> {budget}
            </Text>
          </Section>

          <Hr style={styles.hr} />

          <Text style={styles.label}>Message</Text>
          <Text style={styles.message}>{message}</Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f4f4f5",
    fontFamily: "Arial, sans-serif",
    color: "#111827",
    padding: "24px 0",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "24px",
    maxWidth: "620px",
  },
  heading: {
    margin: "0 0 16px",
    fontSize: "20px",
    lineHeight: "28px",
  },
  item: {
    margin: "0 0 8px",
    fontSize: "14px",
    lineHeight: "22px",
  },
  hr: {
    borderColor: "#e5e7eb",
    margin: "18px 0",
  },
  label: {
    margin: "0 0 8px",
    fontWeight: "bold",
    fontSize: "14px",
  },
  message: {
    margin: "0",
    whiteSpace: "pre-wrap" as const,
    fontSize: "14px",
    lineHeight: "22px",
  },
};

export async function buildContactInquiryEmailTemplate(input: ContactInquiryEmailProps) {
  const html = await render(<ContactInquiryEmail {...input} />);
  const text = await render(<ContactInquiryEmail {...input} />, { plainText: true });
  return { html, text };
}
