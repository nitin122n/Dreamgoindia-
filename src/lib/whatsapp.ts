/** Digits only, with India country code when a 10-digit mobile is given. */
export function normalizeWhatsAppNumber(raw?: string | null): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  // Strip leading 0 from local numbers like 09876543210
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Indian mobile without country code
  if (digits.length === 10) {
    digits = `91${digits}`;
  }

  // Must look like an international number
  if (digits.length < 11 || digits.length > 15) return null;
  return digits;
}

export function buildWhatsAppUrl(
  number: string,
  message = "Hi! I'm interested in booking a trip with Dream Go India."
): string {
  const text = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${text}`;
}

/** Prefer dedicated WhatsApp field, then env, then contact phone. */
export function resolveWhatsAppNumber(options: {
  whatsapp?: string | null;
  contactPhone?: string | null;
  envNumber?: string | null;
}): string | null {
  return (
    normalizeWhatsAppNumber(options.whatsapp) ||
    normalizeWhatsAppNumber(options.envNumber) ||
    normalizeWhatsAppNumber(options.contactPhone)
  );
}
