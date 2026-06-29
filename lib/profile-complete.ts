export type ProfileCompletenessInput = {
  headline?: string | null;
  bio?: string | null;
};

export type CompletenessResult = {
  complete: boolean;
  missing: { key: "headline" | "bio" | "portfolio" | "services"; label: string; href: string }[];
};

export function checkProfileComplete(
  profile: ProfileCompletenessInput,
  portfolioCount: number,
  serviceCount: number,
): CompletenessResult {
  const missing: CompletenessResult["missing"] = [];
  if (!profile.headline || !profile.headline.trim()) {
    missing.push({ key: "headline", label: "Add a headline", href: "/dashboard/account" });
  }
  if (!profile.bio || !profile.bio.trim()) {
    missing.push({ key: "bio", label: "Write a short bio", href: "/dashboard/account" });
  }
  if (portfolioCount < 1) {
    missing.push({ key: "portfolio", label: "Add a portfolio item", href: "/dashboard/portfolio" });
  }
  if (serviceCount < 1) {
    missing.push({ key: "services", label: "List a service on your rate card", href: "/dashboard/services" });
  }
  return { complete: missing.length === 0, missing };
}
