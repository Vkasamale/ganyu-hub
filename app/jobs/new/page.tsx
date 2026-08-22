import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { postJob } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingForm } from "@/components/saving-form";
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
          {/* Three steps, per the design screens. SavingForm is still the
              <form>, so postJob, the pending state and the error-refill
              behaviour (BUG-016) are all unchanged. "How the money works" now
              lives on step 2 instead of above the whole form. */}
          <SavingForm action={postJob} successText="Job posted.">
            <JobWizard />
          </SavingForm>
        </CardContent>
      </Card>
    </div>
  );
}
