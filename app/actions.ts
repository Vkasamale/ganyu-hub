"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function signIn(formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const categories = String(formData.get("categories") || "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const skills = String(formData.get("skills") || "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const hourly_rate_mwk = Number(formData.get("hourly_rate_mwk")) || null;

  const { error } = await supabase.from("profiles").update({
    full_name: String(formData.get("full_name") || ""),
    headline: String(formData.get("headline") || ""),
    bio: String(formData.get("bio") || ""),
    location: String(formData.get("location") || "Malawi"),
    hourly_rate_mwk,
    categories,
    skills,
  }).eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/profile");
  revalidatePath(`/creatives/${user.id}`);
  return { ok: true };
}

export async function addPortfolioItem(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { error } = await supabase.from("portfolio_items").insert({
    profile_id: user.id,
    title: String(formData.get("title")),
    description: String(formData.get("description") || ""),
    cover_url: String(formData.get("cover_url") || "") || null,
    project_url: String(formData.get("project_url") || "") || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/portfolio");
  revalidatePath(`/creatives/${user.id}`);
  return { ok: true };
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
  }
  revalidatePath("/jobs");
  return { ok: true };
}

export async function sendMessage(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };
  const thread_id = String(formData.get("thread_id"));
  const body = String(formData.get("body"));
  const { error } = await supabase.from("messages").insert({
    thread_id,
    sender_id: user.id,
    body,
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
    const preview = body.length > 80 ? body.slice(0, 80) + "…" : body;
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
