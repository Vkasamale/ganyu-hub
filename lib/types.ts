export type Role = "client" | "creative" | "agency";

export type Availability = "available" | "busy" | "unavailable";

export type Profile = {
  id: string;
  role: Role;
  full_name: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  hourly_rate_mwk: number | null;
  avatar_url: string | null;
  categories: string[] | null;
  skills: string[] | null;
  availability?: Availability | null;
  created_at: string;
};

export type PortfolioItem = {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  project_url: string | null;
  created_at: string;
};

export type Service = {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  price_mwk: number;
  delivery_days: number;
  created_at: string;
};

export type JobStatus = "open" | "in_progress" | "completed" | "cancelled";
export type Job = {
  id: string;
  client_id: string;
  title: string;
  brief: string;
  budget_mwk: number | null;
  category: string;
  status: JobStatus;
  proposal_limit?: number | null;
  created_at: string;
};

export type ProposalStatus = "pending" | "accepted" | "declined" | "withdrawn";
export type Proposal = {
  id: string;
  job_id: string;
  creative_id: string;
  cover_letter: string;
  bid_mwk: number;
  status: ProposalStatus;
  created_at: string;
};

export type MessageThread = {
  id: string;
  client_id: string;
  creative_id: string;
  job_id: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export const CATEGORIES = [
  "Design",
  "Development",
  "Video & Photography",
  "Content Creation",
  "Writing",
  "Marketing",
] as const;
