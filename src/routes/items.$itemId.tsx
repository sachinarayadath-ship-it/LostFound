import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  Handshake,
  Loader2,
  Lock,
  MapPin,
  Send,
  Shapes,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { KindBadge, StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatDateTime } from "@/lib/format";
import { claimsApi, itemsApi, messagesApi } from "@/services/api";
import { useAppSelector } from "@/store";

export const Route = createFileRoute("/items/$itemId")({
  head: () => ({
    meta: [
      { title: "Item details · LostFound+" },
      {
        name: "description",
        content:
          "See full details for a reported lost or found item, message the reporter privately and open a verified claim.",
      },
      { property: "og:title", content: "Item details · LostFound+" },
      {
        property: "og:description",
        content: "Full item details, private messaging and verified claims.",
      },
    ],
  }),
  component: ItemDetailsPage,
});

function ItemDetailsPage() {
  const { itemId } = Route.useParams();
  const queryClient = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);
  const [claimMessage, setClaimMessage] = useState("");
  const [reply, setReply] = useState("");
  const [claimOpen, setClaimOpen] = useState(false);

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => itemsApi.get(itemId),
  });

  const { data: thread } = useQuery({
    queryKey: ["messages", itemId],
    queryFn: () => messagesApi.thread(itemId),
    enabled: !!user,
  });

  const claim = useMutation({
    mutationFn: () => claimsApi.create(itemId, claimMessage),
    onSuccess: () => {
      toast.success("Claim submitted — a moderator will review it shortly.");
      setClaimOpen(false);
      setClaimMessage("");
      void queryClient.invalidateQueries({ queryKey: ["item", itemId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sendMessage = useMutation({
    mutationFn: () => messagesApi.send(itemId, reply),
    onSuccess: () => {
      setReply("");
      void queryClient.invalidateQueries({ queryKey: ["messages", itemId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !item) {
    return (
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1.4fr_1fr]">
        <Skeleton className="aspect-4/3 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/browse">
          <ArrowLeft className="size-4" /> Back to listings
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="aspect-4/3 w-full object-cover"
              />
            ) : (
              <div className="grid aspect-4/3 place-items-center bg-surface text-sm text-muted-foreground">
                No photo provided
              </div>
            )}
          </div>

          <Card className="gap-4 p-6 shadow-card">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            <dl className="mt-2 grid gap-4 sm:grid-cols-3">
              <div className="min-w-0">
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
                  <Shapes className="size-3.5" /> Category
                </dt>
                <dd className="mt-1 truncate text-sm font-medium">{item.category}</dd>
              </div>
              <div className="min-w-0">
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
                  <MapPin className="size-3.5" /> Location
                </dt>
                <dd className="mt-1 truncate text-sm font-medium">{item.location}</dd>
              </div>
              <div className="min-w-0">
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
                  <CalendarDays className="size-3.5" /> Date
                </dt>
                <dd className="mt-1 text-sm font-medium">{formatDate(item.date)}</dd>
              </div>
            </dl>
          </Card>

          <Card className="gap-4 p-6 shadow-card">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <h2 className="truncate text-lg font-semibold">Message the reporter</h2>
              <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3.5" /> Contact details stay private
              </span>
            </div>

            {!user ? (
              <div className="rounded-lg border border-dashed border-border bg-surface/60 p-4 text-sm text-muted-foreground">
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>{" "}
                to message {item.reporter.name} through the in-app thread.
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {thread?.map((message) => (
                    <div
                      key={message._id}
                      className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${
                        message.mine
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-surface text-surface-foreground"
                      }`}
                    >
                      <p>{message.body}</p>
                      <p
                        className={`mt-1 text-[0.7rem] ${message.mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                      >
                        {message.author} · {formatDateTime(message.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (reply.trim().length < 2) return;
                    sendMessage.mutate();
                  }}
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-2"
                >
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Add a detail only the owner would know…"
                    rows={2}
                    maxLength={500}
                    className="min-w-0"
                  />
                  <Button type="submit" size="icon" className="self-end" aria-label="Send message">
                    {sendMessage.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                  </Button>
                </form>
              </>
            )}
          </Card>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Card className="gap-4 p-6 shadow-card">
            <div className="flex flex-wrap items-center gap-2">
              <KindBadge kind={item.kind} />
              <StatusBadge status={item.status} size="md" />
            </div>
            <h1 className="text-2xl leading-tight font-bold">{item.title}</h1>
            <p className="text-sm text-muted-foreground">
              Reported by <span className="font-medium text-foreground">{item.reporter.name}</span> ·{" "}
              {formatDate(item.createdAt)}
            </p>

            <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg" disabled={item.status === "resolved"}>
                  <Handshake className="size-4" />
                  {item.status === "resolved" ? "Already resolved" : "Claim this item"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Claim “{item.title}”</DialogTitle>
                  <DialogDescription>
                    Describe something identifying about the item. A moderator uses this to verify
                    ownership before handover.
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  rows={4}
                  maxLength={600}
                  placeholder="e.g. There's a boarding pass from 12 July inside the front pocket."
                />
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setClaimOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => claim.mutate()}
                    disabled={claimMessage.trim().length < 10 || claim.isPending}
                  >
                    {claim.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                    Submit claim
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <p className="text-xs text-muted-foreground">
              {item.claimCount} claim{item.claimCount === 1 ? "" : "s"} on this item so far.
            </p>
          </Card>

          <Card className="gap-3 bg-surface/60 p-6">
            <h2 className="text-sm font-semibold">How handover works</h2>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>1. Submit a claim with a verification detail.</li>
              <li>2. A moderator reviews the claim and the item report.</li>
              <li>3. You're notified with a collection point and time.</li>
            </ol>
          </Card>
        </aside>
      </div>
    </div>
  );
}
