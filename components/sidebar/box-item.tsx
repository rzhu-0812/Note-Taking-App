"use client";

import type React from "react";
import { Folder, MoreHorizontal, GripVertical } from "lucide-react";
import type { Box } from "@/types";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BoxItemProps {
  box: Box;
  isActive: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  canDelete: boolean;
}

export function BoxItem({
  box,
  isActive,
  onClick,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  canDelete,
}: BoxItemProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:translate-x-0.5"
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 cursor-grab transition-opacity" />

      <Folder
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isActive ? "text-sidebar-primary" : "text-muted-foreground"
        )}
      />

      <span className="truncate flex-1 text-sm font-medium">{box.name}</span>

      <span
        className={cn(
          "text-xs tabular-nums px-1.5 py-0.5 rounded",
          isActive
            ? "bg-sidebar-primary/10 text-sidebar-primary"
            : "text-muted-foreground"
        )}
      >
        {box.notes.length}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded text-muted-foreground/50 hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Box options"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem onClick={onEdit}>Rename</DropdownMenuItem>
          {canDelete && (
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}