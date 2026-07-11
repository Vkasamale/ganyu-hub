"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { CATEGORIES } from "@/lib/types";

// Trust-boundary guard: keep only canonical categories. The CategoryPicker
// submits repeated name="categories" checkboxes, so read them with getAll().
const CANONICAL = new Set<string>(CATEGORIES);
function parseCategories(formData: FormData): string[] {
  return formData.getAll("categories").map(String).filter((c) => CANONICAL.has(c));
}

async function emailUser(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  payload: { subject: string; heading: string; body: string; ctaText?: string; ctaPath?: string },
) {
  const { data: email, error } = await supabase.rpc("get_user_email", { uid: userId });
  if (error) {
    console.error("[email] get_user_email RPC failed:", error);
    return;
  }
  if (!email || typeof email !== "string") {
    console.warn("[email] no email found for user", userId, "(value:", email, ")");
    return;
  }
  await sendEmail({ to: email, ...payload });
}

export async function signUp(formData: FormData) {
  const supabase = createClient();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const full_name = String(formData.get("full_name") || "");
  const role = String(formData.get("role") || "creative");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name, role } },
  });
  if (error) redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  redirect("/dashboard");
}

export async function signIn(formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/dashboard");
}

export async function updateAvailability(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };
  const value = String(formData.get("availability") || "available");
  if (!["available", "busy", "unavailable"].includes(value)) {
    return { error: "Invalid availability." };
  }
  const { error } = await supabase.from("profiles").update({ availability: value }).eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/profile");
  revalidatePath(`/creatives/${user.id}`);
  return { ok: true };
}

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const categories = parseCategories(formData);
  const skills = String(formData.get("skills") || "")
    .split(",").map((s) => s.trim()).filter(Boolean);

  const update: Record<string, unknown> = {
    full_name: String(formData.get("full_name") || ""),
    headline: String(formData.get("headline") || ""),
    bio: String(formData.get("bio") || ""),
    location: String(formData.get("location") || "Malawi"),
    categories,
    skills,
  };
  if (formData.has("hourly_rate_mwk")) {
    update.hourly_rate_mwk = Number(formData.get("hourly_rate_mwk")) || null;
  }

  const avatar = formData.get("avatar_file");
  if (avatar instanceof File && avatar.size > 0) {
    if (avatar.size > 5 * 1024 * 1024) return { error: "Avatar too large (max 5MB)." };
    if (!avatar.type.startsWith("image/")) return { error: "Avatar must be an image." };
    const ext = avatar.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
    const path = `${user.id}/avatar/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("portfolio")
      .upload(path, avatar, { contentType: avatar.type, upsert: false });
    if (upErr) return { error: upErr.message };
    const { data: pub } = supabase.storage.from("portfolio").getPublicUrl(path);
    update.avatar_url = pub.publicUrl;
  }

  const cover = formData.get("cover_file");
  if (cover instanceof File && cover.size > 0) {
    if (cover.size > 8 * 1024 * 1024) return { error: "Cover photo too large (max 8MB)." };
    if (!cover.type.startsWith("image/")) return { error: "Cover must be an image." };
    const ext = cover.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
    const path = `${user.id}/cover/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("portfolio")
      .upload(path, cover, { contentType: cover.type, upsert: false });
    if (upErr) return { error: upErr.message };
    const { data: pub } = supabase.storage.from("portfolio").getPublicUrl(path);
    update.cover_url = pub.publicUrl;
  }

  const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/profile");
  revalidatePath(`/creatives/${user.id}`);
  return { ok: true };
}

export async function updateAccount(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const full_name = String(formData.get("full_name") || "");
  const phone = String(formData.get("phone") || "") || null;
  const newEmail = String(formData.get("email") || "").trim();

  const { error: pErr } = await supabase.from("profiles").update({ full_name, phone }).eq("id", user.id);
  if (pErr) return { error: pErr.message };

  if (newEmail && newEmail !== user.email) {
    const { error: eErr } = await supabase.auth.updateUser({ email: newEmail });
    if (eErr) return { error: eErr.message };
    revalidatePath("/dashboard/account");
    return { ok: true, info: "Check your inbox to confirm the new email." };
  }

  revalidatePath("/dashboard/account");
  return { ok: true };
}

export async function completeCreativeOnboarding(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const headline = String(formData.get("headline") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const categories = parseCategories(formData);
  const skills = String(formData.get("skills") || "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const piece_title = String(formData.get("piece_title") || "").trim();
  const piece_description = String(formData.get("piece_description") || "").trim();
  const piece_project_url = String(formData.get("piece_project_url") || "").trim() || null;

  let piece_cover_url: string | null = null;
  const pieceCover = formData.get("piece_cover_file");
  if (pieceCover instanceof File && pieceCover.size > 0) {
    if (pieceCover.size > 10 * 1024 * 1024) return { error: "Cover image too large (max 10MB)." };
    if (!pieceCover.type.startsWith("image/")) return { error: "Cover must be an image." };
    const ext = pieceCover.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
    const path = `${user.id}/portfolio/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("portfolio")
      .upload(path, pieceCover, { contentType: pieceCover.type });
    if (upErr) return { error: upErr.message };
    piece_cover_url = supabase.storage.from("portfolio").getPublicUrl(path).data.publicUrl;
  }
  const service_title = String(formData.get("service_title") || "").trim();
  const service_price_mwk = Number(formData.get("service_price_mwk")) || null;
  const service_price_mwk_max_raw = Number(formData.get("service_price_mwk_max")) || null;
  const service_price_mwk_max =
    service_price_mwk_max_raw && service_price_mwk && service_price_mwk_max_raw >= service_price_mwk
      ? service_price_mwk_max_raw
      : null;
  const service_delivery_days = Number(formData.get("service_delivery_days")) || 7;

  if (!headline) return { error: "Add a headline so clients know what you do." };
  if (!bio) return { error: "Write a short bio." };
  if (!piece_title) return { error: "Add at least one piece of work." };
  if (!service_title) return { error: "Add at least one service to your rate card." };
  if (!service_price_mwk) return { error: "Add a starting price for the service." };

  const { error: pErr } = await supabase.from("profiles").update({
    headline, bio, categories, skills,
    onboarded_at: new Date().toISOString(),
  }).eq("id", user.id);
  if (pErr) return { error: pErr.message };

  const { error: iErr } = await supabase.from("portfolio_items").insert({
    profile_id: user.id,
    title: piece_title,
    description: piece_description || null,
    cover_url: piece_cover_url,
    project_url: piece_project_url,
  });
  if (iErr) return { error: iErr.message };

  const { error: sErr } = await supabase.from("services").insert({
    profile_id: user.id,
    title: service_title,
    price_mwk: service_price_mwk,
    price_mwk_max: service_price_mwk_max,
    delivery_days: service_delivery_days,
  });
  if (sErr) return { error: sErr.message };

  revalidatePath("/dashboard");
  revalidatePath(`/creatives/${user.id}`);
  redirect("/dashboard");
}

export async function upsertService(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const id = String(formData.get("id") || "") || null;
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const price_mwk = Number(formData.get("price_mwk")) || null;
  const price_mwk_max_raw = Number(formData.get("price_mwk_max")) || null;
  const price_mwk_max = price_mwk_max_raw && price_mwk && price_mwk_max_raw >= price_mwk ? price_mwk_max_raw : null;
  const delivery_days = Number(formData.get("delivery_days")) || 7;

  if (!title) return { error: "Add a title for the service." };
  if (!price_mwk) return { error: "Add a starting price." };

  const row: Record<string, unknown> = {
    profile_id: user.id,
    title,
    description,
    price_mwk,
    price_mwk_max,
    delivery_days,
  };

  const image = formData.get("image_file");
  if (image instanceof File && image.size > 0) {
    if (image.size > 10 * 1024 * 1024) return { error: "Image too large (max 10MB)." };
    if (!image.type.startsWith("image/")) return { error: "Must be an image." };
    const ext = image.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
    const path = `${user.id}/services/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("portfolio")
      .upload(path, image, { contentType: image.type });
    if (upErr) return { error: upErr.message };
    row.image_url = supabase.storage.from("portfolio").getPublicUrl(path).data.publicUrl;
  }

  const { error } = id
    ? await supabase.from("services").update(row).eq("id", id).eq("profile_id", user.id)
    : await supabase.from("services").insert(row);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/services");
  revalidatePath(`/creatives/${user.id}`);
  return { ok: true };
}

export async function deleteService(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Missing service id." };
  const { error } = await supabase.from("services").delete().eq("id", id).eq("profile_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/services");
  revalidatePath(`/creatives/${user.id}`);
  return { ok: true };
}

export async function requestCustomService(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to request a quote." };

  const creative_id = String(formData.get("creative_id") || "");
  const request_text = String(formData.get("request_text") || "").trim();
  if (!creative_id) return { error: "Missing creative." };
  if (!request_text) return { error: "Tell the creative what you need." };
  if (creative_id === user.id) return { error: "You can't request a quote from yourself." };

  const { data: thread, error: tErr } = await supabase.from("message_threads")
    .upsert({ client_id: user.id, creative_id, job_id: null }, { onConflict: "client_id,creative_id,job_id" })
    .select("id").single();
  if (tErr || !thread) return { error: tErr?.message || "Couldn't open conversation." };

  const body = `Custom service request: ${request_text}`;
  const { error: mErr } = await supabase.from("messages").insert({
    thread_id: thread.id, sender_id: user.id, body,
  });
  if (mErr) return { error: mErr.message };

  const { data: me } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
  const preview = request_text.length > 80 ? request_text.slice(0, 80) + "…" : request_text;
  await supabase.from("notifications").insert({
    user_id: creative_id,
    kind: "message_received",
    title: `Quote requested from ${me?.full_name || "a client"}`,
    body: preview,
    link: `/messages/${thread.id}`,
    actor_id: user.id,
    target_type: "thread",
    target_id: thread.id,
  });
  await emailUser(supabase, creative_id, {
    subject: `New quote request from ${me?.full_name || "a client"}`,
    heading: `${me?.full_name || "A client"} is asking for a quote`,
    body: preview,
    ctaText: "Open conversation",
    ctaPath: `/messages/${thread.id}`,
  });

  redirect(`/messages/${thread.id}`);
}

export async function completeClientOnboarding(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const full_name = String(formData.get("full_name") || "").trim();
  const headline = String(formData.get("headline") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const categories = parseCategories(formData);

  if (!full_name) return { error: "Add a name or company name." };

  const { error } = await supabase.from("profiles").update({
    full_name, headline, bio, categories,
    onboarded_at: new Date().toISOString(),
  }).eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  const postNow = String(formData.get("post_now") || "");
  if (postNow === "yes") redirect("/jobs/new");
  redirect("/dashboard");
}

async function requireAdmin(supabase: ReturnType<typeof createClient>): Promise<{ ok: boolean; userId?: string; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return { ok: false, error: "Admin only." };
  return { ok: true, userId: user.id };
}

export async function adminResolveDispute(formData: FormData) {
  const supabase = createClient();
  const gate = await requireAdmin(supabase);
  if (!gate.ok) return { error: gate.error };

  const job_id = String(formData.get("job_id"));
  const outcome = String(formData.get("outcome")) as "completed" | "cancelled";
  if (!["completed", "cancelled"].includes(outcome)) return { error: "Invalid outcome." };

  const { data: job } = await supabase.from("jobs").select("id, client_id, title").eq("id", job_id).single();
  if (!job) return { error: "Job not found." };

  const { error } = await supabase.from("jobs").update({ status: outcome }).eq("id", job_id);
  if (error) return { error: error.message };

  const { data: acceptedProposal } = await supabase
    .from("proposals")
    .select("creative_id")
    .eq("job_id", job_id)
    .eq("status", "accepted")
    .maybeSingle();

  const recipients = [job.client_id, acceptedProposal?.creative_id].filter(Boolean) as string[];
  for (const recipient of recipients) {
    await supabase.from("notifications").insert({
      user_id: recipient,
      kind: "message_received",
      title: `Dispute resolved: ${outcome}`,
      body: `Admin resolved the dispute on "${job.title}" as ${outcome}.`,
      link: `/jobs/${job_id}`,
      actor_id: gate.userId,
      target_type: "job",
      target_id: job_id,
    });
    await emailUser(supabase, recipient, {
      subject: `Dispute resolved: ${job.title}`,
      heading: `Dispute resolved as ${outcome}`,
      body: `Admin resolved the dispute on "${job.title}" as ${outcome}.`,
      ctaText: "Open job",
      ctaPath: `/jobs/${job_id}`,
    });
  }

  revalidatePath("/admin");
  revalidatePath(`/jobs/${job_id}`);
  return { ok: true };
}

export async function adminHideJob(formData: FormData) {
  const supabase = createClient();
  const gate = await requireAdmin(supabase);
  if (!gate.ok) return { error: gate.error };
  const id = String(formData.get("id"));
  const hide = String(formData.get("hide")) !== "false";
  const { error } = await supabase
    .from("jobs")
    .update({ hidden_at: hide ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${id}`);
  return { ok: true };
}

export async function updatePassword(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords don't match." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function addPortfolioItem(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const files = formData.getAll("cover_files").filter(
    (f): f is File => f instanceof File && f.size > 0,
  );
  if (files.length > 10) return { error: "Up to 10 images per item." };
  const uploaded: string[] = [];
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) return { error: `"${file.name}" is over 10MB.` };
    if (!file.type.startsWith("image/")) return { error: `"${file.name}" is not an image.` };
    const ext = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
    const path = `${user.id}/portfolio/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("portfolio")
      .upload(path, file, { contentType: file.type });
    if (upErr) return { error: upErr.message };
    uploaded.push(supabase.storage.from("portfolio").getPublicUrl(path).data.publicUrl);
  }
  const cover_url = uploaded[0] ?? (String(formData.get("cover_url") || "") || null);
  const images = uploaded.slice(1);

  const { error } = await supabase.from("portfolio_items").insert({
    profile_id: user.id,
    title: String(formData.get("title")),
    description: String(formData.get("description") || ""),
    cover_url,
    images,
    project_url: String(formData.get("project_url") || "") || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/portfolio");
  revalidatePath(`/creatives/${user.id}`);
  return { ok: true };
}

export async function updatePortfolioItem(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Missing id" };

  const { error } = await supabase
    .from("portfolio_items")
    .update({
      title: String(formData.get("title")),
      description: String(formData.get("description") || ""),
      project_url: String(formData.get("project_url") || "") || null,
    })
    .eq("id", id)
    .eq("profile_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/portfolio");
  revalidatePath(`/creatives/${user.id}`);
  return { ok: true };
}

export async function deletePortfolioItem(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const id = String(formData.get("id") || "");
  if (!id) return;
  await supabase.from("portfolio_items").delete().eq("id", id).eq("profile_id", user.id);
  revalidatePath("/dashboard/portfolio");
  revalidatePath(`/creatives/${user.id}`);
  redirect("/dashboard/portfolio");
}

export async function submitReview(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const job_id = String(formData.get("job_id") || "");
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") || "").trim();
  if (!job_id) return { error: "Missing job" };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Pick a rating from 1 to 5 stars." };

  const { data: job } = await supabase.from("jobs").select("id, client_id, status, title").eq("id", job_id).single();
  if (!job) return { error: "Job not found" };
  if (job.status !== "completed") return { error: "You can only review a completed job." };

  const { data: acceptedProposal } = await supabase
    .from("proposals")
    .select("creative_id")
    .eq("job_id", job_id)
    .eq("status", "accepted")
    .maybeSingle();
  const creativeId = acceptedProposal?.creative_id;

  const isClient = user.id === job.client_id;
  const isCreative = creativeId && user.id === creativeId;
  if (!isClient && !isCreative) return { error: "Not a party to this job" };

  const reviewee_id = isClient ? creativeId : job.client_id;
  if (!reviewee_id) return { error: "No counterparty to review yet." };

  const { error } = await supabase.from("reviews").insert({
    job_id,
    reviewer_id: user.id,
    reviewee_id,
    rating,
    comment: comment || null,
  });
  if (error) {
    if (error.code === "23505") return { error: "You already reviewed this job." };
    return { error: error.message };
  }

  await supabase.from("notifications").insert({
    user_id: reviewee_id,
    kind: "message_received",
    title: `You got a ${rating}★ review`,
    body: `Someone reviewed your work on "${job.title}".`,
    link: `/creatives/${reviewee_id}`,
    actor_id: user.id,
    target_type: "creative",
    target_id: reviewee_id,
  });

  revalidatePath(`/jobs/${job_id}`);
  revalidatePath(`/creatives/${reviewee_id}`);
  return { ok: true, info: "Review submitted. Thanks!" };
}

export async function postJob(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const brief = String(formData.get("brief") || "").trim();
  const deliverables = String(formData.get("deliverables") || "").trim();
  const deadline = String(formData.get("deadline") || "").trim() || null;
  const revisionsRaw = Number(formData.get("revisions_included"));
  const format_spec = String(formData.get("format_spec") || "").trim() || null;

  // Structured brief so acceptance = real contract. Cheap validation up front.
  if (brief.length < 200) return { error: "Brief must be at least 200 characters — spell out what the job actually is." };
  if (deliverables.length < 50) return { error: "Deliverables must be at least 50 characters — list what you'll receive." };
  if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return { error: "Deadline must be a valid date." };
  const revisions_included = Number.isFinite(revisionsRaw) && revisionsRaw >= 0 && revisionsRaw <= 10
    ? Math.floor(revisionsRaw) : null;

  const { data, error } = await supabase.from("jobs").insert({
    client_id: user.id,
    title: String(formData.get("title")),
    brief,
    budget_mwk: Number(formData.get("budget_mwk")) || null,
    category: String(formData.get("category")),
    deliverables,
    deadline,
    revisions_included,
    format_spec,
  }).select("id").single();
  if (error) return { error: error.message };
  redirect(`/jobs/${data.id}`);
}

export async function submitProposal(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const job_id = String(formData.get("job_id"));

  const { data: jobRow } = await supabase
    .from("jobs")
    .select("proposal_limit")
    .eq("id", job_id)
    .single();
  const limit = jobRow?.proposal_limit ?? 10;
  const { count } = await supabase
    .from("proposals")
    .select("id", { count: "exact", head: true })
    .eq("job_id", job_id);
  if ((count ?? 0) >= limit) {
    return { error: `This job has reached its proposal limit (${limit}).` };
  }

  const { error } = await supabase.from("proposals").insert({
    job_id,
    creative_id: user.id,
    cover_letter: String(formData.get("cover_letter")),
    bid_mwk: Number(formData.get("bid_mwk")),
  });
  if (error) return { error: error.message };
  await supabase.from("interactions").insert({ user_id: user.id, target_type: "job", target_id: job_id, kind: "proposal_sent" });

  const { data: job } = await supabase.from("jobs").select("client_id, title").eq("id", job_id).single();
  const { data: me } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
  if (job) {
    await supabase.from("notifications").insert({
      user_id: job.client_id,
      kind: "proposal_received",
      title: "New proposal received",
      body: `${me?.full_name || "Someone"} sent a proposal on "${job.title}"`,
      link: `/jobs/${job_id}`,
      actor_id: user.id,
      target_type: "job",
      target_id: job_id,
    });
    await emailUser(supabase, job.client_id, {
      subject: `New proposal on "${job.title}"`,
      heading: "You've got a new proposal",
      body: `${me?.full_name || "Someone"} sent a proposal on your job "${job.title}". Review it and reply on Ganyu Hub.`,
      ctaText: "View proposal",
      ctaPath: `/jobs/${job_id}`,
    });
  }
  revalidatePath(`/jobs/${job_id}`);
  return { ok: true };
}

export async function decideProposal(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("proposal_id"));
  const status = String(formData.get("status")) as "accepted" | "declined";

  const { data: proposal, error: propErr } = await supabase
    .from("proposals")
    .select("creative_id, job_id, bid_mwk, job:jobs!proposals_job_id_fkey(title, client_id, escrow_status, pending_accept_proposal_id, status)")
    .eq("id", id)
    .single();
  if (propErr) {
    // Most likely: pending_accept_proposal_id column doesn't exist yet.
    return { error: `Could not read proposal (${propErr.message}). If you see 'column jobs.pending_accept_proposal_id does not exist', run the latest schema.sql in Supabase.` };
  }
  if (!proposal) return { error: "Proposal not found." };
  const job: any = Array.isArray(proposal.job) ? proposal.job[0] : proposal.job;

  // Decline: unchanged path — flip status, notify.
  if (status === "declined") {
    const { error } = await supabase.from("proposals").update({ status: "declined" }).eq("id", id);
    if (error) return { error: error.message };
    await supabase.from("notifications").insert({
      user_id: proposal.creative_id,
      kind: "proposal_declined",
      title: "Proposal declined",
      body: `Your proposal on "${job?.title || "a job"}" was declined.`,
      link: `/jobs/${proposal.job_id}`,
      actor_id: job?.client_id || null,
      target_type: "job",
      target_id: proposal.job_id,
    });
    await emailUser(supabase, proposal.creative_id, {
      subject: "Your proposal was declined",
      heading: "Your proposal was declined",
      body: `Your proposal on "${job?.title || "a job"}" was declined.`,
      ctaText: "See details",
      ctaPath: `/jobs/${proposal.job_id}`,
    });
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${proposal.job_id}`);
    return { ok: true };
  }

  // Accept: don't lock the market. Pin the proposal on the job and immediately
  // start payment. Real acceptance happens on payment confirmation (webhook /
  // callback / reconcile), where the proposal is promoted, losers auto-rejected,
  // and the job flips to scope_pending.
  if (job?.pending_accept_proposal_id && job.pending_accept_proposal_id !== id) {
    return { error: "You already have a pending acceptance on this job. Cancel it or complete that payment first." };
  }
  if (job?.status !== "open") {
    return { error: "This job is no longer open to acceptance." };
  }
  if (!proposal.bid_mwk || proposal.bid_mwk <= 0) {
    return { error: "Proposal has no bid amount." };
  }

  // Pin the proposal on the job, set escrow to pending, kick off PayChangu.
  await supabase.from("jobs").update({
    pending_accept_proposal_id: id,
    accepted_bid_mwk: proposal.bid_mwk,
  }).eq("id", proposal.job_id);

  const { initiatePayment } = await import("@/lib/payments");
  const { clientCharge } = await import("@/lib/fees");
  const railRaw = String(formData.get("rail") || "mobile_money");
  const rail = (railRaw === "card" || railRaw === "bank_transfer" ? railRaw : "mobile_money") as
    "mobile_money" | "card" | "bank_transfer";
  const totalMwk = clientCharge(proposal.bid_mwk, rail);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const { data: cprofile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
  const [firstName, ...rest] = (cprofile?.full_name || "Client").split(" ");
  const { data: myDefault } = await supabase.from("payout_methods")
    .select("kind, mobile_number").eq("user_id", user.id).eq("is_default", true).maybeSingle();
  const prefillMobile = myDefault?.kind === "mobile" ? myDefault.mobile_number : undefined;

  try {
    const { checkoutUrl, txRef } = await initiatePayment({
      jobId: proposal.job_id,
      amountMwk: totalMwk,
      email: user.email || "",
      firstName,
      lastName: rest.join(" ") || "-",
      title: job?.title || "Ganyu Hub job",
      mobile: prefillMobile || undefined,
    });
    await supabase.from("jobs").update({
      escrow_status: "payment_pending",
      payment_ref: txRef,
      payment_initiated_at: new Date().toISOString(),
      payment_rail: rail,
    }).eq("id", proposal.job_id);
    redirect(checkoutUrl);
  } catch (e: any) {
    if (e?.digest?.startsWith?.("NEXT_REDIRECT")) throw e;
    // Roll back the pending acceptance so the job doesn't stay pinned.
    await supabase.from("jobs").update({
      pending_accept_proposal_id: null,
      escrow_status: "none",
      payment_ref: null,
    }).eq("id", proposal.job_id);
    return { error: `Could not start payment: ${e?.message || "unknown error"}` };
  }
}


type JobStatus =
  | "open"
  | "scope_pending"
  | "in_progress"
  | "submitted"
  | "revision_requested"
  | "completed"
  | "disputed"
  | "cancelled";

const CREATIVE_TRANSITIONS: Record<string, JobStatus[]> = {
  in_progress: ["submitted"],
  revision_requested: ["submitted"],
};
const CLIENT_TRANSITIONS: Record<string, JobStatus[]> = {
  submitted: ["completed", "revision_requested"],
  open: ["cancelled"],
  scope_pending: ["cancelled"],
};
const EITHER_TRANSITIONS: Record<string, JobStatus[]> = {};
const DISPUTABLE: JobStatus[] = ["in_progress", "submitted", "revision_requested", "scope_pending"];

export async function updateJobStatus(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const job_id = String(formData.get("job_id"));
  const next = String(formData.get("status")) as JobStatus;

  const { data: job } = await supabase.from("jobs").select("id, client_id, status, title").eq("id", job_id).single();
  if (!job) return { error: "Job not found" };

  const { data: acceptedProposal } = await supabase
    .from("proposals")
    .select("creative_id")
    .eq("job_id", job_id)
    .eq("status", "accepted")
    .maybeSingle();
  const creativeId = acceptedProposal?.creative_id;

  const isClient = user.id === job.client_id;
  const isCreative = creativeId && user.id === creativeId;
  if (!isClient && !isCreative) return { error: "Not a party to this job" };

  const allowed = new Set<JobStatus>([
    ...(isCreative ? CREATIVE_TRANSITIONS[job.status] || [] : []),
    ...(isClient ? CLIENT_TRANSITIONS[job.status] || [] : []),
    ...(EITHER_TRANSITIONS[job.status] || []),
  ]);
  if (!allowed.has(next)) return { error: `Cannot move job from ${job.status} to ${next}` };

  const { error } = await supabase.from("jobs").update({ status: next }).eq("id", job_id);
  if (error) return { error: error.message };

  if (creativeId) {
    const recipient = isClient ? creativeId : job.client_id;
    const recipientIsCreative = recipient === creativeId;
    const titles: Record<string, string> = {
      submitted: "Work submitted for review",
      revision_requested: "Revision requested",
      completed: recipientIsCreative ? "Job complete — add it to your portfolio?" : "Job marked as completed",
      disputed: "Job flagged as disputed",
      cancelled: "Job cancelled",
    };
    const bodies: Record<string, string> = {
      completed: recipientIsCreative
        ? `"${job.title}" is marked complete. Add it to your portfolio so future clients can see your work.`
        : `"${job.title}" was marked complete.`,
    };
    const ctas: Record<string, string> = {
      completed: recipientIsCreative ? "Add to portfolio" : "Open job",
    };
    await supabase.from("notifications").insert({
      user_id: recipient,
      kind: "message_received",
      title: titles[next] || `Job status: ${next}`,
      body: bodies[next] || `"${job.title}" was updated to ${next.replace("_", " ")}.`,
      link: `/jobs/${job_id}`,
      actor_id: user.id,
      target_type: "job",
      target_id: job_id,
    });
    await emailUser(supabase, recipient, {
      subject: `${titles[next] || "Job updated"}: ${job.title}`,
      heading: titles[next] || "Job status updated",
      body: bodies[next] || `"${job.title}" was updated to ${next.replace("_", " ")}.`,
      ctaText: ctas[next] || "Open job",
      ctaPath: `/jobs/${job_id}`,
    });
  }

  revalidatePath(`/jobs/${job_id}`);
  revalidatePath("/jobs");
  return { ok: true };
}

export async function raiseDispute(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const job_id = String(formData.get("job_id"));
  const reason = String(formData.get("reason") || "").trim();
  if (reason.length < 10) return { error: "Add a few sentences explaining the issue (10+ chars)." };

  const { data: job } = await supabase.from("jobs").select("id, client_id, status, title").eq("id", job_id).single();
  if (!job) return { error: "Job not found" };
  if (!DISPUTABLE.includes(job.status as JobStatus)) {
    return { error: `Cannot raise a dispute from "${job.status}".` };
  }

  const { data: acceptedProposal } = await supabase
    .from("proposals").select("creative_id").eq("job_id", job_id).eq("status", "accepted").maybeSingle();
  const creativeId = acceptedProposal?.creative_id;

  const isClient = user.id === job.client_id;
  const isCreative = creativeId && user.id === creativeId;
  if (!isClient && !isCreative) return { error: "Not a party to this job" };

  const { error } = await supabase.from("jobs").update({
    status: "disputed",
    dispute_reason: reason,
    dispute_raised_by: user.id,
    dispute_raised_at: new Date().toISOString(),
  }).eq("id", job_id);
  if (error) return { error: error.message };

  const otherParty = isClient ? creativeId : job.client_id;
  const { data: admins } = await supabase.from("profiles").select("id").eq("is_admin", true);
  const recipients = [otherParty, ...(admins || []).map((a) => a.id)].filter(Boolean) as string[];

  for (const recipient of recipients) {
    await supabase.from("notifications").insert({
      user_id: recipient,
      kind: "message_received",
      title: `Dispute raised: ${job.title}`,
      body: reason.length > 140 ? reason.slice(0, 140) + "…" : reason,
      link: recipient === otherParty ? `/jobs/${job_id}` : "/admin",
      actor_id: user.id,
      target_type: "job",
      target_id: job_id,
    });
    await emailUser(supabase, recipient, {
      subject: `Dispute raised: ${job.title}`,
      heading: "A dispute was raised",
      body: `"${job.title}" was flagged as disputed.\n\nReason: ${reason}`,
      ctaText: recipient === otherParty ? "Open job" : "Open admin",
      ctaPath: recipient === otherParty ? `/jobs/${job_id}` : "/admin",
    });
  }

  revalidatePath(`/jobs/${job_id}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function confirmScope(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const job_id = String(formData.get("job_id"));
  const summary = formData.get("scope_summary");

  const { data: job } = await supabase
    .from("jobs")
    .select("id, client_id, title, status, scope_summary, client_confirmed_scope_at, creative_confirmed_scope_at")
    .eq("id", job_id)
    .single();
  if (!job) return { error: "Job not found" };
  if (job.status !== "scope_pending") return { error: "Job is not awaiting scope confirmation." };

  const { data: acceptedProposal } = await supabase
    .from("proposals")
    .select("creative_id")
    .eq("job_id", job_id)
    .eq("status", "accepted")
    .maybeSingle();
  const creativeId = acceptedProposal?.creative_id;

  const isClient = user.id === job.client_id;
  const isCreative = creativeId && user.id === creativeId;
  if (!isClient && !isCreative) return { error: "Not a party to this job" };

  const patch: Record<string, any> = {};
  if (typeof summary === "string" && summary.trim() && isClient) {
    patch.scope_summary = summary.trim();
    patch.creative_confirmed_scope_at = null;
  }
  if (isClient) patch.client_confirmed_scope_at = new Date().toISOString();
  if (isCreative) patch.creative_confirmed_scope_at = new Date().toISOString();

  const nextSummary = patch.scope_summary ?? job.scope_summary;
  if (!nextSummary || !nextSummary.trim()) return { error: "Add a scope summary before confirming." };

  const clientAt = isClient ? patch.client_confirmed_scope_at : job.client_confirmed_scope_at;
  const creativeAt = isCreative ? patch.creative_confirmed_scope_at : job.creative_confirmed_scope_at;
  if (clientAt && creativeAt) patch.status = "in_progress";

  const { error } = await supabase.from("jobs").update(patch).eq("id", job_id);
  if (error) return { error: error.message };

  if (creativeId) {
    const recipient = isClient ? creativeId : job.client_id;
    const movedToInProgress = patch.status === "in_progress";
    const title = movedToInProgress
      ? "Scope agreed — work can begin"
      : isClient
        ? "Client confirmed the scope"
        : "Creative confirmed the scope";
    const body = movedToInProgress
      ? `Both sides agreed on the scope for "${job.title}". The job is now in progress.`
      : `Scope confirmed on "${job.title}". Waiting on the other side to confirm.`;
    await supabase.from("notifications").insert({
      user_id: recipient,
      kind: "message_received",
      title,
      body,
      link: `/jobs/${job_id}`,
      actor_id: user.id,
      target_type: "job",
      target_id: job_id,
    });
    await emailUser(supabase, recipient, {
      subject: `${title}: ${job.title}`,
      heading: title,
      body,
      ctaText: "Open job",
      ctaPath: `/jobs/${job_id}`,
    });
  }

  revalidatePath(`/jobs/${job_id}`);
  return { ok: true };
}

// Saved payout methods — users can register multiple; one is marked default.
// Reads/writes go through the new payout_methods table; the flat payout_*
// columns on profiles are left in place but unused by new code.

export async function addPayoutMethod(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const kind = String(formData.get("kind") || "").trim();
  const label = String(formData.get("label") || "").trim() || null;
  if (kind !== "mobile" && kind !== "bank") return { error: "Pick a method type." };

  let row: Record<string, any> = { user_id: user.id, kind, label };
  if (kind === "mobile") {
    const number = String(formData.get("mobile_number") || "").trim();
    const network = String(formData.get("mobile_network") || "").trim();
    if (!number) return { error: "Mobile money number is required." };
    if (network !== "airtel" && network !== "tnm") return { error: "Pick Airtel or TNM." };
    row = { ...row, mobile_number: number, mobile_network: network };
  } else {
    const bankUuid = String(formData.get("bank_uuid") || "").trim();
    const acctName = String(formData.get("bank_account_name") || "").trim();
    const acctNum = String(formData.get("bank_account_number") || "").trim();
    if (!bankUuid || !acctName || !acctNum) return { error: "Bank, account name, and account number are all required." };
    row = { ...row, bank_uuid: bankUuid, bank_account_name: acctName, bank_account_number: acctNum };
  }

  // If this is the user's first method, mark it default automatically.
  const { count } = await supabase.from("payout_methods").select("id", { count: "exact", head: true }).eq("user_id", user.id);
  if ((count ?? 0) === 0) row.is_default = true;

  const { error } = await supabase.from("payout_methods").insert(row);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/profile");
  return { ok: true, info: "Payment method added." };
}

export async function setDefaultPayoutMethod(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Missing method id." };
  // Clear any existing default first (unique partial index would otherwise fail).
  await supabase.from("payout_methods").update({ is_default: false }).eq("user_id", user.id).eq("is_default", true);
  const { error } = await supabase.from("payout_methods").update({ is_default: true }).eq("id", id).eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/profile");
  return { ok: true, info: "Default updated." };
}

export async function deletePayoutMethod(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Missing method id." };
  const { data: gone, error } = await supabase.from("payout_methods").delete().eq("id", id).eq("user_id", user.id).select("is_default").maybeSingle();
  if (error) return { error: error.message };
  // If we deleted the default, promote the newest remaining method.
  if (gone?.is_default) {
    const { data: next } = await supabase.from("payout_methods").select("id").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (next?.id) {
      await supabase.from("payout_methods").update({ is_default: true }).eq("id", next.id);
    }
  }
  revalidatePath("/dashboard/profile");
  return { ok: true, info: "Payment method removed." };
}

// Per-job override: the accepted creative can pin which of their saved methods
// receives this specific job's payout. Null clears the override → default is used.
export async function setJobPayoutMethod(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };
  const job_id = String(formData.get("job_id") || "");
  const raw = String(formData.get("payout_method_id") || "");
  const payout_method_id = raw === "" ? null : raw;
  if (!job_id) return { error: "Missing job id." };

  // Only the accepted creative on this job may pin its method.
  const { data: accepted } = await supabase
    .from("proposals").select("creative_id").eq("job_id", job_id).eq("status", "accepted").maybeSingle();
  if (accepted?.creative_id !== user.id) return { error: "Only the accepted creative can set this." };

  if (payout_method_id) {
    const { data: mine } = await supabase.from("payout_methods").select("id").eq("id", payout_method_id).eq("user_id", user.id).maybeSingle();
    if (!mine) return { error: "That method isn't yours." };
  }

  const { error } = await supabase.from("jobs").update({ payout_method_id }).eq("id", job_id);
  if (error) return { error: error.message };
  revalidatePath(`/jobs/${job_id}`);
  return { ok: true, info: payout_method_id ? "Payment method for this job set." : "Cleared — default will be used." };
}

type EscrowStatus = "none" | "payment_pending" | "payment_held" | "payment_released" | "payment_disputed";

const ESCROW_TRANSITIONS: Record<EscrowStatus, EscrowStatus[]> = {
  none: ["payment_pending"],
  payment_pending: ["payment_held", "none"],
  payment_held: ["payment_released", "payment_disputed"],
  payment_released: [],
  payment_disputed: ["payment_held", "payment_released"],
};

export async function updateEscrowStatus(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const job_id = String(formData.get("job_id"));
  const next = String(formData.get("escrow_status")) as EscrowStatus;

  const { data: job } = await supabase.from("jobs").select("id, client_id, title, escrow_status, accepted_bid_mwk, payout_status, payout_ref").eq("id", job_id).single();
  if (!job) return { error: "Job not found" };
  if (user.id !== job.client_id) return { error: "Only the client controls payment state." };

  // Client asked to release funds to the creative → initiate PayChangu payout.
  // The webhook (HMAC-verified) is what flips escrow_status to payment_released.
  if (job.escrow_status === "payment_held" && next === "payment_released") {
    // Idempotency: never let a second click fire a second real payout.
    if (job.payout_status === "pending") {
      return { error: "A payout for this job is already processing. Wait for PayChangu to confirm before trying again." };
    }
    if (job.payout_ref && job.payout_status !== "failed") {
      return { error: "A payout has already been initiated for this job." };
    }
    const { initiatePayout } = await import("@/lib/payments");
    const { creativeNet } = await import("@/lib/fees");
    const { data: accepted } = await supabase
      .from("proposals").select("creative_id").eq("job_id", job_id).eq("status", "accepted").maybeSingle();
    const creativeId = accepted?.creative_id;
    if (!creativeId) return { error: "No accepted proposal for this job." };
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { error: "Server misconfig: SUPABASE_SERVICE_ROLE_KEY is not set in this deployment." };
    }
    // ponytail: RLS blocks the client from reading the creative's payout columns.
    // Service-role read scoped to just the payout fields we need.
    const { createServerClient } = await import("@supabase/ssr");
    const admin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );
    const { data: cpRow, error: cpErr } = await admin.from("profiles").select("full_name").eq("id", creativeId).single();
    if (cpErr || !cpRow) {
      console.error("[release] profile lookup failed", { creativeId, cpErr });
      return { error: `Creative profile lookup failed (id=${creativeId}): ${cpErr?.message || "no row returned"}.` };
    }
    // Payout destination: prefer the method the creative pinned for this job;
    // otherwise fall back to their default.
    const { data: jobRow } = await supabase.from("jobs").select("payout_method_id").eq("id", job_id).single();
    let pm: any = null;
    let pmErr: any = null;
    if (jobRow?.payout_method_id) {
      const r = await admin.from("payout_methods")
        .select("kind, mobile_number, mobile_network, bank_uuid, bank_account_name, bank_account_number")
        .eq("id", jobRow.payout_method_id).eq("user_id", creativeId).maybeSingle();
      pm = r.data; pmErr = r.error;
    }
    if (!pm && !pmErr) {
      const r = await admin.from("payout_methods")
        .select("kind, mobile_number, mobile_network, bank_uuid, bank_account_name, bank_account_number")
        .eq("user_id", creativeId).eq("is_default", true).maybeSingle();
      pm = r.data; pmErr = r.error;
    }
    if (pmErr) return { error: `Payout method lookup failed: ${pmErr.message}` };
    if (!pm) {
      return { error: "Creative hasn't set a default payment method yet. Ask them to add one on their profile." };
    }
    // ponytail: email lives in auth.users, not profiles.
    const { data: authUser } = await admin.auth.admin.getUserById(creativeId);
    const email = authUser?.user?.email || "";

    let dest: Parameters<typeof initiatePayout>[0]["dest"];
    if (pm.kind === "mobile" && pm.mobile_number && (pm.mobile_network === "airtel" || pm.mobile_network === "tnm")) {
      const [firstName, ...rest] = (cpRow.full_name || "Creative").split(" ");
      dest = {
        method: "mobile",
        number: pm.mobile_number,
        network: pm.mobile_network,
        firstName,
        lastName: rest.join(" ") || "-",
        email,
      };
    } else if (pm.kind === "bank" && pm.bank_uuid && pm.bank_account_name && pm.bank_account_number) {
      dest = {
        method: "bank",
        bankUuid: pm.bank_uuid,
        accountName: pm.bank_account_name,
        accountNumber: pm.bank_account_number,
        email,
      };
    } else {
      return { error: "The creative's default payment method is missing details. Ask them to re-save it." };
    }

    // Atomic claim: exactly one concurrent click wins. Update only fires if
    // no live payout ref exists yet AND payout is not already pending/succeeded.
    const { data: claimed } = await supabase.from("jobs").update({
      payout_status: "pending",
      payout_initiated_at: new Date().toISOString(),
      payout_error: null,
    })
      .eq("id", job_id)
      .is("payout_ref", null)
      .or("payout_status.is.null,payout_status.eq.failed")
      .select("id");
    if (!claimed || claimed.length === 0) {
      return { error: "A payout for this job is already processing or completed." };
    }

    try {
      const payoutRail = dest.method === "bank" ? "bank" : "mobile";
      const amount = creativeNet(job.accepted_bid_mwk || 0, payoutRail);
      const { chargeId, providerId } = await initiatePayout({
        jobId: job.id,
        amountMwk: amount,
        jobTitle: job.title,
        dest,
      });
      await supabase.from("jobs").update({
        payout_ref: chargeId,
        payout_provider_id: providerId || null,
        payout_method: dest.method,
      }).eq("id", job_id);
      revalidatePath(`/jobs/${job_id}`);
      return { ok: true, info: `Payout of MWK ${amount.toLocaleString()} initiated. It will show as released once PayChangu confirms.` };
    } catch (e: any) {
      await supabase.from("jobs").update({
        payout_status: "failed",
        payout_error: String(e?.message || "unknown error").slice(0, 500),
      }).eq("id", job_id);
      revalidatePath(`/jobs/${job_id}`);
      return { error: `Payout failed: ${e?.message || "unknown error"}` };
    }
  }

  // Client asked to hold funds → initiate PayChangu checkout and redirect.
  // Webhook (+ server-side verification) is what actually flips to payment_held.
  if (job.escrow_status === "none" && next === "payment_held") {
    if (!job.accepted_bid_mwk || job.accepted_bid_mwk <= 0) {
      return { error: "Accept a proposal first — nothing to hold." };
    }
    const { initiatePayment } = await import("@/lib/payments");
    const { data: profile } = await supabase.from("profiles").select("email, full_name").eq("id", user.id).single();
    const email = profile?.email || user.email || "";
    const [firstName, ...rest] = (profile?.full_name || "Client").split(" ");
    // Prefill mobile from the client's own default saved method (if it's mobile).
    const { data: myDefault } = await supabase.from("payout_methods")
      .select("kind, mobile_number").eq("user_id", user.id).eq("is_default", true).maybeSingle();
    const prefillMobile = myDefault?.kind === "mobile" ? myDefault.mobile_number : undefined;
    try {
      const { checkoutUrl, txRef } = await initiatePayment({
        jobId: job.id,
        amountMwk: job.accepted_bid_mwk,
        email,
        firstName,
        lastName: rest.join(" ") || "-",
        title: job.title,
        mobile: prefillMobile || undefined,
      });
      await supabase.from("jobs").update({
        escrow_status: "payment_pending",
        payment_ref: txRef,
        payment_initiated_at: new Date().toISOString(),
      }).eq("id", job_id);
      redirect(checkoutUrl);
    } catch (e: any) {
      if (e?.digest?.startsWith?.("NEXT_REDIRECT")) throw e;
      return { error: `Could not start payment: ${e?.message || "unknown error"}` };
    }
  }

  const allowed = ESCROW_TRANSITIONS[job.escrow_status as EscrowStatus] || [];
  if (!allowed.includes(next)) return { error: `Cannot move payment from ${job.escrow_status} to ${next}` };

  // Cancelling a pending payment also releases the pinned acceptance so the
  // job doesn't stay locked to a proposal that never got paid for.
  const patch: Record<string, any> = { escrow_status: next };
  if (job.escrow_status === "payment_pending" && next === "none") {
    patch.pending_accept_proposal_id = null;
    patch.payment_ref = null;
  }
  const { error } = await supabase.from("jobs").update(patch).eq("id", job_id);
  if (error) return { error: error.message };

  const { data: acceptedProposal } = await supabase
    .from("proposals")
    .select("creative_id")
    .eq("job_id", job_id)
    .eq("status", "accepted")
    .maybeSingle();
  const creativeId = acceptedProposal?.creative_id;

  if (creativeId) {
    const labels: Record<EscrowStatus, string> = {
      none: "Payment cleared",
      payment_pending: "Payment pending confirmation",
      payment_held: "Payment held in escrow",
      payment_released: "Payment released",
      payment_disputed: "Payment flagged as disputed",
    };
    await supabase.from("notifications").insert({
      user_id: creativeId,
      kind: "message_received",
      title: labels[next],
      body: `Payment for "${job.title}" is now ${next.replace(/_/g, " ")}.`,
      link: `/jobs/${job_id}`,
      actor_id: user.id,
      target_type: "job",
      target_id: job_id,
    });
    await emailUser(supabase, creativeId, {
      subject: `${labels[next]}: ${job.title}`,
      heading: labels[next],
      body: `Payment for "${job.title}" is now ${next.replace(/_/g, " ")}.`,
      ctaText: "Open job",
      ctaPath: `/jobs/${job_id}`,
    });
  }

  revalidatePath(`/jobs/${job_id}`);
  return { ok: true };
}

export async function sendMessage(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };
  const thread_id = String(formData.get("thread_id"));
  const body = String(formData.get("body") || "").trim();

  const file = formData.get("attachment");
  let attachment_url: string | null = null;
  let attachment_name: string | null = null;
  let attachment_type: string | null = null;
  let attachment_size: number | null = null;
  if (file instanceof File && file.size > 0) {
    if (file.size > 25 * 1024 * 1024) return { error: "File too large (max 25MB)." };
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${thread_id}/${crypto.randomUUID()}_${safeName}`;
    const { error: upErr } = await supabase.storage
      .from("job-files")
      .upload(path, file, { contentType: file.type || undefined });
    if (upErr) return { error: upErr.message };
    // Private bucket: store the object path; the thread page mints a
    // short-lived signed URL at render time (participants only).
    attachment_url = path;
    attachment_name = file.name;
    attachment_type = file.type || null;
    attachment_size = file.size;
  }

  if (!body && !attachment_url) return { error: "Type a message or attach a file." };

  const { error } = await supabase.from("messages").insert({
    thread_id,
    sender_id: user.id,
    body: body || null,
    attachment_url,
    attachment_name,
    attachment_type,
    attachment_size,
  });
  if (error) return { error: error.message };

  const { data: thread } = await supabase
    .from("message_threads")
    .select("client_id, creative_id")
    .eq("id", thread_id)
    .single();
  if (thread) {
    const recipient = thread.client_id === user.id ? thread.creative_id : thread.client_id;
    const { data: me } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
    const previewSource = body || (attachment_name ? `📎 ${attachment_name}` : "");
    const preview = previewSource.length > 80 ? previewSource.slice(0, 80) + "…" : previewSource;
    await supabase.from("notifications").insert({
      user_id: recipient,
      kind: "message_received",
      title: `New message from ${me?.full_name || "someone"}`,
      body: preview,
      link: `/messages/${thread_id}`,
      actor_id: user.id,
      target_type: "thread",
      target_id: thread_id,
    });
    await emailUser(supabase, recipient, {
      subject: `New message from ${me?.full_name || "someone"}`,
      heading: `New message from ${me?.full_name || "someone"}`,
      body: preview,
      ctaText: "Open conversation",
      ctaPath: `/messages/${thread_id}`,
    });
  }
  revalidatePath(`/messages/${thread_id}`);
  return { ok: true };
}

export async function markNotificationRead(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);
  revalidatePath("/");
  return { ok: true };
}

export async function markAllNotificationsRead() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
  revalidatePath("/");
  return { ok: true };
}

export async function startThread(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };
  const creative_id = String(formData.get("creative_id"));
  const job_id = String(formData.get("job_id") || "") || null;
  const { data, error } = await supabase.from("message_threads")
    .upsert({ client_id: user.id, creative_id, job_id }, { onConflict: "client_id,creative_id,job_id" })
    .select("id").single();
  if (error) return { error: error.message };
  redirect(`/messages/${data.id}`);
}

export async function toggleSave(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };
  const target_type = String(formData.get("target_type")) as "job" | "creative";
  const target_id = String(formData.get("target_id"));

  const { data: existing } = await supabase
    .from("saved_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("target_type", target_type)
    .eq("target_id", target_id)
    .maybeSingle();

  if (existing) {
    await supabase.from("saved_items").delete().eq("id", existing.id);
    await supabase.from("interactions").insert({ user_id: user.id, target_type, target_id, kind: "unsave" });
  } else {
    await supabase.from("saved_items").insert({ user_id: user.id, target_type, target_id });
    await supabase.from("interactions").insert({ user_id: user.id, target_type, target_id, kind: "save" });
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/saved");
  revalidatePath("/browse");
  revalidatePath("/jobs");
  return { ok: true };
}

export async function recordView(target_type: "job" | "creative", target_id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("interactions").insert({ user_id: user.id, target_type, target_id, kind: "view" });
}

// Payout reconcile — the fallback for when PayChangu's webhook never arrives.
// Same pattern as /api/paychangu/callback for collections: re-verify server
// side, settle the job state ourselves. Safe to call repeatedly (idempotent).
//
// Callable two ways:
//   1. Auto: from the job page loader when payout_status='pending'.
//   2. Manual: from the "Refresh payout status" button in EscrowPanel.
export async function reconcilePayout(input: string | FormData): Promise<{ ok?: boolean; error?: string; info?: string }> {
  const job_id = typeof input === "string" ? input : String(input.get("job_id"));
  if (!job_id) return { error: "Missing job id." };

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "Server misconfig: SUPABASE_SERVICE_ROLE_KEY is not set." };
  }
  const { createServerClient } = await import("@supabase/ssr");
  const admin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data: job } = await admin.from("jobs")
    .select("id, escrow_status, payout_status, payout_method, payout_ref")
    .eq("id", job_id).maybeSingle();
  if (!job) return { error: "Job not found." };
  if (job.escrow_status === "payment_released") return { ok: true, info: "Already released." };
  if (job.payout_status !== "pending" || !job.payout_ref) {
    return { ok: true, info: "Nothing to reconcile." };
  }

  const { verifyPayout } = await import("@/lib/payments");
  const method = (job.payout_method === "bank" ? "bank" : "mobile") as "mobile" | "bank";
  const verified = await verifyPayout(job.payout_ref, method);

  if (verified.status === "success") {
    await admin.from("jobs").update({
      escrow_status: "payment_released",
      payout_status: null,
      payout_provider_id: verified.providerId || null,
      payout_amount_mwk: verified.amount ?? null,
      payout_fee_mwk: verified.fee ?? null,
    }).eq("id", job_id);
    revalidatePath(`/jobs/${job_id}`);
    return { ok: true, info: "Payout confirmed. Status updated to Released." };
  }
  if (verified.status === "failed") {
    await admin.from("jobs").update({
      payout_status: "failed",
      payout_error: "PayChangu reported failed payout.",
    }).eq("id", job_id);
    revalidatePath(`/jobs/${job_id}`);
    return { ok: true, info: "PayChangu reports the payout failed." };
  }
  return { ok: true, info: "PayChangu still shows the payout as pending. Try again in a minute." };
}


// ============================================================================
// Cancellation — Session D
// ============================================================================
//
// Every cancellation, from either side, is a REQUEST. Nothing moves without an
// admin confirming the split. Auto-splits are only used as a *suggestion* in
// the admin queue, never executed directly.

const CANCELLATION_MIN_REASON = 30;
const CANCELLABLE_STATUSES = new Set(["in_progress", "submitted", "revision_requested"]);

export async function requestCancellation(formData: FormData): Promise<{ ok?: boolean; error?: string; info?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const job_id = String(formData.get("job_id") || "");
  const reason = String(formData.get("reason") || "").trim();
  if (!job_id) return { error: "Missing job id." };
  if (reason.length < CANCELLATION_MIN_REASON) {
    return { error: `Reason too short — write at least ${CANCELLATION_MIN_REASON} characters explaining why.` };
  }

  const { data: job } = await supabase.from("jobs")
    .select("id, client_id, status, title")
    .eq("id", job_id).maybeSingle();
  if (!job) return { error: "Job not found." };
  if (!CANCELLABLE_STATUSES.has(job.status)) {
    return { error: `Cannot cancel a job in state '${job.status}'.` };
  }

  const { data: accepted } = await supabase.from("proposals")
    .select("creative_id").eq("job_id", job_id).eq("status", "accepted").maybeSingle();
  const creativeId = accepted?.creative_id;
  const isParty = user.id === job.client_id || user.id === creativeId;
  if (!isParty) return { error: "Only the client or the accepted creative can request cancellation." };

  const { error } = await supabase.from("jobs").update({
    status: "cancellation_requested",
    cancellation_reason: reason,
    cancellation_requested_by: user.id,
    cancellation_requested_at: new Date().toISOString(),
  }).eq("id", job_id);
  if (error) return { error: error.message };

  const otherParty = user.id === job.client_id ? creativeId : job.client_id;
  if (otherParty) {
    await supabase.from("notifications").insert({
      user_id: otherParty,
      kind: "message_received",
      title: "Cancellation requested",
      body: `The other party asked to cancel "${job.title}". An admin will review and decide the split.`,
      link: `/jobs/${job_id}`,
      actor_id: user.id,
      target_type: "job",
      target_id: job_id,
    });
  }

  revalidatePath(`/jobs/${job_id}`);
  revalidatePath("/admin/cancellations");
  return { ok: true, info: "Cancellation requested. An admin will review and settle the split." };
}

export async function adminResolveCancellation(formData: FormData): Promise<{ ok?: boolean; error?: string; info?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!me?.is_admin) return { error: "Admin only." };

  const job_id = String(formData.get("job_id") || "");
  const titleConfirm = String(formData.get("title_confirm") || "").trim();
  const clientPctRaw = Number(formData.get("client_pct"));
  const creativePctRaw = Number(formData.get("creative_pct"));
  if (!job_id) return { error: "Missing job id." };
  if (!Number.isFinite(clientPctRaw) || !Number.isFinite(creativePctRaw)) {
    return { error: "Enter both percentages as numbers." };
  }
  if (clientPctRaw < 0 || creativePctRaw < 0 || clientPctRaw + creativePctRaw > 100) {
    return { error: "Percentages must be 0–100 and sum to at most 100." };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return { error: "Server misconfig: SUPABASE_SERVICE_ROLE_KEY not set." };
  const { createServerClient } = await import("@supabase/ssr");
  const admin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data: job } = await admin.from("jobs")
    .select("id, title, client_id, accepted_bid_mwk, collection_amount_mwk, status")
    .eq("id", job_id).maybeSingle();
  if (!job) return { error: "Job not found." };
  if (job.status !== "cancellation_requested" && job.status !== "disputed") {
    return { error: `Cannot resolve cancellation on a job in state '${job.status}'.` };
  }
  if (titleConfirm !== job.title) {
    return { error: "Type the job title exactly to confirm this action." };
  }

  const { data: accepted } = await admin.from("proposals")
    .select("creative_id").eq("job_id", job_id).eq("status", "accepted").maybeSingle();
  const creativeId = accepted?.creative_id;
  if (!creativeId) return { error: "No accepted creative on this job — nothing to split." };

  const gross = job.collection_amount_mwk || job.accepted_bid_mwk || 0;
  const clientAmount = Math.floor(gross * (clientPctRaw / 100));
  const creativeAmount = Math.floor(gross * (creativePctRaw / 100));

  const { initiatePayout } = await import("@/lib/payments");

  const { data: clientPm } = await admin.from("payout_methods")
    .select("kind, mobile_number, mobile_network, bank_uuid, bank_account_name, bank_account_number")
    .eq("user_id", job.client_id).eq("is_default", true).maybeSingle();
  const { data: clientAuth } = await admin.auth.admin.getUserById(job.client_id);
  const { data: clientProfile } = await admin.from("profiles").select("full_name").eq("id", job.client_id).maybeSingle();

  const { data: creativePm } = await admin.from("payout_methods")
    .select("kind, mobile_number, mobile_network, bank_uuid, bank_account_name, bank_account_number")
    .eq("user_id", creativeId).eq("is_default", true).maybeSingle();
  const { data: creativeAuth } = await admin.auth.admin.getUserById(creativeId);
  const { data: creativeProfile } = await admin.from("profiles").select("full_name").eq("id", creativeId).maybeSingle();

  if (clientAmount > 0 && !clientPm) return { error: "Client has no default payout method — refund cannot execute. Ask them to add one." };
  if (creativeAmount > 0 && !creativePm) return { error: "Creative has no default payout method — cut cannot execute. Ask them to add one." };

  await admin.from("jobs").update({
    cancellation_resolved_by: user.id,
    cancellation_client_refund_mwk: clientAmount,
    cancellation_creative_cut_mwk: creativeAmount,
  }).eq("id", job_id);

  const buildDest = (pm: any, profile: any, auth: any) => {
    const email = auth?.user?.email || "";
    const [firstName, ...rest] = String(profile?.full_name || "User").split(" ");
    if (pm.kind === "mobile" && pm.mobile_number && (pm.mobile_network === "airtel" || pm.mobile_network === "tnm")) {
      return { method: "mobile" as const, number: pm.mobile_number, network: pm.mobile_network, firstName, lastName: rest.join(" ") || "-", email };
    }
    return { method: "bank" as const, bankUuid: pm.bank_uuid, accountName: pm.bank_account_name, accountNumber: pm.bank_account_number, email };
  };

  let clientRef: string | null = null;
  let clientStatus: string | null = null;
  if (clientAmount > 0) {
    try {
      const r = await initiatePayout({ jobId: job.id, amountMwk: clientAmount, jobTitle: `Refund: ${job.title}`, dest: buildDest(clientPm, clientProfile, clientAuth) });
      clientRef = r.chargeId; clientStatus = "pending";
    } catch (e: any) {
      await admin.from("jobs").update({ client_refund_status: "failed" }).eq("id", job_id);
      return { error: `Client refund payout failed: ${e?.message || "unknown"}. Job left in cancellation_requested — retry via admin.` };
    }
  }

  let creativeRef: string | null = null;
  let creativeStatus: string | null = null;
  if (creativeAmount > 0) {
    try {
      const r = await initiatePayout({ jobId: job.id, amountMwk: creativeAmount, jobTitle: `Cancellation cut: ${job.title}`, dest: buildDest(creativePm, creativeProfile, creativeAuth) });
      creativeRef = r.chargeId; creativeStatus = "pending";
    } catch (e: any) {
      await admin.from("jobs").update({
        client_refund_ref: clientRef, client_refund_status: clientStatus,
        creative_cut_status: "failed",
      }).eq("id", job_id);
      return { error: `Creative cut payout failed: ${e?.message || "unknown"}. Client refund already initiated (ref ${clientRef}). Retry creative leg manually.` };
    }
  }

  await admin.from("jobs").update({
    status: "cancelled",
    client_refund_ref: clientRef,
    client_refund_status: clientStatus,
    creative_cut_ref: creativeRef,
    creative_cut_status: creativeStatus,
  }).eq("id", job_id);

  revalidatePath(`/jobs/${job_id}`);
  revalidatePath("/admin/cancellations");
  return { ok: true, info: `Cancellation resolved. Refund ${clientAmount.toLocaleString()} to client, cut ${creativeAmount.toLocaleString()} to creative.` };
}

export async function adminRejectCancellation(formData: FormData): Promise<{ ok?: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!me?.is_admin) return { error: "Admin only." };

  const job_id = String(formData.get("job_id") || "");
  const revert_to = String(formData.get("revert_to") || "in_progress");
  if (!job_id) return { error: "Missing job id." };
  const allowed = new Set(["in_progress", "submitted", "revision_requested"]);
  if (!allowed.has(revert_to)) return { error: "Invalid revert target." };

  const { error } = await supabase.from("jobs").update({
    status: revert_to,
    cancellation_requested_by: null,
    cancellation_requested_at: null,
    cancellation_reason: null,
  }).eq("id", job_id).eq("status", "cancellation_requested");
  if (error) return { error: error.message };

  revalidatePath(`/jobs/${job_id}`);
  revalidatePath("/admin/cancellations");
  return { ok: true };
}


// ============================================================================
// Deadline extensions — mutual approval
// ============================================================================

export async function proposeDeadlineExtension(formData: FormData): Promise<{ ok?: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const job_id = String(formData.get("job_id") || "");
  const proposed_deadline = String(formData.get("proposed_deadline") || "");
  const reason = String(formData.get("reason") || "").trim();
  if (!job_id || !proposed_deadline) return { error: "Missing job id or proposed date." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(proposed_deadline)) return { error: "Invalid date format." };

  const { data: job } = await supabase.from("jobs").select("id, client_id, status").eq("id", job_id).maybeSingle();
  if (!job) return { error: "Job not found." };
  const { data: accepted } = await supabase.from("proposals")
    .select("creative_id").eq("job_id", job_id).eq("status", "accepted").maybeSingle();
  const creativeId = accepted?.creative_id;
  const isParty = user.id === job.client_id || user.id === creativeId;
  if (!isParty) return { error: "Only the client or accepted creative can propose an extension." };

  await supabase.from("deadline_extensions").update({ status: "superseded" })
    .eq("job_id", job_id).eq("status", "pending");

  const { error } = await supabase.from("deadline_extensions").insert({
    job_id,
    proposed_by: user.id,
    proposed_deadline,
    reason: reason || null,
    status: "pending",
  });
  if (error) return { error: error.message };

  const otherParty = user.id === job.client_id ? creativeId : job.client_id;
  if (otherParty) {
    await supabase.from("notifications").insert({
      user_id: otherParty,
      kind: "message_received",
      title: "Deadline extension proposed",
      body: `The other party proposed a new deadline: ${proposed_deadline}. Approve or decline on the job page.`,
      link: `/jobs/${job_id}`,
      actor_id: user.id,
      target_type: "job",
      target_id: job_id,
    });
  }
  revalidatePath(`/jobs/${job_id}`);
  return { ok: true };
}

export async function respondToDeadlineExtension(formData: FormData): Promise<{ ok?: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const extension_id = String(formData.get("extension_id") || "");
  const approve = String(formData.get("approve") || "") === "true";
  if (!extension_id) return { error: "Missing extension id." };

  const { data: ext } = await supabase.from("deadline_extensions")
    .select("id, job_id, proposed_by, proposed_deadline, status").eq("id", extension_id).maybeSingle();
  if (!ext) return { error: "Extension not found." };
  if (ext.status !== "pending") return { error: "This extension is no longer pending." };
  if (user.id === ext.proposed_by) return { error: "The other party approves, not the proposer." };

  const { data: job } = await supabase.from("jobs").select("client_id").eq("id", ext.job_id).maybeSingle();
  const { data: accepted } = await supabase.from("proposals")
    .select("creative_id").eq("job_id", ext.job_id).eq("status", "accepted").maybeSingle();
  const otherPartyIds = new Set([job?.client_id, accepted?.creative_id].filter(Boolean));
  if (!otherPartyIds.has(user.id)) return { error: "Not a party to this job." };

  if (approve) {
    await supabase.from("deadline_extensions").update({ status: "approved", responded_at: new Date().toISOString() }).eq("id", extension_id);
    await supabase.from("jobs").update({ deadline: ext.proposed_deadline }).eq("id", ext.job_id);
  } else {
    await supabase.from("deadline_extensions").update({ status: "declined", responded_at: new Date().toISOString() }).eq("id", extension_id);
  }
  revalidatePath(`/jobs/${ext.job_id}`);
  return { ok: true };
}
