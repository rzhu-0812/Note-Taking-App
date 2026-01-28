"use client";

import type React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Menu, X, FileText, NotebookPen } from "lucide-react";
import type { Note, Box } from "@/types";
import { createNote, createBox } from "@/types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Sidebar } from "@/components/sidebar/sidebar";
import { NoteCard } from "@/components/notes/note-card";
import { NoteEditor } from "@/components/editor/note-editor";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { cn } from "@/lib/utils";

const DEFAULT_BOXES: Box[] = [
  { id: "default", name: "Personal", notes: [] },
];

export default function JotBoxApp() {
  const [boxes, setBoxes, isInitialized] = useLocalStorage<Box[]>(
    "jotbox-boxes",
    DEFAULT_BOXES
  );

  const normalizedBoxes = useMemo(
    () =>
      boxes.map((b) => ({
        ...b,
        notes: Array.isArray(b.notes) ? b.notes : [],
      })),
    [boxes]
  );

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

  const currentBox = useMemo(
    () => normalizedBoxes.find((b) => b.id === currentBoxId),
    [normalizedBoxes, currentBoxId]
  );
  
  const notes = useMemo(() => {
    const boxNotes = currentBox?.notes ?? [];
    return [...boxNotes].sort((a, b) => {
      if (a.bookmarked && !b.bookmarked) return -1;
      if (!a.bookmarked && b.bookmarked) return 1;
      return 0;
    });
  }, [currentBox?.notes]);
  
  const deletingNote = notes.find((n) => n.id === deletingNoteId);

  const allNotesCount = useMemo(
    () => normalizedBoxes.reduce((total, box) => total + box.notes.length, 0),
    [normalizedBoxes]
  );

  const handleCreateNote = useCallback(() => {
    if (!currentBoxId) return;

    const newNote = createNote();

    setBoxes((prev) =>
      prev.map((box) =>
        box.id === currentBoxId
          ? { ...box, notes: [newNote, ...(box.notes ?? [])] }
          : box
      )
    );

    setEditingNote(newNote);
    setShowEditor(true);
  }, [currentBoxId, setBoxes]);

  const handleEditNote = useCallback((note: Note) => {
    setEditingNote(note);
    setShowEditor(true);
  }, []);

  const handleSaveNote = useCallback(
    (updatedNote: Note) => {
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
    },
    [currentBoxId, setBoxes]
  );

  const handleDeleteNote = useCallback(() => {
    if (!deletingNoteId) return;

    setBoxes((prev) =>
      prev.map((box) =>
        box.id === currentBoxId
          ? {
              ...box,
              notes: (box.notes ?? []).filter((note) => note.id !== deletingNoteId),
            }
          : box
      )
    );
    setDeletingNoteId(null);
  }, [deletingNoteId, currentBoxId, setBoxes]);

  const handleToggleBookmark = useCallback(
    (noteId: string) => {
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
    },
    [currentBoxId, setBoxes]
  );

  const handleCreateBox = useCallback(
    (name: string) => {
      const newBox = createBox(name);
      setBoxes((prev) => [...prev, newBox]);
    },
    [setBoxes]
  );

  const handleEditBox = useCallback(
    (boxId: string, name: string) => {
      setBoxes((prev) =>
        prev.map((box) => (box.id === boxId ? { ...box, name } : box))
      );
    },
    [setBoxes]
  );

  const handleDeleteBox = useCallback(
    (boxId: string) => {
      setBoxes((prev) => {
        const filtered = prev.filter((box) => box.id !== boxId);
        if (currentBoxId === boxId && filtered.length > 0) {
          setCurrentBoxId(filtered[0].id);
        }
        return filtered;
      });
    },
    [currentBoxId, setBoxes]
  );

  const handleMoveBox = useCallback(
    (fromIndex: number, toIndex: number) => {
      setBoxes((prev) => {
        const newBoxes = [...prev];
        const [moved] = newBoxes.splice(fromIndex, 1);
        newBoxes.splice(toIndex, 0, moved);
        return newBoxes;
      });
    },
    [setBoxes]
  );

  const handleMoveNoteBetweenBoxes = useCallback(
    (noteId: string, fromBoxId: string, toBoxId: string) => {
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
    },
    [setBoxes]
  );

  const handleNoteDragStart = useCallback(
    (e: React.DragEvent, note: Note) => {
      e.dataTransfer.setData("text/plain", `note:${note.id}:${currentBoxId}`);
      e.dataTransfer.effectAllowed = "move";
    },
    [currentBoxId]
  );

  if (!isInitialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="h-14 bg-card border-b border-border px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors lg:hidden"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-primary rounded-lg">
              <NotebookPen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">JotBox</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={cn(
            "fixed top-16 bottom-4 left-2 z-30 transition-all duration-300 ease-out lg:relative lg:inset-auto lg:translate-x-0 lg:top-auto lg:bottom-auto lg:left-auto",
            sidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 lg:opacity-100"
          )}
        >
          <Sidebar
            boxes={normalizedBoxes}
            currentBoxId={currentBoxId}
            onBoxSelect={setCurrentBoxId}
            onBoxCreate={handleCreateBox}
            onBoxEdit={handleEditBox}
            onBoxDelete={handleDeleteBox}
            onBoxMove={handleMoveBox}
            onNoteDrop={handleMoveNoteBetweenBoxes}
          />
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-foreground/20 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">
                  {currentBox?.name || "Notes"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {notes.length === 0
                    ? "No notes yet"
                    : `${notes.length} ${notes.length === 1 ? "note" : "notes"}`}
                </p>
              </div>
              {notes.length > 0 && (
                <button
                  onClick={handleCreateNote}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25 hover:scale-105 active:scale-95 transition-all duration-150"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Note</span>
                </button>
              )}
            </div>

            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-4 bg-muted rounded-2xl mb-6">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  No notes yet
                </h2>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Start capturing your thoughts, ideas, and important
                  information in this collection.
                </p>
                <button
                  onClick={handleCreateNote}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 hover:scale-105 active:scale-95 transition-all duration-150"
                >
                  <Plus className="h-5 w-5" />
                  Create Your First Note
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={() => handleEditNote(note)}
                    onDelete={() => {
                      setDeletingNoteId(note.id);
                      setShowDeleteNoteConfirm(true);
                    }}
                    onToggleBookmark={() => handleToggleBookmark(note.id)}
                    onDragStart={(e) => handleNoteDragStart(e, note)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {allNotesCount > 0 && (
        <button
          onClick={handleCreateNote}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40 hover:scale-110 active:scale-95 transition-all duration-150 flex items-center justify-center z-40 sm:hidden"
          aria-label="Create new note"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      <NoteEditor
        note={editingNote}
        isOpen={showEditor}
        onClose={() => {
          setShowEditor(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
      />

      <ConfirmationModal
        isOpen={showDeleteNoteConfirm}
        onClose={() => {
          setShowDeleteNoteConfirm(false);
          setDeletingNoteId(null);
        }}
        onConfirm={handleDeleteNote}
        title="Delete Note"
        itemName={deletingNote?.title || "Untitled"}
        message="This note will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}