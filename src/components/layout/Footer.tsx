import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/common/SocialIcons";
import { Logo } from "@/components/common/Logo";
import { useSettings } from "@/contexts/SettingsContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getSocialHref } from "@/lib/social-links";
import toast from "react-hot-toast";
import { useState } from "react";

const footerLinks = {
  explore: [
    { label: "All Trips", href: "/trips" },
    { label: "Destinations", href: "/destinations" },
    { label: "Upcoming Departures", href: "/departures" },
    { label: "Our Services", href: "/services" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Testimonials", href: "/testimonials" },
    { label: "Blog", href: "/blog" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
  ],
  support: [
    { label: "FAQ", href: "/faq" },
    { label: "Admin", href: "/admin/login" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
};

export function Footer() {
  const { settings } = useSettings();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.from("newsletter").insert({ email });
      }
      toast.success("Subscribed successfully!");
      setEmail("");
    } catch {
      toast.error("Failed to subscribe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-8 lg:px-8 lg:py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo className="mb-3 [&_span]:text-white [&_svg]:text-primary" />
            <p className="mb-3 max-w-xs text-xs leading-relaxed text-gray-400 line-clamp-2">
              {settings.footer_text}
            </p>
            <div className="space-y-1.5 text-xs">
              <a href={`tel:${settings.contact_phone}`} className="flex items-center gap-2 hover:text-white">
                <Phone className="h-3.5 w-3.5 shrink-0 text-primary" /> {settings.contact_phone}
              </a>
              <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-2 hover:text-white">
                <Mail className="h-3.5 w-3.5 shrink-0 text-primary" /> {settings.contact_email}
              </a>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="line-clamp-1">{settings.address}</span>
              </p>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-2.5 text-sm font-semibold capitalize text-white">{title}</h4>
              <ul className="space-y-1.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-xs hover:text-primary transition-colors sm:text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-gray-800 pt-5 lg:flex-row lg:items-center lg:justify-between">
          <form onSubmit={handleNewsletter} className="flex w-full max-w-md gap-2">
            <Input
              type="email"
              placeholder="Email for deals"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9 border-gray-700 bg-gray-800 text-sm text-white placeholder:text-gray-500"
              required
            />
            <Button type="submit" disabled={loading} size="sm" className="h-9 shrink-0 rounded-full px-4">
              Subscribe
            </Button>
          </form>

          <div className="relative z-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6">
            <p className="max-w-xl text-xs leading-relaxed text-gray-500">
              © {settings.site_name || "Dream Go India"} | Tour and travel company, India | Since
              2016 – {new Date().getFullYear()} | All rights reserved.
            </p>
            <div className="flex gap-2">
              {(
                [
                  ["instagram", InstagramIcon],
                  ["facebook", FacebookIcon],
                  ["youtube", YoutubeIcon],
                ] as const
              ).map(([platform, Icon]) => {
                const href = getSocialHref(settings.social_links, platform);
                if (!href) return null;
                return (
                  <a
                    key={platform}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${platform}`}
                    className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-primary hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
