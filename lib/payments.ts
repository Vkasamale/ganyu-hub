import crypto from "crypto";

// PROJECT_BRIEF §7: payments are a swappable provider layer. Nothing else in
// the app talks to PayChangu — everything routes through this file.

const API_BASE = "https://api.paychangu.com";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://ganyu-hub.vercel.app";
}

function secretKey() {
  const k = process.env.PAYCHANGU_SECRET_KEY;
  if (!k) throw new Error("PAYCHANGU_SECRET_KEY not set");
  return k;
}

export type InitiateArgs = {
  jobId: string;
  amountMwk: number;
  email: string;
  firstName: string;
  lastName: string;
  title: string;
};

export type InitiateResult = { checkoutUrl: string; txRef: string };

export async function initiatePayment(a: InitiateArgs): Promise<InitiateResult> {
  const txRef = `gh_${a.jobId}_${crypto.randomUUID()}`;
  const body = {
    amount: a.amountMwk,
    currency: "MWK",
    email: a.email,
    first_name: a.firstName,
    last_name: a.lastName,
    tx_ref: txRef,
    callback_url: `${siteUrl()}/api/paychangu/callback?tx_ref=${encodeURIComponent(txRef)}`,
    return_url: `${siteUrl()}/jobs/${a.jobId}`,
    customization: {
      title: a.title.slice(0, 60),
      description: `Escrow for "${a.title}" on Ganyu Hub`,
    },
    meta: { job_id: a.jobId },
  };

  const res = await fetch(`${API_BASE}/payment`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${secretKey()}`,
    },
    body: JSON.stringify(body),
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || json.status !== "success") {
    throw new Error(json?.message || `PayChangu init failed (${res.status})`);
  }
  const checkoutUrl: string | undefined = json?.data?.checkout_url || json?.checkout_url;
  if (!checkoutUrl) throw new Error("PayChangu returned no checkout_url");
  return { checkoutUrl, txRef };
}

export type VerifyResult = { status: "success" | "pending" | "failed"; providerId?: string };

export async function verifyPayment(txRef: string): Promise<VerifyResult> {
  const res = await fetch(`${API_BASE}/verify-payment/${encodeURIComponent(txRef)}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${secretKey()}`,
    },
    cache: "no-store",
  });
  const json: any = await res.json().catch(() => ({}));
  const data = json?.data ?? json;
  const raw = String(data?.status ?? "").toLowerCase();
  const status: VerifyResult["status"] =
    raw === "success" || raw === "successful" ? "success"
      : raw === "failed" || raw === "reversed" || raw === "cancelled" ? "failed"
      : "pending";
  const providerId = data?.reference || data?.id;
  return { status, providerId: providerId ? String(providerId) : undefined };
}

export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.PAYCHANGU_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader.trim());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ponytail: parse only the fields we actually consume; we re-verify via
// verifyPayment before trusting the webhook, so this is just extraction.
export function parseWebhook(payload: any): { txRef?: string; status: "success" | "pending" | "failed" } {
  const data = payload?.data ?? payload ?? {};
  const raw = String(data?.status ?? payload?.status ?? "").toLowerCase();
  const status: "success" | "pending" | "failed" =
    raw === "success" || raw === "successful" ? "success"
      : raw === "failed" || raw === "reversed" || raw === "cancelled" ? "failed"
      : "pending";
  return { txRef: data?.tx_ref || payload?.tx_ref, status };
}
