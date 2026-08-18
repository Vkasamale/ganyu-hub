import { describe, it, expect } from "vitest";
import { JsonLd } from "@/components/json-ld";

// The only non-trivial thing this component does is escape `<`. A job brief is
// user-written text, so a brief containing a closing script tag would otherwise
// end the <script> early and put the rest of the brief into the document as
// live markup.
describe("JsonLd", () => {
  const html = (data: Record<string, unknown>) =>
    (JsonLd({ data }).props as { dangerouslySetInnerHTML: { __html: string } }).dangerouslySetInnerHTML.__html;

  it("escapes markup in user-written values", () => {
    const out = html({ "@type": "JobPosting", description: "</script><img src=x onerror=alert(1)>" });
    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<img");
    expect(JSON.parse(out.replace(/\\u003c/g, "<")).description).toContain("</script>");
  });

  it("stamps the context and keeps the caller's fields", () => {
    const parsed = JSON.parse(html({ "@type": "Person", name: "Adam" }));
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed["@type"]).toBe("Person");
    expect(parsed.name).toBe("Adam");
  });
});
