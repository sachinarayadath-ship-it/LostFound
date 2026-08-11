import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ClipboardList,
  Handshake,
  Loader2,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/EmptyState";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { KindBadge, StatusBadge } from "@/components/StatusBadge";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/format";
import { claimsApi, itemsApi } from "@/services/api";
import { useAppSelector } from "@/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My dashboard · LostFound+" },
      {
        name: "description",
        content:
          "Track the reports you have posted and the claims you have made, and manage pending submissions.",
      },
      { property: "og:title", content: "My dashboard · LostFound+" },
      { property: "og:description", content: "Track your reports and claims in one place." },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  ),
});

function RowSkeletons() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}

function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const queryClient = useQueryClient();

  const reports = useQuery({ queryKey: ["myReports"], queryFn: itemsApi.myReports });
  const claims = useQuery({ queryKey: ["myClaims"], queryFn: claimsApi.mine });

  const remove = useMutation({
    mutationFn: (id: string) => itemsApi.remove(id),
    onSuccess: () => {
      toast.success("Report deleted.");
      void queryClient.invalidateQueries({ queryKey: ["myReports"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resolvedCount = reports.data?.filter((i) => i.status === "resolved").length ?? 0;
  const pendingCount = reports.data?.filter((i) => i.status === "pending").length ?? 0;

  return (
    <div className="container-page space-y-8 py-10">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-bold sm:text-4xl">Hi {user?.name ?? "there"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's happening with your reports and claims.
          </p>
        </div>
        <Button className="shrink-0" asChild>
          <Link to="/report">
            <PlusCircle className="size-4" /> New report
          </Link>
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={ClipboardList}
          label="My reports"
          value={reports.data?.length ?? "—"}
          hint={`${pendingCount} awaiting review`}
        />
        <StatCard
          icon={Handshake}
          label="My claims"
          value={claims.data?.length ?? "—"}
          tone="accent"
          hint="Across all items"
        />
        <StatCard
          icon={ClipboardList}
          label="Resolved"
          value={resolvedCount}
          tone="muted"
          hint="Items returned"
        />
      </div>

      <Tabs defaultValue="reports">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="reports" className="flex-1 sm:flex-none">
            My reports
          </TabsTrigger>
          <TabsTrigger value="claims" className="flex-1 sm:flex-none">
            My claims
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-5">
          {reports.isLoading ? (
            <RowSkeletons />
          ) : (reports.data?.length ?? 0) === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="You haven't reported anything yet"
              description="Report a lost or found item and it will show up here with live status tracking."
            />
          ) : (
            <div className="space-y-3">
              {reports.data!.map((item) => (
                <Card key={item._id} className="gap-0 p-4 shadow-card">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
                    <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-surface sm:size-20">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="size-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <KindBadge kind={item.kind} />
                        <StatusBadge status={item.status} />
                      </div>
                      <Link
                        to="/items/$itemId"
                        params={{ itemId: item._id }}
                        className="block truncate font-semibold hover:underline"
                      >
                        {item.title}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.category} · {item.location} · {formatDate(item.date)}
                      </p>
                    </div>
                    <div className="col-span-2 flex items-center gap-2 sm:col-span-1 sm:justify-end">
                      {item.status === "pending" ? (
                        <>
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/items/$itemId" params={{ itemId: item._id }}>
                              Edit
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => remove.mutate(item._id)}
                            disabled={remove.isPending}
                          >
                            {remove.isPending ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Trash2 className="size-4" />
                            )}
                            Delete
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/items/$itemId" params={{ itemId: item._id }}>
                            View
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="claims" className="mt-5">
          {claims.isLoading ? (
            <RowSkeletons />
          ) : (claims.data?.length ?? 0) === 0 ? (
            <EmptyState
              icon={Handshake}
              title="No claims yet"
              description="When you claim a found item, its verification progress appears here."
            />
          ) : (
            <div className="space-y-3">
              {claims.data!.map((claim) => (
                <Card key={claim._id} className="gap-0 p-4 shadow-card">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
                    <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-surface sm:size-20">
                      {claim.item.imageUrl ? (
                        <img src={claim.item.imageUrl} alt="" className="size-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <KindBadge kind={claim.item.kind} />
                        <StatusBadge status={claim.status} />
                      </div>
                      <Link
                        to="/items/$itemId"
                        params={{ itemId: claim.item._id }}
                        className="block truncate font-semibold hover:underline"
                      >
                        {claim.item.title}
                      </Link>
                      <p className="line-clamp-2 text-xs text-muted-foreground">“{claim.message}”</p>
                    </div>
                    <div className="col-span-2 flex items-center sm:col-span-1 sm:justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/items/$itemId" params={{ itemId: claim.item._id }}>
                          Open thread
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
