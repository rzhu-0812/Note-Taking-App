"use client";

import { Trash2, AlertCircle } from "lucide-react";
import { Modal } from "./modal";
import { cn } from "@/lib/utils";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning";
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center py-2">
        <div
          className={cn(
            "mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4",
            variant === "danger"
              ? "bg-destructive/10"
              : "bg-amber-50"
          )}
        >
          {variant === "danger" ? (
            <Trash2 className="h-6 w-6 text-destructive" />
          ) : (
            <AlertCircle className="h-6 w-6 text-amber-500" />
          )}
        </div>
        
        {itemName && (
          <p className="font-medium text-foreground mb-2 truncate max-w-[250px] mx-auto">
            {itemName}
          </p>
        )}
        
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {message}
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={cn(
              "flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]",
              variant === "danger"
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-amber-500 hover:bg-amber-600"
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}