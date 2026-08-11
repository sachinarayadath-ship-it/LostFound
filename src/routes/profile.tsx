import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";
import { authApi } from "@/services/api";
import { updateProfile } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My profile · LostFound+" },
      {
        name: "description",
        content: "Update your LostFound+ profile details and change your account password.",
      },
      { property: "og:title", content: "My profile · LostFound+" },
      { property: "og:description", content: "Update your details and change your password." },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  ),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Enter your current password"),
    newPassword: z.string().min(6, "Use at least 6 characters").max(72),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    location: user?.location ?? "",
    bio: user?.bio ?? "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  const changePassword = useMutation({
    mutationFn: () =>
      authApi.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      }),
    onSuccess: () => {
      toast.success("Password updated.");
      setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.name.trim().length < 2) {
      toast.error("Please enter your full name.");
      return;
    }
    setSavingProfile(true);
    const result = await dispatch(updateProfile(profile));
    setSavingProfile(false);
    if (updateProfile.fulfilled.match(result)) toast.success("Profile saved.");
    else toast.error("Could not save your profile.");
  };

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = passwordSchema.safeParse(passwords);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setPwErrors(next);
      return;
    }
    setPwErrors({});
    changePassword.mutate();
  };

  return (
    <div className="container-page max-w-4xl space-y-6 py-10">
      <header className="flex min-w-0 items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-hero text-xl font-bold text-primary-foreground">
          {user?.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold sm:text-3xl">{user?.name}</h1>
          <p className="truncate text-sm text-muted-foreground">
            {user?.email} · member since {user ? formatDate(user.createdAt) : "—"}
          </p>
        </div>
      </header>

      <Card className="p-6 shadow-card sm:p-8">
        <h2 className="text-lg font-semibold">Profile details</h2>
        <form onSubmit={saveProfile} className="mt-5 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={profile.name}
                maxLength={80}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (read only)</Label>
              <Input id="email" value={user?.email ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (private)</Label>
              <Input
                id="phone"
                value={profile.phone}
                maxLength={20}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="Only visible to moderators"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Usual location</Label>
              <Input
                id="location"
                value={profile.location}
                maxLength={80}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Short bio</Label>
            <Textarea
              id="bio"
              rows={3}
              maxLength={300}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={savingProfile}>
            {savingProfile ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save changes
          </Button>
        </form>
      </Card>

      <Card className="p-6 shadow-card sm:p-8">
        <h2 className="text-lg font-semibold">Change password</h2>
        <form onSubmit={submitPassword} className="mt-5 space-y-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-3">
            {(
              [
                ["currentPassword", "Current password"],
                ["newPassword", "New password"],
                ["confirm", "Confirm new password"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  type="password"
                  autoComplete={key === "currentPassword" ? "current-password" : "new-password"}
                  value={passwords[key]}
                  onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                  aria-invalid={!!pwErrors[key]}
                />
                {pwErrors[key] ? (
                  <p className="text-xs text-destructive">{pwErrors[key]}</p>
                ) : null}
              </div>
            ))}
          </div>
          <Button type="submit" variant="outline" disabled={changePassword.isPending}>
            {changePassword.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <KeyRound className="size-4" />
            )}
            Update password
          </Button>
        </form>
      </Card>
    </div>
  );
}
