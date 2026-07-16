import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type DialogSize = "md" | "lg" | "xl" | "2xl";

const sizeClasses: Record<DialogSize, string> = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

interface AdminFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  onCancel: () => void;
  onSave: () => void;
  saveLabel?: string;
  saving?: boolean;
  size?: DialogSize;
}

export function AdminFormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onCancel,
  onSave,
  saveLabel = "Save",
  saving = false,
  size = "lg",
}: AdminFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "dark max-h-[90vh] overflow-y-auto border-white/10 bg-[#161b26] text-gray-100",
          sizeClasses[size]
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-gray-400">{description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="grid gap-5">{children}</div>
        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-lg"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-11 rounded-lg bg-primary hover:bg-primary-dark"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Saving..." : saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
