import { Navigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { hydrate } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store";

/**
 * Client-side route guard. Waits for the persisted session to hydrate,
 * then redirects unauthenticated users to /login and non-admins away from /admin.
 */
export function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const dispatch = useAppDispatch();
  const { user, hydrated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!hydrated) dispatch(hydrate());
  }, [hydrated, dispatch]);

  if (!hydrated) {
    return (
      <div className="container-page space-y-4 py-12">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
