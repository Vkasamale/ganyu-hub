"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { adminResolveError } from "@/app/actions";

export function ResolveErrorForm({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return <Button size="sm" variant="outline" type="button" onClick={() => setOpen(true)}>Mark resolved</Button>;
  }
  return (
    <SavingForm action={adminResolveError} successText="Resolved.">
      <input type="hidden" name="id" value={id} />
      <Textarea name="note" rows={2} placeholder="Resolution note (optional)" className="bg-white" />
      <div className="flex gap-2 mt-2">
        <SubmitButton pendingText="Resolving…">Confirm</SubmitButton>
        <Button size="sm" variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </SavingForm>
  );
}
