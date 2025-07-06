"use client";

import type React from "react";

import { useState } from "react";
import { Edit3, Trash2, Star } from "lucide-react";
import type { Note } from "@/types";

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
  const [showActions, setShowActions] = useState(false);

  const getWordCount = (content: string) => {
    const text = content
      .replace(/<[^>]*>/g, "")
      .replace(/[#*`_[\]()]/g, "")
      .trim();
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  };

  const getPreviewText = (content: string) => {
    const text = content
      .replace(/<[^>]*>/g, "")
      .replace(/[#*`_[\]()]/g, "")
      .trim();
    return text.length > 120 ? text.substring(0, 120) + "..." : text;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;

    return date.toLocaleDateString();
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 cursor-pointer group hover:border-gray-300"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-bold text-gray-900 truncate flex-1 text-lg leading-tight">
          {note.title || "Untitled Note"}
        </h3>
        <div
          className={`flex items-center gap-1 transition-all duration-200 ${
            showActions
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-2"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark();
            }}
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
              note.bookmarked ? "text-yellow-500" : "text-gray-400"
            }`}
            title={note.bookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            <Star
              className={`h-4 w-4 ${note.bookmarked ? "fill-current" : ""}`}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-blue-600"
            title="Edit note"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-red-600"
            title="Delete note"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
        {getPreviewText(note.content) || "No content"}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="bg-gray-100 px-2 py-1 rounded-full">
          {getWordCount(note.content)} words
        </span>
        <span>{formatDate(note.updatedAt)}</span>
      </div>
    </div>
  );
}
