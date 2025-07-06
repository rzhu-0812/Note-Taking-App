"use client";

import { useState } from "react";

export function useDragAndDrop() {
  const [draggedItem, setDraggedItem] = useState<{
    type: "note" | "section";
    id: string;
    sectionId?: string;
    index?: number;
  } | null>(null);

  const [dropTarget, setDropTarget] = useState<{
    type: "note" | "section";
    id: string;
    position?: "before" | "after";
  } | null>(null);

  const startDrag = (item: typeof draggedItem) => {
    setDraggedItem(item);
  };

  const endDrag = () => {
    setDraggedItem(null);
    setDropTarget(null);
  };

  const setTarget = (target: typeof dropTarget) => {
    setDropTarget(target);
  };

  return {
    draggedItem,
    dropTarget,
    startDrag,
    endDrag,
    setTarget,
  };
}
