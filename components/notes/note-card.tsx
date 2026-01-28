"use client";

import type React from "react";
import { useMemo } from "react";
import { Star, MoreHorizontal } from "lucide-react";
import type { Note } from "@/types";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NoteCardProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  onToggleBookmark: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

export function NoteCard({
  note,
  onEdit,
  onDelete,
  onToggleBookmark,
  onDragStart,
}: NoteCardProps) {
  const { wordCount, previewText } = useMemo(() => {
    let text = note.content
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<\/h[1-6]>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/[#*`_[\]()]/g, "")
      .replace(/\n\s*\n/g, "\n")
      .trim();
    
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    const preview = text.length > 120 ? text.substring(0, 120) + "..." : text;
    
    return {
      wordCount: words.length,
      previewText: preview,
    };
  }, [note.content]);

  const formattedDate = useMemo(() => {
    const date = new Date(note.updatedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, [note.updatedAt]);

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onClick={onEdit}
      className={cn(
        "group relative bg-card border border-border rounded-xl p-5",
        "hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5",
        "cursor-pointer transition-all duration-200 ease-out",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        "active:scale-[0.98]"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-card-foreground truncate flex-1 leading-snug">
          {note.title || "Untitled"}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark();
            }}
            className={cn(
              "p-1.5 rounded-lg transition-all duration-150 hover:scale-125 active:scale-95",
              note.bookmarked
                ? "text-amber-500 hover:text-amber-400"
                : "text-muted-foreground/50 opacity-0 group-hover:opacity-100 hover:text-amber-500"
            )}
            aria-label={note.bookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            <Star
              className={cn("h-4 w-4 transition-transform", note.bookmarked && "fill-current")}
            />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-all"
                aria-label="Note options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onSelect={() => {
                onEdit();
              }}>Edit note</DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  onDelete();
                }}
                className="text-destructive focus:text-destructive"
              >
                Delete note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4 whitespace-pre-line">
        {previewText || "No content"}
      </p>

      <div className="flex items-center justify-between text-xs text-muted-foreground/70">
        <span>{wordCount} words</span>
        <span>{formattedDate}</span>
      </div>
    </article>
  );
}