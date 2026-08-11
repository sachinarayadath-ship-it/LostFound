import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { ImageUpload } from "@/components/ImageUpload";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { itemsApi } from "@/services/api";
import { CATEGORIES, LOCATIONS, type ItemKind } from "@/types";

export const Route = createFileRoute("/report")({
  validateSearch: z.object({ kind: z.enum(["lost", "found"]).optional() }),
  head: () => ({
    meta: [
      { title: "Report a lost or found item · LostFound+" },
      {
        name: "description",
        content:
          "Submit a lost or found item report with photo, category, location and date. Reports go live after moderator review.",
      },
      { property: "og:title", content: "Report a lost or found item · LostFound+" },
      {
        property: "og:description",
        content: "Submit a report with photo, category, location and date in under two minutes.",
      },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <ReportPage />
    </ProtectedRoute>
  ),
});

const schema = z.object({
  title: z.string().trim().min(4, "Give the item a short, clear title").max(120),
  category: z.string().min(1, "Choose a category"),
  description: z.string().trim().min(20, "Add at least 20 characters of detail").max(1500),
  location: z.string().min(1, "Choose a location"),
  date: z.string().min(1, "Pick the date the item was lost or found"),
});

function ReportPage() {
  const navigate = useNavigate();
  const { kind: initialKind } = Route.useSearch();
  const [kind, setKind] = useState<ItemKind>(initialKind ?? "lost");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const submit = useMutation({
    mutationFn: async () => {
      const payload = new FormData();
      payload.append("kind", kind);
      Object.entries(form).forEach(([k, v]) => payload.append(k, v));
      if (file) payload.append("image", file);
      return itemsApi.create(payload);
    },
    onSuccess: () => {
      toast.success("Report submitted — status is now “Pending review”.");
      navigate({ to: "/dashboard" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setErrors({});
    submit.mutate();
  };

  return (
    <div className="container-page max-w-3xl py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold sm:text-4xl">Report an item</h1>
        <p className="text-muted-foreground">
          The more detail you add, the faster the desk can match your report.
        </p>
      </header>

      <Tabs value={kind} onValueChange={(v) => setKind(v as ItemKind)} className="mt-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="lost" className="flex-1 sm:flex-none">
            I lost something
          </TabsTrigger>
          <TabsTrigger value="found" className="flex-1 sm:flex-none">
            I found something
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="mt-6 p-6 shadow-card sm:p-8">
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <div className="space-y-2">
            <Label htmlFor="title">Item title</Label>
            <Input
              id="title"
              value={form.title}
              maxLength={120}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Black leather wallet with transit card"
              aria-invalid={!!errors["title"]}
            />
            {errors["title"] ? (
              <p className="text-xs text-destructive">{errors["title"]}</p>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger aria-invalid={!!errors["category"]}>
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors["category"] ? (
                <p className="text-xs text-destructive">{errors["category"]}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>{kind === "lost" ? "Where you lost it" : "Where you found it"}</Label>
              <Select
                value={form.location}
                onValueChange={(v) => setForm({ ...form, location: v })}
              >
                <SelectTrigger aria-invalid={!!errors["location"]}>
                  <SelectValue placeholder="Choose a location" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors["location"] ? (
                <p className="text-xs text-destructive">{errors["location"]}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2 sm:max-w-xs">
            <Label htmlFor="date">Date {kind === "lost" ? "lost" : "found"}</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              aria-invalid={!!errors["date"]}
            />
            {errors["date"] ? <p className="text-xs text-destructive">{errors["date"]}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={5}
              maxLength={1500}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Colour, brand, distinguishing marks, contents… avoid details only the true owner would know."
              aria-invalid={!!errors["description"]}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="text-destructive">{errors["description"] ?? ""}</span>
              <span>{form.description.length}/1500</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photo (optional but recommended)</Label>
            <ImageUpload onChange={setFile} />
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-surface/70 p-4 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" />
            <p>
              Submitted reports enter <strong className="text-foreground">Pending review</strong>. A
              moderator publishes them once checked. Your email and phone are never shown publicly.
            </p>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submit.isPending}>
            {submit.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Submit {kind} item report
          </Button>
        </form>
      </Card>
    </div>
  );
}
