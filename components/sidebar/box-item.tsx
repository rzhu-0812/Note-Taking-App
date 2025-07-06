"use client";

import type React from "react";

import { useState } from "react";
import { Edit3, Trash2, Archive } from "lucide-react";
import type { Box } from "@/types";

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
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all group ${
        isActive
          ? "bg-blue-100 text-blue-700"
          : "hover:bg-gray-100 text-gray-700"
      }`}
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Archive className="h-4 w-4 flex-shrink-0" />
        <span className="truncate font-medium">{box.name}</span>
        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
          {box.notes.length}
        </span>
      </div>

      <div
        className={`flex items-center gap-1 transition-opacity ${
          showActions ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1 rounded hover:bg-gray-200 transition-colors"
          title="Edit box"
        >
          <Edit3 className="h-3 w-3" />
        </button>
        {canDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded hover:bg-gray-200 transition-colors text-red-600"
            title="Delete box"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
