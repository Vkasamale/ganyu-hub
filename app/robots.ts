import type { MetadataRoute } from "next";
import { absUrl } from "@/lib/site-url";

/**
 * Worth having now that ganyuhub.com is live (BACKLOG "Domain unlocked" §4).
 *
 * The disallow list is the point, not the allow: /dashboard, /messages and the
 * testimonial token links are either private or single-use. /t/ especially —
 * those tokens are the whole authentication for that form.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/messages", "/t/", "/auth/", "/api/"],
    },
    sitemap: absUrl("/sitemap.xml"),
  };
}
