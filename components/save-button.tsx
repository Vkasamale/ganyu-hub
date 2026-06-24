"use client";
import { useTransition } from "react";
import { toggleSave } from "@/app/actions";

export function SaveButton({ targetType, targetId, saved }: { targetType: "job" | "creative"; targetId: string; saved: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <form
      action={(fd) => startTransition(() => toggleSave(fd))}
      onClick={(e) => e.stopPropagation()}
    >
      <input type="hidden" name="target_type" value={targetType} />
      <input type="hidden" name="target_id" value={targetId} />
      <button
        type="submit"
        aria-label={saved ? "Unsave" : "Save"}
        disabled={pending}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm transition ${
          saved ? "border-brand bg-brand text-white" : "border-neutral-300 bg-white text-neutral-500 hover:border-brand hover:text-brand"
        }`}
      >
        {saved ? "♥" : "♡"}
      </button>
    </form>
  );
}
