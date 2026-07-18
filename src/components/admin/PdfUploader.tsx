import { useRef } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadImage } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface PdfUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  className?: string;
}

function fileNameFromUrl(url: string) {
  try {
    const path = decodeURIComponent(new URL(url).pathname);
    return path.split("/").pop() || "itinerary.pdf";
  } catch {
    return url.split("/").pop() || "itinerary.pdf";
  }
}

export function PdfUploader({ value, onChange, className }: PdfUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadImage();

  const handleFile = async (file: File) => {
    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast.error("Please upload a PDF file");
      return;
    }
    try {
      const result = await upload.mutateAsync({ file, folder: "media" });
      onChange(result.url);
      toast.success("PDF uploaded");
    } catch {
      toast.error("Upload failed");
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {value ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-[#0f111a] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-100">
              {fileNameFromUrl(value)}
            </p>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              View PDF
            </a>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={upload.isPending}
            >
              {upload.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Replace
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-red-500 hover:text-red-400"
              onClick={() => onChange("")}
              disabled={upload.isPending}
              aria-label="Remove PDF"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-[#0f111a] px-4 py-8 text-center transition hover:border-primary/40"
        >
          {upload.isPending ? (
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          ) : (
            <>
              <FileText className="h-7 w-7 text-gray-500" />
              <p className="text-sm font-medium text-gray-300">Upload detailed itinerary PDF</p>
              <p className="text-xs text-gray-500">PDF only · Max size per media bucket limits</p>
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-gray-200">
                <Upload className="h-3.5 w-3.5" />
                Browse PDF
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
