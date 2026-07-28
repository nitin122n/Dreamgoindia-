import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  User,
  Ticket,
  PartyPopper,
  Plus,
  Trash2,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { SEO } from "@/components/common/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrip } from "@/hooks/useCMS";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { formatPrice } from "@/lib/utils";
import { buildWhatsAppUrl, resolveWhatsAppNumber } from "@/lib/whatsapp";

const travelerSchema = z.object({
  name: z.string().min(2, "Name required"),
  age: z.number().min(1).max(120),
  gender: z.string().min(1, "Required"),
  phone: z.string().optional(),
  email: z.string().optional(),
});

const bookingSchema = z.object({
  travelers: z.array(travelerSchema).min(1),
  specialRequests: z.string().optional(),
  couponCode: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const STEPS = [
  { id: 1, title: "Travelers", icon: User },
  { id: 2, title: "Coupon", icon: Ticket },
  { id: 3, title: "WhatsApp", icon: MessageCircle },
  { id: 4, title: "Done", icon: PartyPopper },
];

const VALID_COUPONS: Record<string, number> = {
  DREAM10: 10,
  WELCOME500: 500,
};

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: trip, isLoading } = useTrip(slug ?? "");
  const { user } = useAuth();
  const { settings } = useSettings();
  const [step, setStep] = useState(1);
  const [discount, setDiscount] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      travelers: [{ name: "", age: 25, gender: "male", phone: "", email: user?.email ?? "" }],
      specialRequests: "",
      couponCode: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "travelers" });

  const whatsappNumber = resolveWhatsAppNumber({
    whatsapp: settings.whatsapp,
    contactPhone: settings.contact_phone,
    envNumber: import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Trip not found</h1>
        <Link to="/trips" className="mt-4 inline-block text-primary hover:underline">
          Browse trips
        </Link>
      </div>
    );
  }

  const basePrice = trip.discount_price ?? trip.price;
  const travelerCount = fields.length;
  const subtotal = basePrice * travelerCount;
  const total = Math.max(0, subtotal - discount);

  const applyCoupon = () => {
    const code = getValues("couponCode")?.toUpperCase();
    if (!code) {
      toast.error("Enter a coupon code");
      return;
    }
    if (VALID_COUPONS[code] !== undefined) {
      const val = VALID_COUPONS[code];
      const disc = val < 100 ? Math.round(subtotal * (val / 100)) : val;
      setDiscount(disc);
      toast.success(`Coupon applied! You save ${formatPrice(disc)}`);
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const buildBookingMessage = (values: BookingFormValues) => {
    const siteName = settings.site_name || "Dream Go India";
    const lines: string[] = [
      `Hi ${siteName}! I'd like to book a trip. 🏔`,
      "",
      `*Trip:* ${trip.title}`,
      `*Duration:* ${trip.duration_days}D / ${trip.duration_nights}N`,
    ];
    if (trip.location) lines.push(`*Location:* ${trip.location}`);

    lines.push("", `*Travelers (${values.travelers.length}):*`);
    values.travelers.forEach((t, i) => {
      const contact = t.phone ? ` — ${t.phone}` : "";
      lines.push(`${i + 1}. ${t.name}, ${t.age} (${t.gender})${contact}`);
    });

    const code = values.couponCode?.trim().toUpperCase();
    if (discount > 0 && code) {
      lines.push("", `*Coupon:* ${code} (−${formatPrice(discount)})`);
    }

    lines.push(
      "",
      `*Price per person:* ${formatPrice(basePrice)}`,
      `*Total:* ${formatPrice(total)}`
    );

    if (values.specialRequests?.trim()) {
      lines.push("", `*Special requests:* ${values.specialRequests.trim()}`);
    }

    lines.push("", "Please confirm availability and share the payment details. Thank you!");
    return lines.join("\n");
  };

  const bookOnWhatsApp = (values: BookingFormValues) => {
    if (!whatsappNumber) {
      toast.error("WhatsApp number is not configured. Add it in Admin → Settings → Contact.");
      return;
    }
    const url = buildWhatsAppUrl(whatsappNumber, buildBookingMessage(values));
    window.open(url, "_blank", "noopener,noreferrer");
    setStep(4);
    toast.success("Opening WhatsApp with your booking details…");
  };

  return (
    <>
      <SEO title={`Book ${trip.title}`} description={`Book your spot on ${trip.title}`} noIndex />

      <section className="bg-gradient-to-br from-primary/10 to-orange-50 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Book: {trip.title}</h1>
          <p className="mt-1 text-gray-600">{trip.location} · {trip.duration_days}D / {trip.duration_nights}N</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {/* Step indicator */}
        <div className="mb-10 flex items-center justify-center gap-2 md:gap-4">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  step >= s.id ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > s.id ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
              </div>
              <span className={`hidden text-sm font-medium md:block ${step >= s.id ? "text-primary" : "text-gray-400"}`}>
                {s.title}
              </span>
              {i < STEPS.length - 1 && (
                <ChevronRight className="hidden h-4 w-4 text-gray-300 md:block" />
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="mb-6 text-xl font-bold">Traveler Details</h2>
                      <form className="space-y-6">
                        {fields.map((field, index) => (
                          <div key={field.id} className="rounded-xl border border-gray-100 p-4">
                            <div className="mb-4 flex items-center justify-between">
                              <h3 className="font-semibold">Traveler {index + 1}</h3>
                              {fields.length > 1 && (
                                <button type="button" onClick={() => remove(index)} className="text-red-500">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input {...register(`travelers.${index}.name`)} />
                                {errors.travelers?.[index]?.name && (
                                  <p className="text-xs text-red-500">{errors.travelers[index]?.name?.message}</p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label>Age</Label>
                                <Input type="number" {...register(`travelers.${index}.age`, { valueAsNumber: true })} />
                              </div>
                              <div className="space-y-2">
                                <Label>Gender</Label>
                                <Input {...register(`travelers.${index}.gender`)} placeholder="male/female/other" />
                              </div>
                              <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input {...register(`travelers.${index}.phone`)} />
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => append({ name: "", age: 25, gender: "male", phone: "", email: "" })}
                        >
                          <Plus className="h-4 w-4" />
                          Add Traveler
                        </Button>
                        <div className="space-y-2">
                          <Label>Special Requests</Label>
                          <Input {...register("specialRequests")} placeholder="Dietary needs, medical conditions, etc." />
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="mb-6 text-xl font-bold">Apply Coupon</h2>
                      <div className="flex gap-3">
                        <Input {...register("couponCode")} placeholder="Enter coupon code (try DREAM10)" />
                        <Button type="button" onClick={applyCoupon}>Apply</Button>
                      </div>
                      {discount > 0 && (
                        <p className="mt-4 text-sm text-green-600">
                          Discount applied: -{formatPrice(discount)}
                        </p>
                      )}
                      <p className="mt-4 text-xs text-gray-500">
                        Available codes: DREAM10 (10% off), WELCOME500 (₹500 off)
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="mb-6 text-xl font-bold">Book via WhatsApp</h2>
                      <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366]">
                            <WhatsAppIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Confirm your booking on WhatsApp</p>
                            <p className="text-sm text-gray-500">
                              Your trip and traveler details will be sent to our team
                            </p>
                          </div>
                        </div>

                        <div className="mb-4 rounded-xl bg-white p-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Estimated total</span>
                            <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
                          </div>
                        </div>

                        <ul className="mb-4 space-y-2 text-sm text-gray-600">
                          <li className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                            Tap the button below — WhatsApp opens with your booking details pre-filled
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                            Our team confirms availability and batch dates with you
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                            Pay securely only after confirmation — UPI or bank transfer
                          </li>
                        </ul>

                        {!whatsappNumber && (
                          <p className="mb-3 text-sm text-red-600">
                            WhatsApp number missing. Add it in Admin → Settings → Contact (or
                            VITE_WHATSAPP_NUMBER in .env).
                          </p>
                        )}

                        <p className="flex items-center gap-1.5 text-xs text-gray-500">
                          <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                          No advance payment on the website — book directly with our team
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card>
                    <CardContent className="p-8 text-center">
                      <PartyPopper className="mx-auto mb-4 h-16 w-16 text-primary" />
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Booking Request Sent!
                      </h2>
                      <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Your details have been shared on WhatsApp. Our team will reply shortly to
                        confirm availability and guide you through the payment.
                      </p>
                      <div className="mt-6 rounded-xl bg-green-50 p-4 text-left">
                        <p className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                          <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                          Didn&apos;t see WhatsApp open?
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          Pop-ups may be blocked. Tap the button below to open the chat again.
                        </p>
                        <Button
                          type="button"
                          className="mt-3 bg-[#25D366] text-white hover:bg-[#1ebe57]"
                          onClick={handleSubmit(bookOnWhatsApp)}
                        >
                          <WhatsAppIcon className="h-4 w-4" />
                          Reopen WhatsApp
                        </Button>
                      </div>
                      <div className="mt-6 flex justify-center gap-4">
                        <Link to="/trips">
                          <Button variant="outline">Browse More Trips</Button>
                        </Link>
                        <Link to="/">
                          <Button variant="outline">Back to Home</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {step < 4 && (
              <div className="mt-6 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  disabled={step === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                {step === 3 ? (
                  <Button
                    disabled={!whatsappNumber}
                    className="bg-[#25D366] text-white hover:bg-[#1ebe57]"
                    onClick={handleSubmit(bookOnWhatsApp)}
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    Book on WhatsApp
                  </Button>
                ) : (
                  <Button
                    onClick={step === 1 ? handleSubmit(() => setStep(2)) : () => setStep(3)}
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Summary sidebar */}
          <div>
            <Card className="sticky top-24 premium-shadow-lg">
              <CardContent className="p-6">
                <img
                  src={trip.trip_images?.[0]?.image_url ?? ""}
                  alt={trip.title}
                  className="mb-4 aspect-video w-full rounded-xl object-cover"
                />
                <h3 className="font-bold text-gray-900">{trip.title}</h3>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Price per person</span>
                    <span>{formatPrice(basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Travelers</span>
                    <span>{travelerCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
