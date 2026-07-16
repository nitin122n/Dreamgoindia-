import { useRef, useState, useCallback } from "react";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUploadImage } from "@/hooks/useAdmin";
import { isSupabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
const ACCEPT_ATTR = ".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp";

interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
}

export function ImageUploader({ value, onChange, folder = "uploads", className }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadImage();
  const [dragging, setDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const validateFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const validExt = ["png", "jpg", "jpeg", "svg", "webp"];
    if (!ACCEPTED_TYPES.includes(file.type) && !validExt.includes(ext ?? "")) {
      toast.error("Supported formats: PNG, JPG, JPEG, SVG, WEBP");
      return false;
    }
    return true;
  };

  const handleFile = async (file: File) => {
    if (!validateFile(file)) return;
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

  return (
    <div className={cn("space-y-3", className)}>
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
          "relative h-[220px] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50/80 transition-colors",
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
          <div className="flex h-full flex-col items-center justify-center gap-4 px-4 py-5">
            <div className="relative flex h-[160px] w-[160px] shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white">
              <img
                src={value}
                alt="Uploaded preview"
                className="max-h-[160px] max-w-[160px] object-contain"
              />
              <button
                type="button"
                onClick={() => onChange("")}
                aria-label="Remove image"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                className="h-11 rounded-lg"
                onClick={openFilePicker}
                disabled={upload.isPending}
              >
                <Upload className="h-4 w-4" />
                Replace Image
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-lg"
                onClick={() => onChange("")}
                disabled={upload.isPending}
              >
                Remove Image
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
            {upload.isPending ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                  <ImagePlus className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Drag image here</p>
                  <p className="text-xs text-gray-500">or</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 rounded-lg"
                  onClick={openFilePicker}
                >
                  Browse Files
                </Button>
                <p className="text-xs text-gray-400">
                  PNG, JPG, JPEG, SVG, WEBP
                  {!isSupabaseConfigured && " · Local preview in demo mode"}
                </p>
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
          className="h-11 rounded-lg"
        />
        <Button
          type="button"
          variant="outline"
          className="h-11 shrink-0 rounded-lg px-4"
          onClick={() => {
            if (urlInput.trim()) {
              onChange(urlInput.trim());
              setUrlInput("");
              toast.success("Image URL applied");
            }
          }}
        >
          Use URL
        </Button>
      </div>
    </div>
  );
}
