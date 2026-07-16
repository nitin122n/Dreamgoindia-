import type { Booking } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { defaultSettings } from "@/data/mock-data";

interface InvoiceDownloadProps {
  booking: Booking;
}

function generateInvoiceHtml(booking: Booking): string {
  const settings = defaultSettings;
  const trip = booking.trip;
  const travelers = booking.travelers
    .map((t) => `<tr><td>${t.name}</td><td>${t.age}</td><td>${t.gender}</td></tr>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${booking.booking_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a1a; }
    .header { display: flex; justify-content: space-between; border-bottom: 3px solid #e53935; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #e53935; }
    .invoice-title { font-size: 28px; font-weight: bold; text-align: right; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .meta h4 { color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
    .trip-details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f5f5f5; font-size: 12px; text-transform: uppercase; color: #666; }
    .totals { text-align: right; }
    .totals .total { font-size: 22px; font-weight: bold; color: #e53935; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; text-align: center; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">${settings.site_name}</div>
      <p style="margin-top:8px;color:#666;font-size:14px;">${settings.address}</p>
      <p style="color:#666;font-size:14px;">${settings.contact_email} | ${settings.contact_phone}</p>
    </div>
    <div>
      <div class="invoice-title">INVOICE</div>
      <p style="text-align:right;margin-top:8px;color:#666;">#${booking.booking_number}</p>
      <p style="text-align:right;color:#666;">Date: ${format(new Date(booking.created_at), "MMM d, yyyy")}</p>
    </div>
  </div>

  <div class="meta">
    <div>
      <h4>Bill To</h4>
      <p><strong>${booking.travelers[0]?.name ?? "Customer"}</strong></p>
      ${booking.travelers[0]?.phone ? `<p>${booking.travelers[0].phone}</p>` : ""}
    </div>
    <div style="text-align:right;">
      <h4>Status</h4>
      <p><strong style="text-transform:capitalize;">${booking.status}</strong></p>
    </div>
  </div>

  <div class="trip-details">
    <h3 style="margin-bottom:8px;">${trip?.title ?? "Trip Package"}</h3>
    <p style="color:#666;">${trip?.location ?? ""}</p>
    ${booking.departure?.departure_date ? `<p style="margin-top:8px;">Departure: ${format(new Date(booking.departure.departure_date), "MMMM d, yyyy")}</p>` : ""}
    <p>Duration: ${trip?.duration_days ?? "—"} Days / ${trip?.duration_nights ?? "—"} Nights</p>
  </div>

  <h4 style="margin-bottom:12px;">Travelers</h4>
  <table>
    <thead><tr><th>Name</th><th>Age</th><th>Gender</th></tr></thead>
    <tbody>${travelers}</tbody>
  </table>

  <div class="totals">
    ${booking.discount_amount > 0 ? `<p>Discount: -${formatPrice(booking.discount_amount)}</p>` : ""}
    <p class="total">Total: ${formatPrice(booking.total_amount)}</p>
  </div>

  <div class="footer">
    <p>Thank you for choosing ${settings.site_name}!</p>
    <p>${settings.footer_text}</p>
    <p>&copy; ${settings.site_name || "Dream Go India"} | Tour and travel company, India | Since 2016 &ndash; ${new Date().getFullYear()} | All rights reserved.</p>
  </div>
</body>
</html>`;
}

export function InvoiceDownload({ booking }: InvoiceDownloadProps) {
  const handleDownload = () => {
    const html = generateInvoiceHtml(booking);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${booking.booking_number}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const html = generateInvoiceHtml(booking);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Download className="mr-1.5 h-3.5 w-3.5" />
        Print
      </Button>
      <Button size="sm" onClick={handleDownload}>
        <Download className="mr-1.5 h-3.5 w-3.5" />
        Invoice
      </Button>
    </div>
  );
}

export { generateInvoiceHtml };
