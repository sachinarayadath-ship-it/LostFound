import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Percent,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { EmptyState } from "@/components/EmptyState";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StatCard } from "@/components/StatCard";
import { KindBadge, StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/format";
import { adminApi } from "@/services/api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Moderator console · LostFound+" },
      {
        name: "description",
        content:
          "Moderate reports, manage community members and review recovery analytics for LostFound+.",
      },
      { property: "og:title", content: "Moderator console · LostFound+" },
      { property: "og:description", content: "Moderate reports and review recovery analytics." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ProtectedRoute adminOnly>
      <AdminPage />
    </ProtectedRoute>
  ),
});

function AdminPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const analytics = useQuery({ queryKey: ["admin", "analytics"], queryFn: adminApi.analytics });
  const items = useQuery({
    queryKey: ["admin", "items", q, status],
    queryFn: () => adminApi.items(q ? { q, status } : { status }),
  });
  const users = useQuery({ queryKey: ["admin", "users"], queryFn: adminApi.users });

  const moderate = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "reject" | "resolve" }) =>
      adminApi.moderate(id, action),
    onSuccess: (_data, variables) => {
      toast.success(`Report ${variables.action}d.`);
      void queryClient.invalidateQueries({ queryKey: ["admin", "items"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: "user" | "admin" }) =>
      adminApi.setUserRole(id, role),
    onSuccess: () => {
      toast.success("Role updated.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const stats = analytics.data?.stats;

  return (
    <div className="container-page space-y-8 py-10">
      <header className="space-y-2">
        <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <ShieldCheck className="size-3.5" /> Moderator access
        </p>
        <h1 className="text-3xl font-bold sm:text-4xl">Admin console</h1>
        <p className="text-muted-foreground">
          Review submissions, manage members and keep an eye on recovery performance.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="Total items" value={stats?.reported ?? "—"} />
        <StatCard
          icon={CheckCircle2}
          label="Recovered"
          value={stats?.recovered ?? "—"}
          tone="accent"
        />
        <StatCard
          icon={Percent}
          label="Resolution rate"
          value={stats ? `${stats.resolutionRate}%` : "—"}
        />
        <StatCard
          icon={Clock}
          label="Pending reviews"
          value={stats?.pendingReviews ?? "—"}
          tone="muted"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card className="gap-4 p-6 shadow-card">
          <h2 className="text-base font-semibold">Reports vs recoveries</h2>
          <div className="h-64 w-full">
            {analytics.isLoading ? (
              <Skeleton className="size-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.data?.trends ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "0.75rem",
                      fontSize: "0.8rem",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="reported"
                    stroke="var(--color-chart-1)"
                    fill="var(--color-chart-1)"
                    fillOpacity={0.18}
                  />
                  <Area
                    type="monotone"
                    dataKey="recovered"
                    stroke="var(--color-chart-2)"
                    fill="var(--color-chart-2)"
                    fillOpacity={0.25}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="gap-4 p-6 shadow-card">
          <h2 className="text-base font-semibold">Top categories</h2>
          <div className="h-64 w-full">
            {analytics.isLoading ? (
              <Skeleton className="size-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.data?.categories ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={92}
                    stroke="var(--color-muted-foreground)"
                    fontSize={11}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "0.75rem",
                      fontSize: "0.8rem",
                    }}
                  />
                  <Bar dataKey="count" fill="var(--color-chart-1)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <Tabs defaultValue="reports">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="reports" className="flex-1 sm:flex-none">
            Reports
          </TabsTrigger>
          <TabsTrigger value="users" className="flex-1 sm:flex-none">
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search reports…"
              aria-label="Search reports"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["all", "pending", "open", "matched", "resolved", "rejected"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "Any status" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {items.isLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : (items.data?.data.length ?? 0) === 0 ? (
            <EmptyState title="No reports match" description="Try a different search or status." />
          ) : (
            <Card className="overflow-x-auto p-0 shadow-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.data!.data.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="max-w-56">
                        <Link
                          to="/items/$itemId"
                          params={{ itemId: item._id }}
                          className="block truncate font-medium hover:underline"
                        >
                          {item.title}
                        </Link>
                        <span className="text-xs text-muted-foreground">{item.category}</span>
                      </TableCell>
                      <TableCell>
                        <KindBadge kind={item.kind} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {item.reporter.name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(item.date)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moderate.mutate({ id: item._id, action: "approve" })}
                          >
                            <CheckCircle2 className="size-4" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moderate.mutate({ id: item._id, action: "reject" })}
                          >
                            <XCircle className="size-4" /> Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moderate.mutate({ id: item._id, action: "resolve" })}
                          >
                            Resolve
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users" className="mt-5">
          {users.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <Card className="overflow-x-auto p-0 shadow-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.data!.map((member) => (
                    <TableRow key={member._id}>
                      <TableCell className="flex min-w-0 items-center gap-2 font-medium">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {member.name.charAt(0)}
                        </span>
                        <span className="truncate">{member.name}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{member.email}</TableCell>
                      <TableCell className="text-sm">{member.location ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(member.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Users className="size-3.5 text-muted-foreground" />
                          <Select
                            value={member.role}
                            onValueChange={(v) =>
                              setRole.mutate({ id: member._id, role: v as "user" | "admin" })
                            }
                          >
                            <SelectTrigger className="h-8 w-28 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
