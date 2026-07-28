import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/common/SocialIcons";
import toast from "react-hot-toast";
import { SEO } from "@/components/common/SEO";
import { PageHero } from "@/components/common/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { useSettings } from "@/contexts/SettingsContext";
import { useFAQs } from "@/hooks/useCMS";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { buildWhatsAppUrl, resolveWhatsAppNumber } from "@/lib/whatsapp";
import { LocationMap } from "@/components/common/LocationMap";
import { getSocialHref } from "@/lib/social-links";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.email("Valid email required"),
  phone: z.string().optional(),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

/** Keep form fields light on white cards even when site dark mode is on */
const lightFieldClass =
  "border-gray-300 bg-white text-gray-900 caret-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary dark:border-gray-300 dark:bg-white dark:text-gray-900 dark:caret-gray-900 dark:placeholder:text-gray-400";

const lightLabelClass = "font-semibold text-primary dark:text-primary";

export default function ContactPage() {
  const { settings } = useSettings();
  const { data: faqs } = useFAQs("booking");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("contact_forms").insert({
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        subject: data.subject,
        message: data.message,
        status: "new",
      });
      if (error) {
        toast.error("Failed to send message. Please try again.");
        return;
      }
    }
    toast.success("Message sent! We'll get back to you soon.");
    reset();
  };

  const socialLinks = settings.social_links ?? {};
  const whatsappNumber = resolveWhatsAppNumber({
    whatsapp: settings.whatsapp,
    contactPhone: settings.contact_phone,
    envNumber: import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined,
  });
  const whatsappHref = whatsappNumber
    ? buildWhatsAppUrl(
        whatsappNumber,
        `Hi ${settings.site_name || "Dream Go India"}! I have a question about your trips.`
      )
    : null;

  return (
    <>
      <SEO title="Contact Us" description="Get in touch with Dream Go India for bookings, queries, and custom trip planning." />

      <PageHero
        title="Contact Us"
        subtitle="Have questions about a trip? We'd love to hear from you."
        breadcrumbs={[{ label: "Contact" }]}
      />

      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 rounded-2xl border border-gray-200 bg-white p-8 text-gray-900 premium-shadow dark:border-gray-200 dark:bg-white dark:text-gray-900"
            >
              <h2 className="text-xl font-bold text-gray-900">Send us a message</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className={lightLabelClass}>
                    Name
                  </Label>
                  <Input id="name" className={lightFieldClass} {...register("name")} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className={lightLabelClass}>
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    className={lightFieldClass}
                    {...register("email")}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className={lightLabelClass}>
                  Phone (optional)
                </Label>
                <Input id="phone" className={lightFieldClass} {...register("phone")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className={lightLabelClass}>
                  Subject
                </Label>
                <Input id="subject" className={lightFieldClass} {...register("subject")} />
                {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className={lightLabelClass}>
                  Message
                </Label>
                <Textarea
                  id="message"
                  rows={5}
                  className={lightFieldClass}
                  {...register("message")}
                />
                {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send Message
              </Button>
            </form>
          </div>

          <div className="space-y-6">
            <Card className="border-gray-200 bg-white dark:border-gray-200 dark:bg-white">
              <CardContent className="space-y-4 p-6 text-gray-900">
                <div className="flex items-start gap-4">
                  <Mail className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-primary">Email</p>
                    <a
                      href={`mailto:${settings.contact_email}`}
                      className="text-sm text-gray-800 hover:text-primary dark:text-gray-800"
                    >
                      {settings.contact_email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-primary">Phone</p>
                    <a
                      href={`tel:${settings.contact_phone}`}
                      className="text-sm font-semibold text-primary hover:text-primary-dark"
                    >
                      {settings.contact_phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-primary">Address</p>
                    <p className="text-sm text-gray-800 dark:text-gray-800">{settings.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <LocationMap
              label={settings.address || "Dehradun, Uttarakhand, India"}
              heightClassName="h-48"
              className="premium-shadow"
            />

            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1ebe57]"
              >
                Chat on WhatsApp
              </a>
            )}

            {/* Social links */}
            <div className="relative z-10 flex gap-3">
              {(
                [
                  ["instagram", InstagramIcon],
                  ["facebook", FacebookIcon],
                  ["youtube", YoutubeIcon],
                ] as const
              ).map(([platform, Icon]) => {
                const href = getSocialHref(socialLinks, platform);
                if (!href) return null;
                return (
                  <a
                    key={platform}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${platform}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* FAQs */}
        {faqs && faqs.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <Accordion
              type="single"
              collapsible
              className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white px-6 text-gray-900 premium-shadow dark:border-gray-200 dark:bg-white dark:text-gray-900"
            >
              {faqs.slice(0, 4).map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="border-gray-200">
                  <AccordionTrigger className="text-primary hover:text-primary-dark dark:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 dark:text-gray-700">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}
      </section>
    </>
  );
}
