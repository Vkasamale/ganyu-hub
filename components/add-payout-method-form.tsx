"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { addPayoutMethod } from "@/app/actions";

type Bank = { uuid: string; name: string };

export function AddPayoutMethodForm({ banks }: { banks: Bank[] }) {
  const [kind, setKind] = useState<"mobile" | "bank">("mobile");

  return (
    <SavingForm action={addPayoutMethod} successText="Payment method added." resetOnSuccess className="space-y-4">
      <input type="hidden" name="kind" value={kind} />

      <div className="inline-flex rounded-lg border border-ink/20 bg-paper p-1">
        <button
          type="button"
          onClick={() => setKind("mobile")}
          className={`rounded-md px-3 py-1.5 text-sm ${kind === "mobile" ? "bg-ink text-paper" : "text-ink/70"}`}
        >
          Mobile money
        </button>
        <button
          type="button"
          onClick={() => setKind("bank")}
          className={`rounded-md px-3 py-1.5 text-sm ${kind === "bank" ? "bg-ink text-paper" : "text-ink/70"}`}
        >
          Bank account
        </button>
      </div>

      {kind === "mobile" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px]">
          <div className="space-y-1.5">
            <Label htmlFor="mobile_number">Number</Label>
            <Input id="mobile_number" name="mobile_number" placeholder="e.g. 099XXXXXXX" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mobile_network">Network</Label>
            <select id="mobile_network" name="mobile_network" defaultValue="" className="h-10 w-full rounded-lg border border-ink/20 bg-paper px-3 text-sm text-ink focus:border-ink/40 focus:outline-none">
              <option value="">Select…</option>
              <option value="airtel">Airtel Money</option>
              <option value="tnm">TNM Mpamba</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="bank_uuid">Bank</Label>
            <select id="bank_uuid" name="bank_uuid" defaultValue="" className="h-10 w-full rounded-lg border border-ink/20 bg-paper px-3 text-sm text-ink focus:border-ink/40 focus:outline-none">
              <option value="">Select bank…</option>
              {banks.map((b) => (
                <option key={b.uuid} value={b.uuid}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bank_account_name">Account name</Label>
            <Input id="bank_account_name" name="bank_account_name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bank_account_number">Account number</Label>
            <Input id="bank_account_number" name="bank_account_number" />
          </div>
          <p className="text-xs text-ink/50">Bank payouts may need PayChangu support to activate. Mobile money works out of the box.</p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="label">Nickname (optional)</Label>
        <Input id="label" name="label" placeholder="e.g. Personal, Business" />
      </div>

      <SubmitButton pendingText="Adding…">Add payment method</SubmitButton>
    </SavingForm>
  );
}
