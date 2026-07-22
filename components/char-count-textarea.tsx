"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export function CharCountTextarea({
  id,
  name,
  minLength,
  rows,
  placeholder,
  required,
  defaultValue = "",
}: {
  id: string;
  name: string;
  minLength: number;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const count = value.length;
  const met = count >= minLength;
  return (
    <>
      <Textarea
        id={id}
        name={name}
        required={required}
        rows={rows}
        minLength={minLength}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <p className={`mt-1 text-xs ${met ? "text-ink/50" : "text-ink/70"}`}>
        {count}/{minLength}
      </p>
    </>
  );
}
