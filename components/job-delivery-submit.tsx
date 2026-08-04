"use client";

import { useRef, useState } from "react";
import { submitDelivery } from "@/app/actions";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT =
  "image/*,application/pdf,application/zip,application/x-zip-compressed," +
  ".psd,.ai,.sketch,.fig,.xd,.svg,.eps,.tif,.tiff,.mp4,.mov,.doc,.docx,.ppt,.pptx,.xls,.xlsx";

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function JobDeliverySubmit({ jobId }: { jobId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [link, setLink] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFileError(null);
    if (!f) { setFile(null); return; }
    if (f.size > MAX_BYTES) {
      // Client-side reject before any upload attempt.
      setFileError(`"${f.name}" is ${fmtBytes(f.size)} — over the 10MB limit. Paste an external link below instead.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFile(null);
      return;
    }
    setFile(f);
  }

  const canSubmit = (file !== null) !== (link.trim().length > 0); // XOR

  return (
    <Card className="mt-6">
      <CardContent className="p-5">
        <p className="text-sm font-medium text-ink">Send delivery</p>
        <p className="mt-1 text-xs text-ink/60">
          Attach a file (up to 10MB) or paste a link for anything larger. The client is notified either way.
        </p>

        <SavingForm action={submitDelivery} successText="Delivery sent." resetOnSuccess className="mt-4 space-y-4">
          <input type="hidden" name="job_id" value={jobId} />

          <div className="space-y-1.5">
            <Label htmlFor="delivery_file">File (up to 10MB)</Label>
            <Input
              id="delivery_file"
              name="delivery_file"
              type="file"
              accept={ACCEPT}
              ref={fileInputRef}
              onChange={onPickFile}
              disabled={link.trim().length > 0}
            />
            {file && !fileError && (
              <p className="text-xs text-ink/60">Selected: {file.name} ({fmtBytes(file.size)})</p>
            )}
            {fileError && (
              <p className="text-xs text-red-600">{fileError}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="external_link">
              For files over 10MB, share a Google Drive, WeTransfer, or Dropbox link
            </Label>
            <Input
              id="external_link"
              name="external_link"
              type="url"
              inputMode="url"
              placeholder="https://drive.google.com/…"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              disabled={file !== null}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="delivery_note">Note (optional)</Label>
            <Textarea
              id="delivery_note"
              name="note"
              rows={2}
              placeholder="What did you deliver? Anything the client should look at first?"
            />
          </div>

          <SubmitButton pendingText="Sending…" disabled={!canSubmit}>
            Send delivery
          </SubmitButton>
          {!canSubmit && (
            <p className="text-xs text-ink/50">
              Attach a file <em>or</em> paste a link — one, not both.
            </p>
          )}
        </SavingForm>
      </CardContent>
    </Card>
  );
}
