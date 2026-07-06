"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

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

  const categories = String(formData.get("categories") || "")
    .split(",").map((s) => s.trim()).filter(Boolean);
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
  const categories = String(formData.get("categories") || "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const skills = String(formData.get("skills") || "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const piece_title = String(formData.get("piece_title") || "").trim();
  const piece_description = String(formData.get("piece_description") || "").trim();
  const piece_cover_url = String(formData.get("piece_cover_url") || "").trim() || null;
  const piece_project_url = String(formData.get("piece_project_url") || "").trim() || null;
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
  const categories = String(formData.get("categories") || "")
    .split(",").map((s) => s.trim()).filter(Boolean);

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

  const { data, error } = await supabase.from("jobs").insert({
    client_id: user.id,
    title: String(formData.get("title")),
    brief: String(formData.get("brief")),
    budget_mwk: Number(formData.get("budget_mwk")) || null,
    category: String(formData.get("category")),
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
  const { error } = await supabase.from("proposals").update({ status }).eq("id", id);
  if (error) return { error: error.message };

  const { data: proposal } = await supabase
    .from("proposals")
    .select("creative_id, job_id, job:jobs(title, client_id)")
    .eq("id", id)
    .single();
  if (proposal) {
    const job: any = Array.isArray(proposal.job) ? proposal.job[0] : proposal.job;
    if (status === "accepted") {
      await supabase.from("jobs").update({ status: "scope_pending" }).eq("id", proposal.job_id);
    }
    await supabase.from("notifications").insert({
      user_id: proposal.creative_id,
      kind: status === "accepted" ? "proposal_accepted" : "proposal_declined",
      title: status === "accepted" ? "Proposal accepted" : "Proposal declined",
      body: `Your proposal on "${job?.title || "a job"}" was ${status}.`,
      link: `/jobs/${proposal.job_id}`,
      actor_id: job?.client_id || null,
      target_type: "job",
      target_id: proposal.job_id,
    });
    await emailUser(supabase, proposal.creative_id, {
      subject: `Your proposal was ${status}`,
      heading: status === "accepted" ? "Your proposal was accepted" : "Your proposal was declined",
      body: `Your proposal on "${job?.title || "a job"}" was ${status}.${status === "accepted" ? " Start the conversation with your client on Ganyu Hub." : ""}`,
      ctaText: status === "accepted" ? "Open job" : "See details",
      ctaPath: `/jobs/${proposal.job_id}`,
    });
  }
  revalidatePath("/jobs");
  if (proposal) revalidatePath(`/jobs/${proposal.job_id}`);
  return { ok: true };
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

type EscrowStatus = "none" | "payment_held" | "payment_released" | "payment_disputed";

const ESCROW_TRANSITIONS: Record<EscrowStatus, EscrowStatus[]> = {
  none: ["payment_held"],
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

  const { data: job } = await supabase.from("jobs").select("id, client_id, title, escrow_status").eq("id", job_id).single();
  if (!job) return { error: "Job not found" };
  if (user.id !== job.client_id) return { error: "Only the client controls payment state." };

  const allowed = ESCROW_TRANSITIONS[job.escrow_status as EscrowStatus] || [];
  if (!allowed.includes(next)) return { error: `Cannot move payment from ${job.escrow_status} to ${next}` };

  const { error } = await supabase.from("jobs").update({ escrow_status: next }).eq("id", job_id);
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
