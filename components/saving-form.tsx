"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Result = { ok?: boolean; error?: string; info?: string } | null | void;

type ServerAction = (formData: FormData) => Promise<Result>;

export function SavingForm({
  action,
  children,
  successText = "Saved.",
  resetOnSuccess = false,
  className,
}: {
  action: ServerAction;
  children: React.ReactNode;
  successText?: string;
  resetOnSuccess?: boolean;
  className?: string;
  silent?: boolean;
}) {
  const boundAction = async (_prev: Result, formData: FormData): Promise<Result> => {
    return await action(formData);
  };
  const [state, formAction] = useActionState(boundAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    const s = state as { ok?: boolean; error?: string; info?: string } | null;
    if (s?.ok) {
      if (!silent) toast.success(s.info ?? successText);
      router.refresh();
      if (resetOnSuccess && formRef.current) formRef.current.reset();
    } else if (s?.error) {
      if (!silent) toast.error(s.error);
    }
  }, [state, resetOnSuccess, successText, router, silent]);

  const s = state as { ok?: boolean; error?: string; info?: string } | null;

  return (
    <form ref={formRef} action={formAction} className={className}>
      {children}
      {s?.ok && !silent && (
        <p className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          ✓ {s.info ?? successText}
        </p>
      )}
      {s?.error && !silent && (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {s.error}
        </p>
      )}
    </form>
  );
}

export function SubmitButton({
  children = "Save",
  pendingText = "Saving…",
  ...rest
}: React.ComponentProps<typeof Button> & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...rest}>
      <span className="inline-flex items-center gap-2">
        {pending && (
          <span
            className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
        )}
        {pending ? pendingText : children}
      </span>
    </Button>
  );
}
