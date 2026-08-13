"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

// Number field that shows thousands separators as you type (1,000 not 1000) but
// submits the raw digits. The visible input is unnamed; a hidden input carries
// the plain number under {name} so server parsing (Number(...)) is unchanged.
export function MoneyInput({
  name,
  id,
  required,
  placeholder,
  defaultValue,
  onValueChange,
}: {
  name: string;
  id?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: number | null;
  /** Optional: lets a parent react to the raw digits — e.g. the job wizard's
   *  live preview. Omitted elsewhere, so existing uses are unchanged. */
  onValueChange?: (raw: string) => void;
}) {
  const [raw, setRaw] = useState<string>(defaultValue != null ? String(defaultValue) : "");
  const display = raw === "" ? "" : Number(raw).toLocaleString("en-US");

  return (
    <>
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        required={required}
        placeholder={placeholder}
        value={display}
        onChange={(e) => {
          const next = e.target.value.replace(/[^\d]/g, "");
          setRaw(next);
          onValueChange?.(next);
        }}
      />
      <input type="hidden" name={name} value={raw} />
    </>
  );
}
