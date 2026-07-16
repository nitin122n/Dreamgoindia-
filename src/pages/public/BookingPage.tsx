import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  User,
  CreditCard,
  Ticket,
  PartyPopper,
  Plus,
  Trash2,
  Loader2,
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
import { openRazorpayCheckout, toPaise } from "@/lib/razorpay";
import { createPaidBooking } from "@/lib/bookings";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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
  { id: 3, title: "Payment", icon: CreditCard },
  { id: 4, title: "Confirm", icon: PartyPopper },
];

const VALID_COUPONS: Record<string, number> = {
  DREAM10: 10,
  WELCOME500: 500,
};

export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: trip, isLoading } = useTrip(slug ?? "");
  const { user, profile } = useAuth();
  const { settings } = useSettings();
  const [step, setStep] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [bookingNumber, setBookingNumber] = useState("");
  const [paying, setPaying] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [bookingStatusLabel, setBookingStatusLabel] = useState<"confirmed" | "pending">(
    "confirmed"
  );

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

  const razorpayKey =
    settings.payment_razorpay_key?.trim() ||
    (import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined)?.trim() ||
    "";

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

  const payWithRazorpay = async (values: BookingFormValues) => {
    if (!trip) return;

    if (!user) {
      toast.error("Please sign in to book");
      navigate("/auth/login", { state: { from: { pathname: `/trips/${slug}/book` } } });
      return;
    }

    if (!razorpayKey) {
      toast.error("Razorpay is not configured. Add your Key ID in Admin → Settings → Payments.");
      return;
    }

    if (total <= 0) {
      toast.error("Invalid payment amount");
      return;
    }

    setPaying(true);

    try {
      let orderId: string | undefined;

      // Prefer order-based checkout (enables signature verification)
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.functions.invoke("razorpay-create-order", {
            body: {
              amount: toPaise(total),
              currency: "INR",
              receipt: `trip_${trip.slug}_${Date.now()}`,
              notes: { trip_id: trip.id, trip_title: trip.title, user_id: user.id },
            },
          });
          if (!error && data?.order?.id) {
            orderId = String(data.order.id);
          }
        } catch {
          // Checkout can still run; verification uses payment API fetch
        }
      }

      const lead = values.travelers[0];
      const opened = await openRazorpayCheckout({
        key: razorpayKey,
        amount: toPaise(total),
        currency: "INR",
        name: settings.site_name || "Dream Go India",
        description: trip.title,
        order_id: orderId,
        prefill: {
          name: lead?.name || profile?.full_name || "",
          email: lead?.email || user.email || "",
          contact: lead?.phone || profile?.phone || settings.contact_phone || "",
        },
        notes: {
          trip_id: trip.id,
          trip_slug: trip.slug,
          user_id: user.id,
        },
        theme: { color: settings.primary_color || "#E53935" },
        handler: async (response) => {
          try {
            toast.loading("Verifying payment…", { id: "pay-verify" });
            const result = await createPaidBooking({
              userId: user.id,
              tripId: trip.id,
              travelers: values.travelers,
              totalAmount: total,
              discountAmount: discount,
              specialRequests: values.specialRequests,
              payment: response,
            });
            setBookingNumber(result.bookingNumber);
            setPaymentId(response.razorpay_payment_id);
            setPaymentVerified(result.verified);
            setBookingStatusLabel(result.bookingStatus);
            setStep(4);
            if (result.verified) {
              toast.success("Payment verified! Booking confirmed.", { id: "pay-verify" });
            } else {
              toast.success("Booking saved — payment pending verification.", {
                id: "pay-verify",
              });
            }
          } catch (e) {
            console.error(e);
            toast.error(
              (e as Error).message ||
                "Payment could not be verified. Contact support with your payment ID.",
              { id: "pay-verify" }
            );
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            toast("Payment cancelled", { icon: "ℹ️" });
          },
        },
      });

      if (opened === "failed") {
        toast.error("Could not load Razorpay. Check your connection and try again.");
        setPaying(false);
      }
    } catch (e) {
      toast.error((e as Error).message || "Payment failed to start");
      setPaying(false);
    }
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
                      <h2 className="mb-6 text-xl font-bold">Payment</h2>
                      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-primary/5 to-orange-50 p-6">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <CreditCard className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Pay securely with Razorpay</p>
                            <p className="text-sm text-gray-500">UPI · Cards · Net Banking · Wallets</p>
                          </div>
                        </div>

                        <div className="mb-4 rounded-xl bg-white p-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Amount to pay</span>
                            <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
                          </div>
                        </div>

                        <div className="mb-4 flex flex-wrap gap-2">
                          {["UPI", "Card", "Net Banking", "Wallet"].map((m) => (
                            <span
                              key={m}
                              className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm"
                            >
                              {m}
                            </span>
                          ))}
                        </div>

                        {!user && (
                          <p className="mb-3 text-sm text-amber-700">
                            You need to{" "}
                            <Link
                              to="/auth/login"
                              state={{ from: { pathname: `/trips/${slug}/book` } }}
                              className="font-semibold underline"
                            >
                              login
                            </Link>{" "}
                            before paying.
                          </p>
                        )}

                        {!razorpayKey && (
                          <p className="mb-3 text-sm text-red-600">
                            Razorpay Key ID missing. Add it in Admin → Settings → Payments (or
                            VITE_RAZORPAY_KEY_ID in .env).
                          </p>
                        )}

                        <p className="flex items-center gap-1.5 text-xs text-gray-500">
                          <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                          100% secure checkout powered by Razorpay
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
                      <h2 className="text-2xl font-bold text-gray-900">
                        {paymentVerified ? "Booking Confirmed!" : "Booking Received"}
                      </h2>
                      <p className="mt-2 text-gray-600">
                        {paymentVerified
                          ? "Payment verified successfully. Your adventure awaits."
                          : "Your booking is saved. Payment status is pending verification."}
                      </p>
                      <div className="mt-6 space-y-3">
                        <div className="rounded-xl bg-primary/5 p-4">
                          <p className="text-sm text-gray-500">Booking Number</p>
                          <p className="text-xl font-bold text-primary">{bookingNumber}</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl bg-gray-50 p-4">
                            <p className="text-sm text-gray-500">Booking status</p>
                            <p className="text-sm font-semibold capitalize text-gray-800">
                              {bookingStatusLabel}
                            </p>
                          </div>
                          <div className="rounded-xl bg-gray-50 p-4">
                            <p className="text-sm text-gray-500">Payment status</p>
                            <p
                              className={`text-sm font-semibold ${
                                paymentVerified ? "text-green-700" : "text-amber-700"
                              }`}
                            >
                              {paymentVerified ? "Paid (verified)" : "Pending verification"}
                            </p>
                          </div>
                        </div>
                        {paymentId && (
                          <div className="rounded-xl bg-gray-50 p-4">
                            <p className="text-sm text-gray-500">Razorpay Payment ID</p>
                            <p className="break-all text-sm font-semibold text-gray-800">{paymentId}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-6 flex justify-center gap-4">
                        <Link to="/dashboard">
                          <Button>View My Bookings</Button>
                        </Link>
                        <Link to="/trips">
                          <Button variant="outline">Browse More Trips</Button>
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
                <Button
                  disabled={paying || (step === 3 && (!razorpayKey || total <= 0))}
                  onClick={
                    step === 3
                      ? handleSubmit(payWithRazorpay)
                      : step === 1
                        ? handleSubmit(() => setStep(2))
                        : () => setStep(3)
                  }
                >
                  {step === 3 ? (
                    paying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Opening Razorpay…
                      </>
                    ) : (
                      <>Pay {formatPrice(total)}</>
                    )
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
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
