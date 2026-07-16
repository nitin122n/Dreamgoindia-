import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { ComponentCard } from "@/components/admin/ComponentCard";
import { FormField } from "@/components/admin/FormField";
import { adminInputClass, adminTextareaClass } from "@/components/admin/admin-styles";
import { ImageUploader } from "@/components/admin/settings/ImageUploader";
import { ColorPicker } from "@/components/admin/settings/ColorPicker";
import {
  settingsFormSchema,
  SOCIAL_PLATFORMS,
  type SettingsFormValues,
} from "@/components/admin/settings/settings-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminSettings, useAdminSettingsMutations } from "@/hooks/useAdmin";
import type { SiteSettings } from "@/types";

function toFormValues(settings: SiteSettings): SettingsFormValues {
  return {
    site_name: settings.site_name,
    logo_url: settings.logo_url,
    primary_color: settings.primary_color,
    footer_text: settings.footer_text,
    contact_email: settings.contact_email,
    contact_phone: settings.contact_phone,
    whatsapp: settings.whatsapp,
    address: settings.address,
    social_links: {
      instagram: settings.social_links.instagram ?? "",
      facebook: settings.social_links.facebook ?? "",
      youtube: settings.social_links.youtube ?? "",
      twitter: settings.social_links.twitter ?? "",
    },
    seo_default_title: settings.seo_default_title,
    seo_default_description: settings.seo_default_description,
    google_analytics_id: settings.google_analytics_id ?? "",
    payment_razorpay_key: settings.payment_razorpay_key ?? "",
    home_marquee_text: settings.home_marquee_text ?? "",
  };
}

export default function AdminSettingsPage() {
  const { data: settings, isLoading, isError, error, refetch } = useAdminSettings();
  const { save } = useAdminSettingsMutations();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: settings ? toFormValues(settings) : undefined,
  });

  useEffect(() => {
    if (settings) reset(toFormValues(settings));
  }, [settings, reset]);

  const onSubmit = async (values: SettingsFormValues) => {
    if (!settings) return;
    try {
      const payload: SiteSettings = {
        ...settings,
        ...values,
        social_links: {
          ...settings.social_links,
          ...values.social_links,
        },
      };
      await save.mutateAsync(payload);
      toast.success("Settings saved");
    } catch (e) {
      toast.error((e as Error).message || "Failed to save settings");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-400">
        Loading settings...
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <AdminPageShell title="Website Settings" description="Could not load settings">
        <div className="rounded-2xl border border-primary/30 bg-primary/10 px-5 py-6 text-sm text-gray-200">
          <p className="font-semibold text-primary">Settings failed to load</p>
          <p className="mt-2 text-gray-400">
            {(error as Error)?.message ??
              "Check Supabase grants on the settings table, then try again."}
          </p>
          <Button className="mt-4 rounded-lg" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Website Settings"
      description="Logo, colors, contact info, social links & SEO"
      action={
        <Button
          type="submit"
          form="settings-form"
          disabled={isSubmitting || save.isPending}
          className="h-11 rounded-lg bg-primary px-6 hover:bg-primary-dark"
        >
          {isSubmitting || save.isPending ? "Saving..." : "Save Settings"}
        </Button>
      }
    >
      <form
        id="settings-form"
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        <ComponentCard title="Branding" description="Site identity and visual style">
          <FormField label="Site Name" htmlFor="site_name" error={errors.site_name?.message}>
            <Input id="site_name" className={adminInputClass} {...register("site_name")} />
          </FormField>

          <FormField label="Logo">
            <Controller
              name="logo_url"
              control={control}
              render={({ field }) => (
                <ImageUploader
                  value={field.value}
                  onChange={field.onChange}
                  folder="branding"
                />
              )}
            />
          </FormField>

          <FormField label="Primary Color" error={errors.primary_color?.message}>
            <Controller
              name="primary_color"
              control={control}
              render={({ field }) => (
                <ColorPicker value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>

          <FormField label="Footer Text" htmlFor="footer_text">
            <Textarea
              id="footer_text"
              rows={3}
              className={adminTextareaClass}
              {...register("footer_text")}
            />
          </FormField>

          <FormField
            label="Homepage Moving Text"
            htmlFor="home_marquee_text"
            hint="Scrolling red banner under story highlights. Leave blank to hide."
          >
            <Textarea
              id="home_marquee_text"
              rows={2}
              className={adminTextareaClass}
              placeholder="Welcome to Dream Go India..."
              {...register("home_marquee_text")}
            />
          </FormField>
        </ComponentCard>

        <ComponentCard title="Contact" description="How customers can reach you">
          <FormField label="Email" htmlFor="contact_email" error={errors.contact_email?.message}>
            <Input
              id="contact_email"
              type="email"
              className={adminInputClass}
              {...register("contact_email")}
            />
          </FormField>

          <FormField label="Phone" htmlFor="contact_phone" error={errors.contact_phone?.message}>
            <Input id="contact_phone" className={adminInputClass} {...register("contact_phone")} />
          </FormField>

          <FormField
            label="WhatsApp"
            htmlFor="whatsapp"
            hint="Country code + number, digits only (e.g. 918791276829). Powers the green chat button."
          >
            <Input
              id="whatsapp"
              className={adminInputClass}
              placeholder="918791276829"
              {...register("whatsapp")}
            />
          </FormField>

          <FormField label="Address" htmlFor="address">
            <Textarea
              id="address"
              rows={3}
              className={adminTextareaClass}
              {...register("address")}
            />
          </FormField>
        </ComponentCard>

        <ComponentCard title="Social Links" description="Connect your social profiles">
          {SOCIAL_PLATFORMS.map((platform) => (
            <FormField
              key={platform}
              label={platform.charAt(0).toUpperCase() + platform.slice(1)}
              htmlFor={`social_${platform}`}
            >
              <Input
                id={`social_${platform}`}
                className={adminInputClass}
                placeholder={`https://${platform}.com/...`}
                {...register(`social_links.${platform}`)}
              />
            </FormField>
          ))}
        </ComponentCard>

        <ComponentCard title="Payments" description="Razorpay checkout for trip bookings">
          <FormField
            label="Razorpay Key ID"
            htmlFor="payment_razorpay_key"
            hint="From Razorpay Dashboard → API Keys (rzp_test_… or rzp_live_…). Also set VITE_RAZORPAY_KEY_ID in .env as fallback."
          >
            <Input
              id="payment_razorpay_key"
              className={adminInputClass}
              placeholder="rzp_test_xxxxxxxx"
              {...register("payment_razorpay_key")}
            />
          </FormField>
        </ComponentCard>

        <ComponentCard title="SEO" description="Default meta tags and analytics">
          <FormField
            label="Default Title"
            htmlFor="seo_default_title"
            error={errors.seo_default_title?.message}
          >
            <Input id="seo_default_title" className={adminInputClass} {...register("seo_default_title")} />
          </FormField>

          <FormField
            label="Default Description"
            htmlFor="seo_default_description"
            error={errors.seo_default_description?.message}
          >
            <Textarea
              id="seo_default_description"
              rows={4}
              className={adminTextareaClass}
              {...register("seo_default_description")}
            />
          </FormField>

          <FormField
            label="Google Analytics ID"
            htmlFor="google_analytics_id"
            hint="Example: G-XXXXXXXXXX"
          >
            <Input
              id="google_analytics_id"
              className={adminInputClass}
              placeholder="G-XXXXXXXXXX"
              {...register("google_analytics_id")}
            />
          </FormField>
        </ComponentCard>
      </form>
    </AdminPageShell>
  );
}
