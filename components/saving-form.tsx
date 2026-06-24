"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type Result = { ok?: boolean; error?: string } | null | void;

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
}) {
  const boundAction = async (_prev: Result, formData: FormData): Promise<Result> => {
    return await action(formData);
  };
  const [state, formAction] = useFormState(boundAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && (state as any).ok && resetOnSuccess && formRef.current) {
      formRef.current.reset();
    }
  }, [state, resetOnSuccess]);

  const s = state as { ok?: boolean; error?: string } | null;

  return (
    <form ref={formRef} action={formAction} className={className}>
      {children}
      {s?.ok && (
        <p className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          ✓ {successText}
        </p>
      )}
      {s?.error && (
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
      {pending ? pendingText : children}
    </Button>
  );
}
