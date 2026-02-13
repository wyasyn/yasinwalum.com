import { env } from "@/lib/env";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function getAppName() {
  return env.APP_NAME || "Portfolio CMS";
}

export async function sendEmail(input: SendEmailInput) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    console.warn(
      `[email-disabled] To=${input.to} Subject="${input.subject}"\n${input.text}`,
    );
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to send email: ${response.status} ${message}`);
  }
}

export function buildVerificationEmail(url: string) {
  const appName = getAppName();

  return {
    subject: `Verify your email for ${appName}`,
    text: `Verify your email to continue.\n\nOpen this link:\n${url}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
        <h2 style="margin:0 0 12px">Verify your email</h2>
        <p style="margin:0 0 12px">Use the button below to verify your email and continue.</p>
        <p style="margin:20px 0">
          <a href="${url}" style="background:#111;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Verify Email</a>
        </p>
        <p style="margin:0;font-size:12px;color:#666">If the button does not work, open this URL:</p>
        <p style="margin:4px 0 0;font-size:12px;word-break:break-all;color:#666">${url}</p>
      </div>
    `,
  };
}

export function buildResetPasswordEmail(url: string) {
  const appName = getAppName();

  return {
    subject: `Reset your password for ${appName}`,
    text: `You requested a password reset.\n\nOpen this link:\n${url}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
        <h2 style="margin:0 0 12px">Reset your password</h2>
        <p style="margin:0 0 12px">You requested a password reset. Use the button below to continue.</p>
        <p style="margin:20px 0">
          <a href="${url}" style="background:#111;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Reset Password</a>
        </p>
        <p style="margin:0;font-size:12px;color:#666">If the button does not work, open this URL:</p>
        <p style="margin:4px 0 0;font-size:12px;word-break:break-all;color:#666">${url}</p>
      </div>
    `,
  };
}
