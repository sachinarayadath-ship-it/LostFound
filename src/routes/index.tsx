import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  HandHeart,
  PackageSearch,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";

import { ItemCard, ItemCardSkeleton } from "@/components/ItemCard";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { itemsApi } from "@/services/api";
import heroImage from "@/assets/hero-lostfound.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LostFound+ · Report and recover lost items in your community" },
      {
        name: "description",
        content:
          "Search community lost and found listings, report a lost or found item in minutes, and track verified claims until handover.",
      },
      { property: "og:title", content: "LostFound+ · Community lost & found desk" },
      {
        property: "og:description",
        content:
          "Search listings, report lost or found items, and track verified claims until handover.",
      },
    ],
  }),
  component: HomePage,
});

const STEPS = [
  {
    icon: ClipboardList,
    title: "Report it",
    body: "Add a photo, category, location and date. Your report goes to a moderator for review within hours.",
  },
  {
    icon: PackageSearch,
    title: "We match it",
    body: "Lost reports are compared against found items automatically, and you get notified on every likely match.",
  },
  {
    icon: HandHeart,
    title: "Claim & collect",
    body: "Answer a verification question in the in-app chat, then collect from the community desk.",
  },
];

function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: itemsApi.stats });
  const { data: recent, isLoading } = useQuery({
    queryKey: ["items", "recent"],
    queryFn: () => itemsApi.list({ limit: 3 }),
  });

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/browse", search: { q: query || undefined } });
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <img
          src={heroImage}
          alt="Community help desk shelf with lost belongings waiting to be collected"
          className="absolute inset-0 size-full object-cover opacity-25"
        />
        <div className="relative container-page py-16 sm:py-24">
          <div className="max-w-2xl text-primary-foreground">
            <p className="inline-flex items-center gap-2 rounded-full bg-background/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <ShieldCheck className="size-3.5" /> Moderated · verified handovers
            </p>
            <h1 className="mt-5 text-4xl leading-[1.08] font-bold sm:text-5xl lg:text-6xl">
              Lost something? Your community is already looking.
            </h1>
            <p className="mt-5 max-w-xl text-base text-primary-foreground/85 sm:text-lg">
              LostFound+ is one central desk for reporting, matching and recovering lost belongings —
              with contact details kept private and every claim reviewed before handover.
            </p>

            <form onSubmit={submitSearch} className="mt-8 max-w-xl">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-xl bg-background/95 p-2 shadow-lift">
                <div className="relative min-w-0">
                  <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search “black wallet”, “keys”, “library”…"
                    aria-label="Search lost and found items"
                    className="border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
                  />
                </div>
                <Button type="submit" className="shrink-0">
                  Search
                </Button>
              </div>
              <p className="mt-2 text-xs text-primary-foreground/70">
                Browsing is open to everyone — no account needed.
              </p>
            </form>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" variant="hero" asChild>
                <Link to="/report" search={{ kind: "lost" }}>
                  Report a lost item <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="onhero" asChild>
                <Link to="/report" search={{ kind: "found" }}>
                  Report a found item
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 container-page -mt-8 sm:-mt-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={ClipboardList}
            label="Items reported"
            value={stats?.reported ?? "—"}
            hint="Since launch"
          />
          <StatCard
            icon={CheckCircle2}
            label="Items recovered"
            value={stats?.recovered ?? "—"}
            tone="accent"
            hint="Returned to owners"
          />
          <StatCard
            icon={PackageSearch}
            label="Resolution rate"
            value={stats ? `${stats.resolutionRate}%` : "—"}
            hint="Reports closed successfully"
          />
          <StatCard
            icon={Users}
            label="Community members"
            value={stats?.activeMembers ?? "—"}
            tone="muted"
            hint="Neighbours helping out"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold sm:text-3xl">How LostFound+ works</h2>
          <p className="mt-3 text-muted-foreground">
            Three steps, one trail of accountability from report to handover.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Card key={step.title} className="gap-3 p-6 shadow-card">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="size-5" />
                </span>
                <span className="text-xs font-bold text-muted-foreground">STEP {i + 1}</span>
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent listings */}
      <section className="container-page pb-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold sm:text-3xl">Recently reported</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The newest listings from across the community.
            </p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0" asChild>
            <Link to="/browse">
              View all <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? [0, 1, 2].map((i) => <ItemCardSkeleton key={i} />)
            : recent?.data.map((item) => <ItemCard key={item._id} item={item} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16">
        <div className="overflow-hidden rounded-2xl bg-gradient-accent px-6 py-12 text-center text-primary-foreground sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Found something that isn't yours?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/90 sm:text-base">
            Two minutes of your time is often someone's whole week fixed. Log it and let the desk
            handle the rest.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="onhero" asChild>
              <Link to="/report" search={{ kind: "found" }}>
                Report a found item
              </Link>
            </Button>
            <Button size="lg" variant="onhero" asChild>
              <Link to="/browse">Browse listings</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
