import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, LOCATIONS, type FilterPatch, type ItemFilters } from "@/types";

const STATUSES = [
  { value: "all", label: "Any status" },
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending review" },
  { value: "matched", label: "Matched" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

export function FilterBar({
  filters,
  onChange,
  onReset,
}: {
  filters: ItemFilters;
  onChange: (patch: FilterPatch) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-card sm:p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="relative min-w-0">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.q ?? ""}
            onChange={(e) => onChange({ q: e.target.value, page: 1 })}
            placeholder="Search by keyword, brand, colour…"
            className="pl-9"
            aria-label="Search items"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={onReset} className="shrink-0">
          <X className="size-4" /> Reset
        </Button>
      </div>

      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <SlidersHorizontal className="size-3.5" /> Filters
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Category</Label>
          <Select
            value={filters.category ?? "all"}
            onValueChange={(v) => onChange({ category: v, page: 1 })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any category</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Location</Label>
          <Select
            value={filters.location ?? "all"}
            onValueChange={(v) => onChange({ location: v, page: 1 })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Anywhere" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Anywhere</SelectItem>
              {LOCATIONS.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select
            value={filters.status ?? "all"}
            onValueChange={(v) => onChange({ status: v, page: 1 })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any status" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="from">
              From
            </Label>
            <Input
              id="from"
              type="date"
              value={filters.from ?? ""}
              onChange={(e) => onChange({ from: e.target.value, page: 1 })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="to">
              To
            </Label>
            <Input
              id="to"
              type="date"
              value={filters.to ?? ""}
              onChange={(e) => onChange({ to: e.target.value, page: 1 })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
