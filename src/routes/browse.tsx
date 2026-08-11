import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PackageSearch } from "lucide-react";
import { z } from "zod";

import { EmptyState } from "@/components/EmptyState";
import { FilterBar } from "@/components/FilterBar";
import { ItemCard, ItemCardSkeleton } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { itemsApi } from "@/services/api";
import type { FilterPatch, ItemFilters } from "@/types";

const searchSchema = z.object({
  q: z.string().optional(),
  kind: z.enum(["lost", "found"]).optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  status: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.number().optional(),
});

export const Route = createFileRoute("/browse")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Browse lost & found items · LostFound+" },
      {
        name: "description",
        content:
          "Search and filter community lost and found listings by category, location, date and status.",
      },
      { property: "og:title", content: "Browse lost & found items · LostFound+" },
      {
        property: "og:description",
        content: "Filter community listings by category, location, date and status.",
      },
    ],
  }),
  component: BrowsePage,
});

function BrowsePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const filters: ItemFilters = { ...search, limit: 9 };
  const kindTab = search.kind ?? "all";

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["items", filters],
    queryFn: () => itemsApi.list(filters),
    placeholderData: keepPreviousData,
  });

  const patch = (next: FilterPatch) => {
    void navigate({
      search: (prev: Record<string, unknown>) => {
        const merged: Record<string, unknown> = { ...prev, ...next };
        for (const key of Object.keys(merged)) {
          const value = merged[key];
          if (value === "" || value === "all" || value === undefined) delete merged[key];
        }
        return merged;
      },
    });
  };

  const reset = () => void navigate({ search: {} });

  const totalPages = data?.totalPages ?? 1;
  const page = data?.page ?? 1;

  return (
    <div className="container-page space-y-6 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold sm:text-4xl">Browse listings</h1>
        <p className="text-muted-foreground">
          {data ? `${data.total} item${data.total === 1 ? "" : "s"} match your filters.` : "Loading listings…"}
        </p>
      </header>

      <Tabs
        value={kindTab}
        onValueChange={(v) =>
          patch({ kind: v === "all" ? undefined : (v as "lost" | "found"), page: 1 })
        }
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="all" className="flex-1 sm:flex-none">
            All items
          </TabsTrigger>
          <TabsTrigger value="lost" className="flex-1 sm:flex-none">
            Lost items
          </TabsTrigger>
          <TabsTrigger value="found" className="flex-1 sm:flex-none">
            Found items
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <FilterBar filters={filters} onChange={patch} onReset={reset} />

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ItemCardSkeleton key={i} />
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <div
            className={`grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? "opacity-60" : ""}`}
          >
            {data.data.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => patch({ page: page - 1 })}
            >
              Previous
            </Button>
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => patch({ page: page + 1 })}
            >
              Next
            </Button>
          </div>
        </>
      ) : (
        <EmptyState
          icon={PackageSearch}
          title="No items match those filters"
          description="Try widening the date range, clearing the category, or searching a simpler keyword."
          action="Reset filters"
          onAction={reset}
        />
      )}
    </div>
  );
}
