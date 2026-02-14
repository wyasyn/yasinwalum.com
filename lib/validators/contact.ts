import { z } from "zod";

const nonEmpty = z.string().trim().min(1);
const optionalText = z.preprocess(
  (value) => (typeof value === "string" ? (value.trim().length > 0 ? value.trim() : undefined) : undefined),
  z.string().max(120).optional(),
);
const optionalWebsite = z.preprocess(
  (value) => (typeof value === "string" ? (value.trim().length > 0 ? value.trim() : undefined) : undefined),
  z.string().max(200).optional(),
);

export const contactInquirySchema = z.object({
  name: nonEmpty.min(2),
  email: z.string().trim().email(),
  company: optionalText,
  inquiryType: z.enum(["project", "consulting", "collaboration", "other"]),
  budget: optionalText,
  message: nonEmpty.min(10).max(4000),
  website: optionalWebsite,
});

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;
