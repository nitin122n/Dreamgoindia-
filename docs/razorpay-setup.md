# Razorpay booking setup

## 1. Require sign-in
- **Book Now** redirects guests to `/auth/login`
- Booking page `/trips/:slug/book` is protected — must be signed in

## 2. Client Key ID
Admin → Settings → Payments → **Razorpay Key ID**  
or `.env`:

```
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
```

## 3. Payment verification (required for “Paid / Confirmed”)
Deploy Edge Functions and set secrets (never put the secret in Vite):

```bash
supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
supabase secrets set RAZORPAY_KEY_SECRET=xxxxxxxx
supabase functions deploy razorpay-create-order
supabase functions deploy razorpay-verify-payment
```

### What verification does
1. Optional HMAC check: `order_id|payment_id` with secret  
2. Fetches payment from Razorpay API  
3. Accepts only `captured` / `authorized`  
4. Checks amount matches booking total  

### Status after checkout
| Verified | Booking status | Payment status |
|----------|----------------|----------------|
| Yes      | confirmed      | paid           |
| No*      | pending        | pending        |

\*Verifier not deployed / secrets missing → booking still saved as pending for admin review.  
Fraud / failed payment → booking is **not** created.
