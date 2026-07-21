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
  mobile?: string;
  topupId?: string;
};

export type InitiateResult = { checkoutUrl: string; txRef: string };

export async function initiatePayment(a: InitiateArgs): Promise<InitiateResult> {
  const txRef = a.topupId ? `ghtop_${a.topupId}_${crypto.randomUUID()}` : `gh_${a.jobId}_${crypto.randomUUID()}`;
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
    meta: a.topupId ? { job_id: a.jobId, topup_id: a.topupId } : { job_id: a.jobId },
    ...(a.mobile ? { mobile: a.mobile } : {}),
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

export type VerifyResult = {
  status: "success" | "pending" | "failed";
  providerId?: string;
  amount?: number;   // what was actually charged/paid
  fee?: number;      // PayChangu's cut
  rail?: string;     // provider label ("Mobile Bank Transfer", "Airtel Money", ...)
};

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
  console.log("[paychangu-verify]", txRef, "http=", res.status, "body=", JSON.stringify(json).slice(0, 800));
  const data = json?.data ?? json;
  const raw = String(data?.status ?? "").toLowerCase();
  const status: VerifyResult["status"] =
    raw === "success" || raw === "successful" ? "success"
      : raw === "failed" || raw === "reversed" || raw === "cancelled" ? "failed"
      : "pending";
  const providerId = data?.reference || data?.id;
  const amountRaw = Number(data?.amount);
  const amount = Number.isFinite(amountRaw) ? Math.round(amountRaw) : amountRaw;
  const feeRaw = Number(data?.charges);
  const fee = Number.isFinite(feeRaw) ? Math.round(feeRaw) : feeRaw;
  const rail = data?.authorization?.channel;
  return {
    status,
    providerId: providerId ? String(providerId) : undefined,
    amount: Number.isFinite(amount) ? amount : undefined,
    fee: Number.isFinite(fee) ? fee : undefined,
    rail: rail ? String(rail) : undefined,
  };
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

export type SupportedBank = { uuid: string; name: string };

// 1-hour cache — bank list changes rarely.
export async function getSupportedBanks(currency = "MWK"): Promise<SupportedBank[]> {
  const res = await fetch(`${API_BASE}/direct-charge/payouts/supported-banks?currency=${currency}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${secretKey()}` },
    next: { revalidate: 3600 },
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || json.status !== "success") return [];
  return (json.data || []).map((b: any) => ({ uuid: String(b.uuid), name: String(b.name) }));
}

// ----- Payouts -----

import { creativeGross } from "@/lib/fees";
export const CREATIVE_SHARE = 0.85; // pre-beta rate; live math flows through creativeGross so BETA_ZERO_COMMISSION is honored.
export function creativeAmount(agreedMwk: number) {
  return creativeGross(agreedMwk);
}

export type PayoutDest =
  | { method: "mobile"; number: string; network: "airtel" | "tnm"; firstName: string; lastName: string; email: string }
  | { method: "bank"; bankUuid: string; accountName: string; accountNumber: string; email: string };

export type PayoutInitArgs = {
  jobId: string;
  amountMwk: number; // already net of commission
  jobTitle: string;
  dest: PayoutDest;
};

export type PayoutInitResult = { chargeId: string; providerId?: string };

export async function initiatePayout(a: PayoutInitArgs): Promise<PayoutInitResult> {
  const chargeId = `gh_po_${a.jobId}_${crypto.randomUUID()}`;

  if (a.dest.method === "mobile") {
    const opId = a.dest.network === "airtel"
      ? process.env.PAYCHANGU_AIRTEL_OP_ID
      : process.env.PAYCHANGU_TNM_OP_ID;
    if (!opId) throw new Error(`Missing operator id env for ${a.dest.network} (PAYCHANGU_${a.dest.network.toUpperCase()}_OP_ID)`);

    const body = {
      mobile_money_operator_ref_id: opId,
      mobile: a.dest.number,
      amount: a.amountMwk,
      charge_id: chargeId,
      email: a.dest.email,
      first_name: a.dest.firstName,
      last_name: a.dest.lastName,
      meta: { job_id: a.jobId, kind: "payout" },
    };
    const res = await fetch(`${API_BASE}/mobile-money/payouts/initialize`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey()}`,
      },
      body: JSON.stringify(body),
    });
    const json: any = await res.json().catch(() => ({}));
    if (!res.ok || (json.status && json.status !== "success")) {
      throw new Error(json?.message || `PayChangu mobile payout failed (${res.status})`);
    }
    return { chargeId, providerId: json?.data?.reference || json?.data?.id };
  }

  const body = {
    bank_uuid: a.dest.bankUuid,
    amount: a.amountMwk,
    charge_id: chargeId,
    bank_account_name: a.dest.accountName,
    bank_account_number: a.dest.accountNumber,
    email: a.dest.email,
    meta: { job_id: a.jobId, kind: "payout" },
  };
  const res = await fetch(`${API_BASE}/direct-charge/payouts/initialize`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${secretKey()}`,
    },
    body: JSON.stringify(body),
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || (json.status && json.status !== "success")) {
    // ponytail: bank endpoint may return a "feature not enabled" error even
    // on verified accounts — user will contact PayChangu support to activate.
    throw new Error(json?.message || `PayChangu bank payout failed (${res.status})`);
  }
  return { chargeId, providerId: json?.data?.reference || json?.data?.id };
}

// Server-side re-verify for a payout. Same "never trust the webhook alone"
// pattern as verifyPayment. Mobile and bank use different detail endpoints.
// On success we also return fee data: the actual amount debited from our
// merchant balance, PayChangu's transaction charge, and the rail label.
export async function verifyPayout(chargeId: string, method: "mobile" | "bank"): Promise<VerifyResult> {
  const url = method === "mobile"
    ? `${API_BASE}/mobile-money/payments/${encodeURIComponent(chargeId)}/details`
    : `${API_BASE}/direct-charge/payouts/${encodeURIComponent(chargeId)}/details`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", Authorization: `Bearer ${secretKey()}` },
    cache: "no-store",
  });
  const json: any = await res.json().catch(() => ({}));
  const data = json?.data ?? json;
  const raw = String(data?.status ?? "").toLowerCase();
  const status: VerifyResult["status"] =
    raw === "success" || raw === "successful" || raw === "completed" ? "success"
      : raw === "failed" || raw === "reversed" || raw === "cancelled" ? "failed"
      : "pending";
  const providerId = data?.ref_id || data?.trans_id || data?.reference || data?.id;
  // ponytail: PayChangu returns decimals; payout_amount_mwk / payout_fee_mwk
  // are int columns and silently reject non-integers, same trap as verifyPayment.
  const amountRaw = Number(data?.amount);
  const amount = Number.isFinite(amountRaw) ? Math.round(amountRaw) : amountRaw;
  const feeRaw = Number(data?.transaction_charges?.amount);
  const fee = Number.isFinite(feeRaw) ? Math.round(feeRaw) : feeRaw;
  const rail = data?.mobile_money?.name || data?.payment_method;
  return {
    status,
    providerId: providerId ? String(providerId) : undefined,
    amount: Number.isFinite(amount) ? amount : undefined,
    fee: Number.isFinite(fee) ? fee : undefined,
    rail: rail ? String(rail) : undefined,
  };
}

// Payout webhooks share the signed-body pattern with collection webhooks but
// carry a charge_id instead of tx_ref. verifyPayout is used to server-side
// re-verify before trusting the webhook.
export function parsePayoutWebhook(payload: any): { chargeId?: string; jobId?: string; status: "success" | "pending" | "failed"; providerId?: string } {
  const data = payload?.data ?? payload ?? {};
  const meta = data?.meta ?? payload?.meta ?? {};
  const raw = String(data?.status ?? payload?.status ?? "").toLowerCase();
  const status: "success" | "pending" | "failed" =
    raw === "success" || raw === "successful" || raw === "completed" ? "success"
      : raw === "failed" || raw === "reversed" || raw === "cancelled" ? "failed"
      : "pending";
  const providerRef = data?.reference || data?.id || data?.trans_id || data?.ref_id;
  return {
    chargeId: data?.charge_id || payload?.charge_id,
    jobId: meta?.job_id,
    status,
    providerId: providerRef ? String(providerRef) : undefined,
  };
}
