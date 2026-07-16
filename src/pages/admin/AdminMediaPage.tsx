import { useRef } from "react";
import { Trash2, Upload } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Button } from "@/components/ui/button";
import { useAdminMedia, useAdminMediaMutations, useUploadImage } from "@/hooks/useAdmin";

function formatBytes(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminMediaPage() {
  const { data: media = [], isLoading } = useAdminMedia();
  const { remove } = useAdminMediaMutations();
  const upload = useUploadImage();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    try {
      // useUploadImage also registers the file in media_library / mock media
      await upload.mutateAsync({ file, folder: "media" });
      toast.success("Uploaded to Media Library");
    } catch {
      toast.error("Upload failed");
    }
  };

  if (isLoading) return <div className="text-gray-400">Loading...</div>;

  return (
    <AdminPageShell
      title="Media Library"
      description={`${media.length} files from website & admin uploads`}
      action={
        <>
          <Button className="h-11 rounded-lg" onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
            <Upload className="h-4 w-4" />
            Upload
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {media.map((item) => (
          <div
            key={item.id}
            className="group overflow-hidden rounded-xl border border-white/10 bg-[#161b26]"
          >
            {item.mime_type.startsWith("image/") ? (
              <img
                src={item.url}
                alt={item.alt_text ?? item.filename}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-white/5 text-gray-500">
                {item.mime_type}
              </div>
            )}
            <div className="p-3">
              <p className="truncate text-sm font-medium text-white">{item.filename}</p>
              <p className="text-xs text-gray-500">
                {item.folder ?? "media"} · {formatBytes(item.size_bytes)}
                {item.created_at ? ` · ${format(new Date(item.created_at), "dd MMM yyyy")}` : ""}
              </p>
            </div>
            <div className="flex justify-end gap-1 px-3 pb-3 opacity-0 transition group-hover:opacity-100">
              <Button
                size="sm"
                variant="ghost"
                className="text-primary hover:bg-primary/10"
                onClick={async () => {
                  if (confirm("Delete file?")) {
                    await remove.mutateAsync(item.id);
                    toast.success("Deleted");
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </AdminPageShell>
  );
}
