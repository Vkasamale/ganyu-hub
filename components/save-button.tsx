"use client";
import { useState, useTransition } from "react";
import { toggleSave } from "@/app/actions";
import { PopScale } from "@/components/animated";

export function SaveButton({ targetType, targetId, saved }: { targetType: "job" | "creative"; targetId: string; saved: boolean }) {
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState(saved);
  const [bump, setBump] = useState(0);
  return (
    <form
      action={(fd) => {
        setOptimistic((v) => !v);
        setBump((b) => b + 1);
        startTransition(() => { void toggleSave(fd); });
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <input type="hidden" name="target_type" value={targetType} />
      <input type="hidden" name="target_id" value={targetId} />
      <button
        type="submit"
        aria-label={optimistic ? "Unsave" : "Save"}
        disabled={pending}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm transition ${
          optimistic ? "border-brand bg-brand text-white" : "border-neutral-300 bg-white text-neutral-500 hover:border-brand hover:text-brand"
        }`}
      >
        <PopScale active={bump > 0} key={bump}>
          {optimistic ? "♥" : "♡"}
        </PopScale>
      </button>
    </form>
  );
}
