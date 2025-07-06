"use client";

import type React from "react";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import type { Box } from "@/types";
import { BoxItem } from "./box-item";
import { Modal } from "../ui/modal";
import { ConfirmationModal } from "../ui/confirmation-modal";

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

  const filteredBoxes = boxes.filter((box) =>
    box.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const deletingBox = boxes.find((b) => b.id === deletingBoxId);

  const handleCreateBox = () => {
    if (newBoxName.trim()) {
      onBoxCreate(newBoxName.trim());
      setNewBoxName("");
      setShowCreateModal(false);
    }
  };

  const handleEditBox = () => {
    if (newBoxName.trim() && editingBoxId) {
      onBoxEdit(editingBoxId, newBoxName.trim());
      setNewBoxName("");
      setEditingBoxId(null);
      setShowEditModal(false);
    }
  };

  const handleDeleteBox = () => {
    if (deletingBoxId) {
      onBoxDelete(deletingBoxId);
      setDeletingBoxId(null);
    }
  };

  const handleBoxDragStart = (e: React.DragEvent, index: number) => {
    setDraggedBoxIndex(index);
    e.dataTransfer.setData("text/plain", `box:${index}`);
  };

  const handleBoxDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleBoxDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");

    if (data.startsWith("box:") && draggedBoxIndex !== null) {
      onBoxMove(draggedBoxIndex, dropIndex);
    } else if (data.startsWith("note:")) {
      const [, noteId, fromBoxId] = data.split(":");
      const toBoxId = boxes[dropIndex].id;
      if (fromBoxId !== toBoxId) {
        onNoteDrop(noteId, fromBoxId, toBoxId);
      }
    }

    setDraggedBoxIndex(null);
  };

  return (
    <>
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Boxes</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Create new box"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search boxes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredBoxes.map((box, index) => (
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
          ))}
        </div>
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewBoxName("");
        }}
        title="Create New Box"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Box name..."
            value={newBoxName}
            onChange={(e) => setNewBoxName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleCreateBox()}
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setNewBoxName("");
              }}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateBox}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        title="Edit Box"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Box name..."
            value={newBoxName}
            onChange={(e) => setNewBoxName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleEditBox()}
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowEditModal(false);
                setNewBoxName("");
                setEditingBoxId(null);
              }}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEditBox}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        title="Delete Box"
        message={`Are you sure you want to delete "${
          deletingBox?.name
        }"? This will permanently delete all ${
          deletingBox?.notes.length || 0
        } notes in this box.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}
