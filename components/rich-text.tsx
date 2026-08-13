import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

/**
 * Item 69 (§G8) — formatted job briefs and descriptions.
 *
 * **What is stored is markdown TEXT, never HTML.** That is the whole security
 * design. A job brief is written by a stranger and read by every creative who
 * opens the job, so storing HTML would hand anyone an XSS vector aimed at the
 * exact people we are asking to trust us with an evening's unpaid work.
 *
 * Two layers, deliberately:
 *   1. We store plain text, so nothing dangerous is ever persisted.
 *   2. rehype-sanitize runs at RENDER anyway, on the default strict schema,
 *      because old rows and future writers are not covered by layer 1.
 *
 * `react-markdown` never uses dangerouslySetInnerHTML — it builds React
 * elements — so raw HTML in the source is inert before sanitising even runs.
 *
 * ponytail: no editor toolbar. A toolbar is a component to build, style, keep
 * accessible and test; the syntax people already use in WhatsApp (a dash for a
 * bullet, a blank line for a paragraph) covers what a brief needs, and the
 * wizard shows a live preview so nobody has to imagine the result.
 */
export function RichText({ children, className = "" }: { children: string | null; className?: string }) {
  if (!children || !children.trim()) return null;

  return (
    <div
      className={
        "space-y-3 text-sm leading-relaxed text-ink/75 " +
        "[&_a]:text-brand-dark [&_a]:underline [&_a]:underline-offset-2 " +
        "[&_strong]:font-semibold [&_strong]:text-ink " +
        "[&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-ink " +
        "[&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-ink " +
        "[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-ink " +
        "[&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 " +
        "[&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 " +
        "[&_blockquote]:border-l-2 [&_blockquote]:border-ink/15 [&_blockquote]:pl-3 [&_blockquote]:text-ink/60 " +
        "[&_code]:rounded [&_code]:bg-ink/[0.06] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs " +
        "[&_table]:block [&_table]:overflow-x-auto [&_td]:border [&_td]:border-ink/10 [&_td]:px-2 [&_td]:py-1 " +
        "[&_th]:border [&_th]:border-ink/10 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left " +
        className
      }
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          // Links in user-written text point wherever the author chose, so
          // they open in a new tab and drop the referrer and any window handle
          // back to us.
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer nofollow ugc">
              {children}
            </a>
          ),
        }}
      >
        {children}
      </Markdown>
    </div>
  );
}
