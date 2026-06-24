import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMwk, timeAgo } from "@/lib/utils";
import type { Job } from "@/lib/types";

export function JobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="transition hover:border-brand">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold">{job.title}</p>
            <Badge>{job.category}</Badge>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{job.brief}</p>
          <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
            <span>Budget: {formatMwk(job.budget_mwk)}</span>
            <span>{timeAgo(job.created_at)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
