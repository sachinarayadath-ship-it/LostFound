import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, MessageSquare } from "lucide-react";

import { KindBadge, StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import type { Item } from "@/types";

export function ItemCard({ item }: { item: Item }) {
  return (
    <Card className="group overflow-hidden p-0 shadow-card transition-shadow hover:shadow-lift">
      <Link to="/items/$itemId" params={{ itemId: item._id }} className="block">
        <div className="relative aspect-4/3 overflow-hidden bg-surface">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid size-full place-items-center text-xs text-muted-foreground">
              No photo provided
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <KindBadge kind={item.kind} />
          </div>
          <div className="absolute top-3 right-3">
            <StatusBadge status={item.status} />
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div className="min-w-0 space-y-1">
            <p className="text-[0.7rem] font-semibold tracking-wide text-primary uppercase">
              {item.category}
            </p>
            <h3 className="line-clamp-2 text-base leading-snug font-semibold">{item.title}</h3>
          </div>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p className="flex min-w-0 items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{item.location}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 shrink-0" />
              {formatDate(item.date)}
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
            <span className="truncate">by {item.reporter.name}</span>
            <span className="flex shrink-0 items-center gap-1">
              <MessageSquare className="size-3.5" />
              {item.claimCount} claims
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}

export function ItemCardSkeleton() {
  return (
    <Card className="overflow-hidden p-0">
      <Skeleton className="aspect-4/3 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </Card>
  );
}
