"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { Plus, Search, X } from "lucide-react";
import type { Box } from "@/types";
import { BoxItem } from "./box-item";
import { Modal } from "../ui/modal";
import { ConfirmationModal } from "../ui/confirmation-modal";
import { cn } from "@/lib/utils";

interface SidebarProps {
  boxes: Box[];
  currentBoxId: string | null;
  onBoxSelect: (boxId: string) => void;
  onBoxCreate: (name: string) => void;
  onBoxEdit: (boxId: string, name: string) => void;
  onBoxDelete: (boxId: string) => void;
  onBoxMove: (fromIndex: number, toIndex: number) => void;
  onNoteDrop: (noteId: string, fromBoxId: string, toBoxId: string) => void;
}

export function Sidebar({
  boxes,
  currentBoxId,
  onBoxSelect,
  onBoxCreate,
  onBoxEdit,
  onBoxDelete,
  onBoxMove,
  onNoteDrop,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingBoxId, setEditingBoxId] = useState<string | null>(null);
  const [deletingBoxId, setDeletingBoxId] = useState<string | null>(null);
  const [newBoxName, setNewBoxName] = useState("");
  const [draggedBoxIndex, setDraggedBoxIndex] = useState<number | null>(null);

  const filteredBoxes = searchTerm
    ? boxes.filter((box) =>
        box.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : boxes;

  const deletingBox = boxes.find((b) => b.id === deletingBoxId);

  const handleCreateBox = useCallback(() => {
    const trimmedName = newBoxName.trim();
    if (trimmedName) {
      onBoxCreate(trimmedName);
      setNewBoxName("");
      setShowCreateModal(false);
    }
  }, [newBoxName, onBoxCreate]);

  const handleEditBox = useCallback(() => {
    const trimmedName = newBoxName.trim();
    if (trimmedName && editingBoxId) {
      onBoxEdit(editingBoxId, trimmedName);
      setNewBoxName("");
      setEditingBoxId(null);
      setShowEditModal(false);
    }
  }, [newBoxName, editingBoxId, onBoxEdit]);

  const handleDeleteBox = useCallback(() => {
    if (deletingBoxId) {
      onBoxDelete(deletingBoxId);
      setDeletingBoxId(null);
    }
  }, [deletingBoxId, onBoxDelete]);

  const handleBoxDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      setDraggedBoxIndex(index);
      e.dataTransfer.setData("text/plain", `box:${index}`);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleBoxDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleBoxDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      const data = e.dataTransfer.getData("text/plain");

      if (data.startsWith("box:") && draggedBoxIndex !== null) {
        if (draggedBoxIndex !== dropIndex) {
          onBoxMove(draggedBoxIndex, dropIndex);
        }
      } else if (data.startsWith("note:")) {
        const [, noteId, fromBoxId] = data.split(":");
        const toBoxId = boxes[dropIndex].id;
        if (fromBoxId !== toBoxId) {
          onNoteDrop(noteId, fromBoxId, toBoxId);
        }
      }

      setDraggedBoxIndex(null);
    },
    [draggedBoxIndex, boxes, onBoxMove, onNoteDrop]
  );

  const totalNotes = boxes.reduce((sum, box) => sum + box.notes.length, 0);

  return (
    <>
      <aside className="w-72 bg-sidebar border border-sidebar-border lg:border-r lg:border-y-0 lg:border-l-0 flex flex-col h-full lg:rounded-none rounded-2xl shadow-2xl lg:shadow-none overflow-hidden">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-sidebar-foreground">
                Collections
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {boxes.length} {boxes.length === 1 ? "box" : "boxes"},{" "}
                {totalNotes} notes
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 bg-sidebar-primary text-sidebar-primary-foreground rounded-lg hover:bg-sidebar-primary/90 hover:shadow-md hover:shadow-sidebar-primary/25 hover:scale-110 active:scale-95 transition-all duration-150"
              aria-label="Create new box"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search boxes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "w-full pl-9 pr-8 py-2 text-sm bg-sidebar-accent/50 border border-sidebar-border rounded-lg",
                "placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-sidebar-ring focus:border-transparent",
                "transition-colors"
              )}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin p-2">
          <div className="space-y-1">
            {filteredBoxes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 px-4">
                {searchTerm ? "No boxes found" : "No boxes yet"}
              </p>
            ) : (
              filteredBoxes.map((box, index) => (
                <BoxItem
                  key={box.id}
                  box={box}
                  isActive={box.id === currentBoxId}
                  onClick={() => onBoxSelect(box.id)}
                  onEdit={() => {
                    setEditingBoxId(box.id);
                    setNewBoxName(box.name);
                    setShowEditModal(true);
                  }}
                  onDelete={() => {
                    setDeletingBoxId(box.id);
                    setShowDeleteConfirm(true);
                  }}
                  onDragStart={(e) => handleBoxDragStart(e, index)}
                  onDragOver={handleBoxDragOver}
                  onDrop={(e) => handleBoxDrop(e, index)}
                  canDelete={boxes.length > 1}
                />
              ))
            )}
          </div>
        </nav>
      </aside>

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewBoxName("");
        }}
        title="New Collection"
        size="sm"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Collection name..."
            value={newBoxName}
            onChange={(e) => setNewBoxName(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleCreateBox()}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setNewBoxName("");
              }}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all hover:scale-105 active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateBox}
              disabled={!newBoxName.trim()}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
              Create
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setNewBoxName("");
          setEditingBoxId(null);
        }}
        title="Rename Collection"
        size="sm"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Collection name..."
            value={newBoxName}
            onChange={(e) => setNewBoxName(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleEditBox()}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowEditModal(false);
                setNewBoxName("");
                setEditingBoxId(null);
              }}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all hover:scale-105 active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleEditBox}
              disabled={!newBoxName.trim()}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingBoxId(null);
        }}
        onConfirm={handleDeleteBox}
        title="Delete Collection"
        itemName={deletingBox?.name}
        message={`This will permanently delete all ${deletingBox?.notes.length || 0} notes in this collection. This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}