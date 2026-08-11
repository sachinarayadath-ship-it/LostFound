import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "primary" | "accent" | "muted";
}) {
  return (
    <Card className="gap-3 p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="font-display mt-1.5 text-2xl font-bold sm:text-3xl">{value}</p>
        </div>
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl",
            tone === "primary" && "bg-primary/10 text-primary",
            tone === "accent" && "bg-accent/15 text-accent",
            tone === "muted" && "bg-surface text-muted-foreground",
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}
