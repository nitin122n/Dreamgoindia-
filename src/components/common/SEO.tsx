import { Helmet } from "react-helmet-async";
import { useSettings } from "@/contexts/SettingsContext";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  noIndex?: boolean;
}

export function SEO({
  title,
  description,
  image,
  url,
  type = "website",
  noIndex = false,
}: SEOProps) {
  const { settings } = useSettings();
  const pageTitle = title ? `${title} | ${settings.site_name}` : settings.seo_default_title;
  const pageDescription = description ?? settings.seo_default_description;
  const pageUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
  const pageImage = image ?? settings.logo_url;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={pageImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
    </Helmet>
  );
}
