import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  File01Icon,
  FolderIcon,
  LanguageCircleIcon,
  MailIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { submitContactInquiryAction } from "@/lib/actions/contact-actions";
import { getPublicProfileData, getPublicSocialsData } from "@/lib/public-queries";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ContactInquiryTypeSelect } from "@/components/public/contact-inquiry-type-select";
import { ContactSubmitButton } from "@/components/public/contact-submit-button";
import { ContactStatusToast } from "@/components/public/contact-status-toast";

export const revalidate = 300;

type ContactPageProps = {
  searchParams?: Promise<{
    status?: string;
    field?: string;
  }>;
};

function normalizePhoneForLinks(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const [profile, socials] = await Promise.all([getPublicProfileData(), getPublicSocialsData()]);
  const resolvedSearchParams = (await searchParams) ?? {};
  const status = resolvedSearchParams.status;
  const field = resolvedSearchParams.field;
  const email = profile?.email?.trim() || "";
  const phone = profile?.phone?.trim() || "";
  const location = profile?.location?.trim() || "";
  const phoneLinkValue = phone ? normalizePhoneForLinks(phone) : "";
  const whatsappPhone = phoneLinkValue.replace("+", "");

  return (
    <main className="container mx-auto flex w-full max-w-[1024px] flex-col gap-10 px-4 py-8 md:px-6">
      <ContactStatusToast status={status} field={field} />
      <header className="space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground">
          <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3.5" strokeWidth={2} />
          Available for new work
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          Tell me what you need built or improved. I'll respond with the best next step.
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
        <aside className="space-y-8 rounded-2xl border bg-card p-6">
          <div className="space-y-3">
            <h2 className="inline-flex items-center gap-2 text-lg font-semibold">
              <HugeiconsIcon icon={UserIcon} className="size-4" strokeWidth={2} />
              Contact
            </h2>
            <p className="text-sm text-muted-foreground">Share your inquiry. I reply with practical next steps.</p>
          </div>

          <dl className="space-y-5 text-sm">
            <div className="space-y-1.5">
              <dt className="inline-flex items-center gap-2 text-muted-foreground">
                <HugeiconsIcon icon={MailIcon} className="size-4" strokeWidth={2} />
                Email
              </dt>
              <dd className="font-medium">
                {email ? (
                  <a href={`mailto:${email}`} className="underline-offset-4 hover:underline">
                    {email}
                  </a>
                ) : (
                  "Not configured"
                )}
              </dd>
            </div>
            <div className="space-y-1.5">
              <dt className="inline-flex items-center gap-2 text-muted-foreground">
                <HugeiconsIcon icon={File01Icon} className="size-4" strokeWidth={2} />
                Phone
              </dt>
              <dd className="space-y-1">
                <p className="font-medium">{phone || "Not configured"}</p>
                {phoneLinkValue ? (
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <a href={`tel:${phoneLinkValue}`} className="underline-offset-4 hover:underline">
                      Call
                    </a>
                    <a
                      href={`https://wa.me/${whatsappPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline-offset-4 hover:underline"
                    >
                      WhatsApp
                    </a>
                    <a href={`sms:${phoneLinkValue}`} className="underline-offset-4 hover:underline">
                      SMS
                    </a>
                  </div>
                ) : null}
              </dd>
            </div>
            <div className="space-y-1.5">
              <dt className="inline-flex items-center gap-2 text-muted-foreground">
                <HugeiconsIcon icon={FolderIcon} className="size-4" strokeWidth={2} />
                Location
              </dt>
              <dd className="font-medium">
                {location ? (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(location)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline-offset-4 hover:underline"
                  >
                    {location}
                  </a>
                ) : (
                  "Not configured"
                )}
              </dd>
            </div>
          </dl>

          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 text-sm font-medium">
              <HugeiconsIcon icon={LanguageCircleIcon} className="size-4" strokeWidth={2} />
              Socials
            </p>
            {socials.length === 0 ? (
              <p className="text-sm text-muted-foreground">No social links available.</p>
            ) : (
              <ul className="space-y-3">
                {socials.map((social) => (
                  <li key={social.id}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      {social.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <section className="rounded-2xl border bg-card p-6">
          <div className="mb-8 space-y-2">
            <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
              <HugeiconsIcon icon={MailIcon} className="size-5" strokeWidth={2} />
              Start inquiry
            </h2>
            <p className="text-sm text-muted-foreground">Brief details are enough to begin.</p>
          </div>

          <form action={submitContactInquiryAction} className="space-y-6">
            <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" required placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input id="email" name="email" type="email" required placeholder="jane@company.com" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Company (optional)</Label>
                <Input id="company" name="company" placeholder="Company name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (optional)</Label>
                <Input id="budget" name="budget" placeholder="e.g. $2k-$5k, hourly, TBD" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inquiryType">Inquiry type</Label>
              <ContactInquiryTypeSelect name="inquiryType" defaultValue="project" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Project or inquiry details</Label>
              <Textarea
                id="message"
                name="message"
                required
                rows={8}
                placeholder="Describe what you need, your stack, timeline, and the outcome you want."
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">I usually reply within 24-48 hours.</p>
              <ContactSubmitButton />
            </div>
          </form>
        </section>
      </section>

      <footer className="pb-2 text-xs text-muted-foreground">
        Prefer direct email?{" "}
        {profile?.email ? (
          <Link href={`mailto:${profile.email}`} className="underline-offset-4 hover:underline">
            {profile.email}
          </Link>
        ) : (
          <span>Email not configured.</span>
        )}
      </footer>
    </main>
  );
}
