import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || "Ganyu Hub <onboarding@resend.dev>";
const replyTo = process.env.EMAIL_REPLY_TO;
const appUrl = process.env.APP_URL || "http://localhost:3000";

const client = apiKey ? new Resend(apiKey) : null;

type SendArgs = {
  to: string;
  subject: string;
  heading: string;
  body: string;
  ctaText?: string;
  ctaPath?: string;
};

function render({ heading, body, ctaText, ctaPath }: Omit<SendArgs, "to" | "subject">) {
  const ctaHtml =
    ctaText && ctaPath
      ? `<p style="margin:24px 0"><a href="${appUrl}${ctaPath}" style="background:#0f172a;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block">${ctaText}</a></p>`
      : "";
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
  <h2 style="margin:0 0 12px;font-size:20px">${heading}</h2>
  <p style="margin:0 0 12px;line-height:1.5;color:#334155">${body}</p>
  ${ctaHtml}
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
  <p style="font-size:12px;color:#64748b;margin:0">Ganyu Hub &middot; Malawian creative-services marketplace</p>
</div>`;
}

export async function sendEmail(args: SendArgs): Promise<void> {
  if (!client) {
    console.warn("[email] RESEND_API_KEY not set — skipping send to", args.to);
    return;
  }
  console.log("[email] sending", { to: args.to, from, subject: args.subject });
  try {
    const res = await client.emails.send({
      from,
      to: args.to,
      subject: args.subject,
      html: render(args),
      replyTo,
    });
    if (res.error) {
      console.error("[email] Resend rejected:", res.error);
    } else {
      console.log("[email] sent ok, id=", res.data?.id);
    }
  } catch (err) {
    console.error("[email] send threw:", err);
  }
}
