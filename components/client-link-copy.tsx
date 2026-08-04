"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ClientLinkCopy({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/j/${token}` : `/j/${token}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.getElementById("client-link-input") as HTMLInputElement | null;
      el?.select();
    }
  }

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-amber-900">Waiting for your client to join</div>
          <div className="text-xs text-amber-800/80">
            Send them this private link. When they open it, they&rsquo;ll sign up and fund escrow.
          </div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <input
          id="client-link-input"
          readOnly
          value={url}
          className="flex-1 truncate rounded-md border border-amber-300 bg-white px-3 py-2 font-mono text-xs"
          onFocus={(e) => e.currentTarget.select()}
        />
        <Button type="button" onClick={copy} size="sm">
          {copied ? "Copied!" : "Copy link"}
        </Button>
      </div>
    </div>
  );
}
