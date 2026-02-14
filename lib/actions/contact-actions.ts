"use server";

import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { buildContactInquiryEmailTemplate } from "@/lib/email-templates/contact-inquiry-email";
import { contactInquirySchema } from "@/lib/validators/contact";

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getOptionalText(formData: FormData, key: string) {
  const value = getText(formData, key).trim();
  return value.length > 0 ? value : undefined;
}

const inquiryTypeLabelMap = {
  project: "Project build",
  consulting: "Consulting",
  collaboration: "Collaboration",
  other: "Other inquiry",
} as const;

export async function submitContactInquiryAction(formData: FormData) {
  const parsed = contactInquirySchema.safeParse({
    name: getText(formData, "name"),
    email: getText(formData, "email"),
    company: getOptionalText(formData, "company"),
    inquiryType: getText(formData, "inquiryType"),
    budget: getOptionalText(formData, "budget"),
    message: getText(formData, "message"),
    website: getOptionalText(formData, "website"),
  });

  if (!parsed.success) {
    const firstField = parsed.error.issues[0]?.path[0];
    const fieldParam = typeof firstField === "string" ? `&field=${encodeURIComponent(firstField)}` : "";
    redirect(`/contact?status=invalid${fieldParam}`);
  }

  const payload = parsed.data;

  if (payload.website) {
    redirect("/contact?status=sent");
  }

  const inquiryLabel = inquiryTypeLabelMap[payload.inquiryType];
  const companyText = payload.company || "Not provided";
  const budgetText = payload.budget || "Not provided";

  const subject = `New inquiry: ${inquiryLabel} from ${payload.name}`;
  const { html, text } = await buildContactInquiryEmailTemplate({
    name: payload.name,
    email: payload.email,
    company: companyText,
    inquiryType: inquiryLabel,
    budget: budgetText,
    message: payload.message,
  });

  try {
    await sendEmail({
      to: env.ADMIN_EMAIL,
      subject,
      html,
      text,
    });
  } catch {
    redirect("/contact?status=error");
  }

  redirect("/contact?status=sent");
}
