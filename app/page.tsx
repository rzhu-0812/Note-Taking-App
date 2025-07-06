"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Plus, Menu, X, File } from "lucide-react";
import type { Note, Box } from "@/types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Sidebar } from "@/components/sidebar/sidebar";
import { NoteCard } from "@/components/notes/note-card";
import { NoteEditor } from "@/components/editor/note-editor";
import { FloatingAddButton } from "@/components/floating-add-button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

export default function JotBoxApp() {
  const [boxes, setBoxes] = useLocalStorage<Box[]>("jotbox-boxes", [
    { id: "default", name: "Default", notes: [] },
  ]);

  const normalizedBoxes = boxes.map((b) => ({
    ...b,
    notes: Array.isArray(b.notes) ? b.notes : [],
  }));

  const [currentBoxId, setCurrentBoxId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showDeleteNoteConfirm, setShowDeleteNoteConfirm] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  useEffect(() => {
    if (normalizedBoxes.length > 0 && !currentBoxId) {
      setCurrentBoxId(normalizedBoxes[0].id);
    }
  }, [normalizedBoxes, currentBoxId]);

  const currentBox = normalizedBoxes.find((b) => b.id === currentBoxId);
  const notes = currentBox?.notes ?? [];

  const allNotesCount = normalizedBoxes.reduce((total, box) => {
    const boxNotes = Array.isArray(box.notes) ? box.notes : [];
    return total + boxNotes.length;
  }, 0);

  const deletingNote = notes.find((n) => n.id === deletingNoteId);

  const createNote = () => {
    if (!currentBoxId) return;

    const newNote: Note = {
      id: `note_${Date.now()}`,
      title: "",
      content: "",
      fontSize: 16,
      color: "#000000",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bookmarked: false,
    };

    setBoxes((prev) =>
      prev.map((box) =>
        box.id === currentBoxId
          ? { ...box, notes: [newNote, ...(box.notes ?? [])] }
          : box
      )
    );

    setEditingNote(newNote);
    setShowEditor(true);
  };

  const editNote = (note: Note) => {
    setEditingNote(note);
    setShowEditor(true);
  };

  const saveNote = (updatedNote: Note) => {
    setBoxes((prev) =>
      prev.map((box) =>
        box.id === currentBoxId
          ? {
              ...box,
              notes: (box.notes ?? []).map((note) =>
                note.id === updatedNote.id ? updatedNote : note
              ),
            }
          : box
      )
    );
  };

  const deleteNote = (noteId: string) => {
    setBoxes((prev) =>
      prev.map((box) =>
        box.id === currentBoxId
          ? {
              ...box,
              notes: (box.notes ?? []).filter((note) => note.id !== noteId),
            }
          : box
      )
    );
  };

  const handleDeleteNote = () => {
    if (deletingNoteId) {
      deleteNote(deletingNoteId);
      setDeletingNoteId(null);
    }
  };

  const toggleBookmark = (noteId: string) => {
    setBoxes((prev) =>
      prev.map((box) =>
        box.id === currentBoxId
          ? {
              ...box,
              notes: (box.notes ?? []).map((note) =>
                note.id === noteId
                  ? { ...note, bookmarked: !note.bookmarked }
                  : note
              ),
            }
          : box
      )
    );
  };

  const createBox = (name: string) => {
    const newBox: Box = {
      id: `box_${Date.now()}`,
      name,
      notes: [],
    };
    setBoxes((prev) => [...prev, newBox]);
  };

  const editBox = (boxId: string, name: string) => {
    setBoxes((prev) =>
      prev.map((box) => (box.id === boxId ? { ...box, name } : box))
    );
  };

  const deleteBox = (boxId: string) => {
    setBoxes((prev) => {
      const filtered = prev.filter((box) => box.id !== boxId);
      if (currentBoxId === boxId && filtered.length > 0) {
        setCurrentBoxId(filtered[0].id);
      }
      return filtered;
    });
  };

  const moveBox = (fromIndex: number, toIndex: number) => {
    setBoxes((prev) => {
      const newBoxes = [...prev];
      const [moved] = newBoxes.splice(fromIndex, 1);
      newBoxes.splice(toIndex, 0, moved);
      return newBoxes;
    });
  };

  const moveNoteBetweenBoxes = (
    noteId: string,
    fromBoxId: string,
    toBoxId: string
  ) => {
    setBoxes((prev) => {
      const fromBox = prev.find((b) => b.id === fromBoxId);
      const note = fromBox?.notes.find((n) => n.id === noteId);

      if (!note) return prev;

      return prev.map((box) => {
        if (box.id === fromBoxId) {
          return { ...box, notes: box.notes.filter((n) => n.id !== noteId) };
        }
        if (box.id === toBoxId) {
          return { ...box, notes: [note, ...box.notes] };
        }
        return box;
      });
    });
  };

  const handleNoteDragStart = (e: React.DragEvent, note: Note) => {
    e.dataTransfer.setData("text/plain", `note:${note.id}:${currentBoxId}`);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <File className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">JotBox</h1>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <Sidebar
            boxes={normalizedBoxes}
            currentBoxId={currentBoxId}
            onBoxSelect={setCurrentBoxId}
            onBoxCreate={createBox}
            onBoxEdit={editBox}
            onBoxDelete={deleteBox}
            onBoxMove={moveBox}
            onNoteDrop={moveNoteBetweenBoxes}
          />
        )}

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentBox?.name || "Notes"}
                </h2>
                <p className="text-gray-600">
                  {notes.length} {notes.length === 1 ? "note" : "notes"}
                </p>
              </div>
            </div>

            {notes.length === 0 ? (
              <div className="text-center py-20">
                <div className="p-6 bg-blue-50 rounded-2xl w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <File className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No notes yet
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Start capturing your thoughts, ideas, and important
                  information in your personal note collection.
                </p>
                <button
                  onClick={createNote}
                  className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm mx-auto"
                >
                  <Plus className="h-5 w-5" />
                  Create Your First Note
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={() => editNote(note)}
                    onDelete={() => {
                      setDeletingNoteId(note.id);
                      setShowDeleteNoteConfirm(true);
                    }}
                    onToggleBookmark={() => toggleBookmark(note.id)}
                    onDragStart={(e) => handleNoteDragStart(e, note)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {allNotesCount > 0 && <FloatingAddButton onClick={createNote} />}

      <NoteEditor
        note={editingNote}
        isOpen={showEditor}
        onClose={() => {
          setShowEditor(false);
          setEditingNote(null);
        }}
        onSave={saveNote}
      />

      <ConfirmationModal
        isOpen={showDeleteNoteConfirm}
        onClose={() => {
          setShowDeleteNoteConfirm(false);
          setDeletingNoteId(null);
        }}
        onConfirm={handleDeleteNote}
        title="Delete Note"
        message={`Are you sure you want to delete "${
          deletingNote?.title || "Untitled Note"
        }"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
