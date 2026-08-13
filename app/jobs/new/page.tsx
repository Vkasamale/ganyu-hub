import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { postJob } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingForm } from "@/components/saving-form";
import { PricingExplainer } from "@/components/pricing-explainer";
import { JobWizard } from "@/components/job-wizard";

export default async function NewJobPage() {
  const supabase = createClient();
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader><CardTitle>Post a job</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-4">
            <PricingExplainer audience="client" />
          </div>
          {/* Phase 8: the eight-field wall became three steps. SavingForm is
              still the <form>, so postJob, the pending state and the
              error-refill behaviour (BUG-016) are all unchanged. */}
          <SavingForm action={postJob} successText="Job posted.">
            <JobWizard />
          </SavingForm>
        </CardContent>
      </Card>
    </div>
  );
}
