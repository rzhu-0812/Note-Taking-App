"use client";

import { Plus } from "lucide-react";

interface FloatingAddButtonProps {
  onClick: () => void;
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40 hover:scale-105"
      title="Add new note"
    >
      <Plus className="h-7 w-7" />
    </button>
  );
}
