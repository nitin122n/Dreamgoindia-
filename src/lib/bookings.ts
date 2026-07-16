import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { generateBookingNumber } from "@/lib/utils";
import { toPaise, type RazorpaySuccessResponse } from "@/lib/razorpay";

export type BookingTraveler = {
  name: string;
  age: number;
  gender: string;
  phone?: string;
  email?: string;
};

export type CreateBookingInput = {
  userId: string;
  tripId: string;
  travelers: BookingTraveler[];
  totalAmount: number;
  discountAmount: number;
  specialRequests?: string;
  payment: RazorpaySuccessResponse;
};

export type CreateBookingResult = {
  bookingId: string;
  bookingNumber: string;
  paymentStatus: "paid" | "pending";
  bookingStatus: "confirmed" | "pending";
  verified: boolean;
  verifyError?: string;
};

export type VerifyPaymentResult = {
  verified: boolean;
  error?: string;
  /** true when Edge Function / secrets are missing (not a fraud rejection) */
  unavailable?: boolean;
  payment?: Record<string, unknown>;
};

function isFraudRejection(error?: string): boolean {
  if (!error) return false;
  return /invalid payment signature|amount mismatch|status is|missing payment/i.test(error);
}

function isVerifierUnavailable(error?: string): boolean {
  if (!error) return false;
  return /not configured|failed to (send|fetch)|FunctionsRelayError|Function not found|404/i.test(
    error
  );
}

/** Server-side Razorpay verification via Edge Function */
export async function verifyRazorpayPayment(
  payment: RazorpaySuccessResponse,
  expectedAmountRupees: number
): Promise<VerifyPaymentResult> {
  if (!isSupabaseConfigured) {
    return { verified: false, unavailable: true, error: "Supabase not configured" };
  }

  const { data, error } = await supabase.functions.invoke("razorpay-verify-payment", {
    body: {
      razorpay_payment_id: payment.razorpay_payment_id,
      razorpay_order_id: payment.razorpay_order_id,
      razorpay_signature: payment.razorpay_signature,
      expected_amount: toPaise(expectedAmountRupees),
    },
  });

  if (error) {
    const msg = error.message || "Verification request failed";
    return {
      verified: false,
      unavailable: isVerifierUnavailable(msg),
      error: msg,
    };
  }

  if (!data?.verified) {
    const msg = String(data?.error ?? "Payment could not be verified");
    return {
      verified: false,
      unavailable: isVerifierUnavailable(msg),
      error: msg,
      payment: data?.payment,
    };
  }

  return { verified: true, payment: data.payment };
}

/**
 * Create booking after Razorpay checkout.
 * - Verified payment → booking confirmed + payment paid
 * - Verifier unavailable → booking/payment pending (admin can confirm)
 * - Fraud / failed payment → throws, no booking
 */
export async function createPaidBooking(
  input: CreateBookingInput
): Promise<CreateBookingResult> {
  const bookingNumber = generateBookingNumber();
  const verification = await verifyRazorpayPayment(input.payment, input.totalAmount);

  if (!verification.verified && isFraudRejection(verification.error)) {
    throw new Error(verification.error || "Payment verification failed");
  }

  const verified = verification.verified;
  const bookingStatus = verified ? "confirmed" : "pending";
  const paymentStatus = verified ? "paid" : "pending";

  if (!isSupabaseConfigured) {
    if (!verified) {
      throw new Error(
        verification.error ||
          "Payment could not be verified. Deploy razorpay-verify-payment and set Razorpay secrets."
      );
    }
    return {
      bookingId: crypto.randomUUID(),
      bookingNumber,
      paymentStatus,
      bookingStatus,
      verified,
    };
  }

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      booking_number: bookingNumber,
      user_id: input.userId,
      trip_id: input.tripId,
      travelers: input.travelers,
      total_amount: input.totalAmount,
      discount_amount: input.discountAmount,
      status: bookingStatus,
      special_requests: input.specialRequests || null,
    })
    .select("id, booking_number")
    .single();

  if (bookingError || !booking) {
    throw new Error(bookingError?.message || "Failed to create booking. Are you signed in?");
  }

  const { error: paymentError } = await supabase.from("payments").insert({
    booking_id: booking.id,
    user_id: input.userId,
    amount: input.totalAmount,
    currency: "INR",
    payment_method: "razorpay",
    transaction_id: input.payment.razorpay_payment_id,
    status: paymentStatus,
    payment_gateway: "razorpay",
    gateway_response: {
      checkout: input.payment,
      verification,
    },
    paid_at: verified ? new Date().toISOString() : null,
  });

  if (paymentError) {
    console.warn("Payment row insert failed:", paymentError.message);
  }

  return {
    bookingId: String(booking.id),
    bookingNumber: String(booking.booking_number),
    paymentStatus,
    bookingStatus,
    verified,
    verifyError: verified ? undefined : verification.error,
  };
}
