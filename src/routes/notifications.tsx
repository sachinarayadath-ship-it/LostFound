import { createFileRoute } from "@tanstack/react-router";

import { NotificationsList } from "@/components/NotificationsPanel";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { markAllRead } from "@/store/notificationsSlice";
import { useAppDispatch } from "@/store";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications · LostFound+" },
      {
        name: "description",
        content:
          "Status updates on your reports and claims: matches found, claims approved and moderation decisions.",
      },
      { property: "og:title", content: "Notifications · LostFound+" },
      { property: "og:description", content: "Matches, claim decisions and moderation updates." },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <NotificationsPage />
    </ProtectedRoute>
  ),
});

function NotificationsPage() {
  const dispatch = useAppDispatch();
  return (
    <div className="container-page max-w-3xl space-y-6 py-10">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything the desk has told you, newest first.
          </p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0" onClick={() => dispatch(markAllRead())}>
          Mark all read
        </Button>
      </header>
      <NotificationsList />
    </div>
  );
}
