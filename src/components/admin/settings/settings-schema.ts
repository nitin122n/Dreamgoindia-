import { z } from "zod";

const hexColor = z
  .string()
  .min(1, "Color is required")
  .refine((v) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(v.trim()), "Enter a valid hex color");

export const settingsFormSchema = z.object({
  site_name: z.string().min(1, "Site name is required"),
  logo_url: z.string(),
  primary_color: hexColor,
  footer_text: z.string(),
  contact_email: z.string().min(1, "Email is required").email("Enter a valid email"),
  contact_phone: z.string().min(1, "Phone is required"),
  whatsapp: z.string(),
  address: z.string(),
  social_links: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    youtube: z.string().optional(),
    twitter: z.string().optional(),
  }),
  seo_default_title: z.string().min(1, "SEO title is required"),
  seo_default_description: z.string().min(1, "SEO description is required"),
  google_analytics_id: z.string(),
  payment_razorpay_key: z.string(),
  home_marquee_text: z.string(),
  about_founder_image: z.string(),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export const SOCIAL_PLATFORMS = ["instagram", "facebook", "youtube", "twitter"] as const;
