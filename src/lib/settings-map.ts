import { defaultSettings } from "@/data/mock-data";
import type { SiteSettings } from "@/types";

/** Map a `settings` table row (or partial) into a typed SiteSettings object. */
export function mapSettingsRow(row: Record<string, unknown>): SiteSettings {
  const social = row.social_links;
  let social_links: Record<string, string> = {};
  if (typeof social === "string") {
    try {
      social_links = JSON.parse(social) as Record<string, string>;
    } catch {
      social_links = {};
    }
  } else if (social && typeof social === "object") {
    social_links = social as Record<string, string>;
  }

  return {
    site_name: String(row.site_name ?? defaultSettings.site_name),
    logo_url: String(row.logo_url ?? defaultSettings.logo_url),
    favicon_url: String(row.favicon_url ?? defaultSettings.favicon_url),
    primary_color: String(row.primary_color ?? defaultSettings.primary_color),
    contact_email: String(row.contact_email ?? defaultSettings.contact_email),
    contact_phone: String(row.contact_phone ?? defaultSettings.contact_phone),
    whatsapp: String(row.whatsapp ?? defaultSettings.whatsapp),
    address: String(row.address ?? defaultSettings.address),
    social_links: {
      ...defaultSettings.social_links,
      ...social_links,
    },
    footer_text: String(row.footer_text ?? defaultSettings.footer_text),
    google_analytics_id: String(row.google_analytics_id ?? ""),
    seo_default_title: String(row.seo_default_title ?? defaultSettings.seo_default_title),
    seo_default_description: String(
      row.seo_default_description ?? defaultSettings.seo_default_description
    ),
    payment_razorpay_key: String(
      row.payment_razorpay_key ?? defaultSettings.payment_razorpay_key ?? ""
    ),
    home_marquee_text: String(
      row.home_marquee_text ?? defaultSettings.home_marquee_text ?? ""
    ),
    about_founder_image: String(
      row.about_founder_image ?? defaultSettings.about_founder_image ?? ""
    ),
  };
}
