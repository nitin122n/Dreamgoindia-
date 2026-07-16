import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { Camera } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfile } from "@/hooks/useDashboard";
import { useTheme } from "@/contexts/ThemeContext";
import { LanguageSwitcher } from "@/components/features/LanguageSwitcher";
interface ProfileForm {
  full_name: string;
  phone: string;
  interests: string;
}

export default function ProfilePage() {
  const { profile, user } = useAuth();
  const updateProfile = useUpdateProfile();
  const { isDark, setTheme } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<ProfileForm>({
    defaultValues: {
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      interests: profile?.interests?.join(", ") ?? "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        interests: profile.interests?.join(", ") ?? "",
      });
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile, reset]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: ProfileForm) => {
    try {
      await updateProfile.mutateAsync({
        full_name: data.full_name,
        phone: data.phone,
        interests: data.interests.split(",").map((s) => s.trim()).filter(Boolean),
        avatar_url: avatarUrl,
        dark_mode: isDark,
      });
      toast.success("Profile updated successfully!");
    } catch (e) {
      toast.error((e as Error).message || "Failed to update profile");
    }
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  const initials =
    profile?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <>
      <Helmet>
        <title>Profile - Dream Go India</title>
      </Helmet>

      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage your account information</p>
        </div>

        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-xl text-primary">{initials}</AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {profile?.email ?? user?.email ?? ""}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Click camera to change avatar</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" {...register("full_name")} placeholder="Your full name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" {...register("phone")} placeholder="+91 98765 43210" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interests">Interests (comma separated)</Label>
                <Input
                  id="interests"
                  {...register("interests")}
                  placeholder="trekking, adventure, photography"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4 dark:border-gray-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark theme</p>
                </div>
                <Switch checked={isDark} onCheckedChange={handleDarkModeToggle} />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4 dark:border-gray-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Language</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred language</p>
                </div>
                <LanguageSwitcher />
              </div>

              <Button type="submit" disabled={updateProfile.isPending} className="w-full">
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
