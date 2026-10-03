import Link from "next/link";
import { Button } from "./ui/button";

interface Props {
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ title, body, actionLabel, actionHref }: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">{body}</p>
      {actionLabel && actionHref && (
        <Button asChild className="mt-5">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
