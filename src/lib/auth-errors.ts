/** Map Supabase Auth errors to clear user-facing messages. */
export function friendlyAuthError(message: string | undefined | null, fallback: string): string {
  const raw = (message || "").trim();
  const msg = raw.toLowerCase();

  if (!raw) return fallback;

  if (
    msg.includes("rate limit") ||
    msg.includes("over_email_send_rate_limit") ||
    msg.includes("email rate limit exceeded")
  ) {
    return "Too many emails were sent. Wait about 1 hour, or finish Custom SMTP in Supabase, then try once.";
  }

  if (msg.includes("smtp") || msg.includes("error sending") || msg.includes("confirmation email")) {
    return "Email delivery failed. You can still sign in with email and password if your account was created.";
  }

  if (msg.includes("user already registered") || msg.includes("already been registered")) {
    return "This email is already registered. Try signing in or use Forgot Password.";
  }

  if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
    return "Incorrect email or password.";
  }

  if (msg.includes("email not confirmed")) {
    return "Email confirmation is still enabled in Supabase. Turn OFF “Confirm email” under Authentication → Providers → Email, then try again.";
  }

  return raw;
}
