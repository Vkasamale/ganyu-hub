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
  revalidatePath(`/jobs/${job_id}`);
  return { ok: true };
}

export async function decideProposal(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("proposal_id"));
  const status = String(formData.get("status")) as "accepted" | "declined";
  const { error } = await supabase.from("proposals").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/jobs");
  return { ok: true };
}

export async function sendMessage(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };
  const thread_id = String(formData.get("thread_id"));
  const { error } = await supabase.from("messages").insert({
    thread_id,
    sender_id: user.id,
    body: String(formData.get("body")),
  });
  if (error) return { error: error.message };
  revalidatePath(`/messages/${thread_id}`);
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
