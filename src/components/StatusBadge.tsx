import { cn } from "@/lib/utils";
import type { ClaimStatus, ItemStatus } from "@/types";

type Status = ItemStatus | ClaimStatus;

const MAP: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending review",
    className: "bg-status-pending text-status-pending-foreground",
  },
  open: { label: "Open", className: "bg-status-open text-status-open-foreground" },
  matched: { label: "Matched", className: "bg-status-matched text-status-matched-foreground" },
  claimed: {
    label: "Under review",
    className: "bg-status-matched text-status-matched-foreground",
  },
  approved: { label: "Approved", className: "bg-status-resolved text-status-resolved-foreground" },
  resolved: { label: "Resolved", className: "bg-status-resolved text-status-resolved-foreground" },
  rejected: { label: "Rejected", className: "bg-status-rejected text-status-rejected-foreground" },
};

export function StatusBadge({
  status,
  className,
  size = "sm",
}: {
  status: Status;
  className?: string;
  size?: "sm" | "md";
}) {
  const config = MAP[status] ?? MAP["open"]!;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full font-semibold whitespace-nowrap",
        size === "sm" ? "px-2.5 py-0.5 text-[0.7rem]" : "px-3 py-1 text-xs",
        config.className,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {config.label}
    </span>
  );
}

export function KindBadge({ kind }: { kind: "lost" | "found" }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold tracking-wide uppercase",
        kind === "lost"
          ? "bg-primary/10 text-primary"
          : "bg-accent/15 text-accent-foreground/90 text-accent",
      )}
    >
      {kind}
    </span>
  );
}
