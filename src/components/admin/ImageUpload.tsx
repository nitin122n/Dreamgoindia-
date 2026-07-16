import { useRef, useState, useCallback } from "react";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUploadImage } from "@/hooks/useAdmin";
import { isSupabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { FormField } from "@/components/admin/FormField";
import { adminInputClass } from "@/components/admin/admin-styles";
import toast from "react-hot-toast";

const ACCEPT_ATTR = ".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
  compact?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  folder = "uploads",
  label = "Image",
  className,
  compact = true,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadImage();
  const [dragging, setDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const handleFile = async (file: File) => {
    try {
      const result = await upload.mutateAsync({ file, folder });
      onChange(result.url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    }
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [folder]
  );

  const openFilePicker = () => inputRef.current?.click();
  const boxHeight = compact ? "h-[180px]" : "h-[220px]";

  return (
    <FormField label={label} className={className}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={onDrop}
        className={cn(
          "relative w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50/80 transition-colors",
          boxHeight,
          dragging && "border-primary bg-primary/5",
          upload.isPending && "pointer-events-none"
        )}
      >
        {upload.isPending && (
          <div className="absolute inset-x-0 top-0 z-10 h-1 overflow-hidden bg-gray-200">
            <div className="h-full w-1/2 animate-pulse bg-primary" />
          </div>
        )}

        {value ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-4">
            <div className="relative flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white">
              <img
                src={value}
                alt="Preview"
                className="max-h-[120px] max-w-[120px] object-contain"
              />
              <button
                type="button"
                onClick={() => onChange("")}
                aria-label="Remove image"
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-9 rounded-lg"
                onClick={openFilePicker}
                disabled={upload.isPending}
              >
                <Upload className="h-3.5 w-3.5" />
                Replace
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-lg"
                onClick={() => onChange("")}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
            {upload.isPending ? (
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            ) : (
              <>
                <ImagePlus className="h-7 w-7 text-gray-400" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drag image here or</p>
                <Button type="button" variant="secondary" size="sm" className="h-9 rounded-lg" onClick={openFilePicker}>
                  Browse Files
                </Button>
                {!isSupabaseConfigured && (
                  <p className="text-xs text-gray-400">Demo mode — local preview</p>
                )}
              </>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Or paste image URL"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className={adminInputClass}
        />
        <Button
          type="button"
          variant="outline"
          className="h-11 shrink-0 rounded-lg px-4"
          onClick={() => {
            if (urlInput.trim()) {
              onChange(urlInput.trim());
              setUrlInput("");
            }
          }}
        >
          Use URL
        </Button>
      </div>
    </FormField>
  );
}
