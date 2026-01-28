"use client";

import React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link,
  Quote,
  Undo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import type { Note, FormatState } from "@/types";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Modal } from "@/components/ui/modal";

interface NoteEditorProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
}

const initialFormatState: FormatState = {
  bold: false,
  italic: false,
  underline: false,
  h1: false,
  h2: false,
  unorderedList: false,
  orderedList: false,
  alignLeft: false,
  alignCenter: false,
  alignRight: false,
  link: false,
  code: false,
  quote: false,
};

export function NoteEditor({
  note,
  isOpen,
  onClose,
  onSave,
}: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [formatState, setFormatState] = useState<FormatState>(initialFormatState);
  const [hasContent, setHasContent] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  useEffect(() => {
    if (note && isOpen) {
      setTitle(note.title);
      if (editorRef.current) {
        editorRef.current.innerHTML = note.content || "";
        setHasContent(!!note.content);
      }
    } else if (!note) {
      setTitle("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
        setHasContent(false);
      }
    }
  }, [note, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") {
        handleSave();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, note, title]);

  const updateFormatState = useCallback(() => {
    if (!editorRef.current) return;

    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const element =
        container.nodeType === Node.TEXT_NODE
          ? container.parentElement
          : (container as Element);

      setFormatState({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        h1: element?.tagName === "H1" || document.queryCommandValue("formatBlock") === "h1",
        h2: element?.tagName === "H2" || document.queryCommandValue("formatBlock") === "h2",
        unorderedList: document.queryCommandState("insertUnorderedList"),
        orderedList: document.queryCommandState("insertOrderedList"),
        alignLeft: document.queryCommandState("justifyLeft"),
        alignCenter: document.queryCommandState("justifyCenter"),
        alignRight: document.queryCommandState("justifyRight"),
        link: element?.tagName === "A" || element?.closest("a") !== null,
        code: element?.tagName === "PRE" || element?.closest("pre") !== null,
        quote: element?.tagName === "BLOCKQUOTE" || element?.closest("blockquote") !== null,
      });
    } catch {}
  }, []);

  const handleSave = useCallback(() => {
    if (!note || !editorRef.current) return;

    const updatedNote: Note = {
      ...note,
      title: title || "Untitled",
      content: editorRef.current.innerHTML,
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedNote);
  }, [note, title, onSave]);

  const handleClose = () => {
    handleSave();
    onClose();
  };

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    setTimeout(updateFormatState, 10);
  }, [updateFormatState]);

  const toggleHeader = useCallback((headerType: "h1" | "h2") => {
    const isCurrentlyThisHeader =
      (headerType === "h1" && formatState.h1) ||
      (headerType === "h2" && formatState.h2);

    if (isCurrentlyThisHeader) {
      document.execCommand("formatBlock", false, "p");
    } else {
      document.execCommand("formatBlock", false, headerType);
    }

    editorRef.current?.focus();
    setTimeout(updateFormatState, 10);
  }, [formatState.h1, formatState.h2, updateFormatState]);

  const clearFormatting = useCallback(() => {
    document.execCommand("removeFormat", false, undefined);
    document.execCommand("formatBlock", false, "p");
    editorRef.current?.focus();
    setTimeout(updateFormatState, 10);
  }, [updateFormatState]);

  const openLinkModal = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
    setLinkUrl("");
    setShowLinkModal(true);
  }, []);

  const insertLink = useCallback(() => {
    if (!linkUrl.trim()) return;
    
    if (savedSelectionRef.current && editorRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      }
    }
    
    let url = linkUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    
    document.execCommand("createLink", false, url);
    editorRef.current?.focus();
    setTimeout(updateFormatState, 10);
    
    setShowLinkModal(false);
    setLinkUrl("");
    savedSelectionRef.current = null;
  }, [linkUrl, updateFormatState]);

  const handleEditorInput = () => {
    const content = editorRef.current?.innerHTML || "";
    setHasContent(content.length > 0 && content !== "<br>");
    updateFormatState();
  };

  if (!isOpen) return null;

  const toolbarColors = {
    text: "hover:text-[oklch(0.55_0.18_250)] hover:bg-[oklch(0.94_0.03_250)]",
    heading: "hover:text-[oklch(0.55_0.18_300)] hover:bg-[oklch(0.94_0.03_300)]",
    list: "hover:text-[oklch(0.50_0.15_145)] hover:bg-[oklch(0.94_0.03_145)]",
    align: "hover:text-[oklch(0.58_0.16_55)] hover:bg-[oklch(0.94_0.04_55)]",
    special: "hover:text-[oklch(0.45_0.15_270)] hover:bg-[oklch(0.92_0.03_270)]",
  };

  const toolbarActiveColors = {
    text: "bg-[oklch(0.94_0.03_250)] text-[oklch(0.55_0.18_250)]",
    heading: "bg-[oklch(0.94_0.03_300)] text-[oklch(0.55_0.18_300)]",
    list: "bg-[oklch(0.94_0.03_145)] text-[oklch(0.50_0.15_145)]",
    align: "bg-[oklch(0.94_0.04_55)] text-[oklch(0.58_0.16_55)]",
    special: "bg-[oklch(0.92_0.03_270)] text-[oklch(0.45_0.15_270)]",
  };

  const ToolbarButton = ({
    icon: Icon,
    title,
    active,
    onClick,
    shortcut,
    colorCategory = "text",
  }: {
    icon: React.ElementType;
    title: string;
    active?: boolean;
    onClick: () => void;
    shortcut?: string;
    colorCategory?: keyof typeof toolbarColors;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "p-2 rounded-md transition-all duration-150",
            "hover:scale-110 active:scale-95",
            active
              ? toolbarActiveColors[colorCategory]
              : cn("text-muted-foreground", toolbarColors[colorCategory])
          )}
          aria-label={title}
          type="button"
        >
          <Icon className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        {title}
        {shortcut && <span className="ml-2 text-muted-foreground">{shortcut}</span>}
      </TooltipContent>
    </Tooltip>
  );

  const ToolbarDivider = () => (
    <div className="w-px h-6 bg-border mx-1.5" />
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
        <div
          className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={handleClose}
          aria-hidden="true"
        />

        <div className="relative w-full max-w-4xl h-[90vh] bg-card rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-200">
          <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled note"
              className="flex-1 text-xl font-semibold bg-transparent border-0 outline-none placeholder:text-muted-foreground"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:block">
                Auto-saved
              </span>
              <button
                onClick={handleClose}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                aria-label="Close editor"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="flex flex-wrap items-center gap-0.5 px-4 py-2 border-b border-border bg-muted/20">
            <ToolbarButton icon={Bold} title="Bold" shortcut="Cmd+B" active={formatState.bold} onClick={() => execCommand("bold")} colorCategory="text" />
            <ToolbarButton icon={Italic} title="Italic" shortcut="Cmd+I" active={formatState.italic} onClick={() => execCommand("italic")} colorCategory="text" />
            <ToolbarButton icon={Underline} title="Underline" shortcut="Cmd+U" active={formatState.underline} onClick={() => execCommand("underline")} colorCategory="text" />
            <ToolbarDivider />
            <ToolbarButton icon={Heading1} title="Heading 1" active={formatState.h1} onClick={() => toggleHeader("h1")} colorCategory="heading" />
            <ToolbarButton icon={Heading2} title="Heading 2" active={formatState.h2} onClick={() => toggleHeader("h2")} colorCategory="heading" />
            <ToolbarDivider />
            <ToolbarButton icon={List} title="Bullet list" active={formatState.unorderedList} onClick={() => execCommand("insertUnorderedList")} colorCategory="list" />
            <ToolbarButton icon={ListOrdered} title="Numbered list" active={formatState.orderedList} onClick={() => execCommand("insertOrderedList")} colorCategory="list" />
            <ToolbarDivider />
            <ToolbarButton icon={AlignLeft} title="Align left" active={formatState.alignLeft} onClick={() => execCommand("justifyLeft")} colorCategory="align" />
            <ToolbarButton icon={AlignCenter} title="Align center" active={formatState.alignCenter} onClick={() => execCommand("justifyCenter")} colorCategory="align" />
            <ToolbarButton icon={AlignRight} title="Align right" active={formatState.alignRight} onClick={() => execCommand("justifyRight")} colorCategory="align" />
            <ToolbarDivider />
            <ToolbarButton icon={Link} title="Insert link" active={formatState.link} onClick={openLinkModal} colorCategory="special" />
            <ToolbarButton icon={Quote} title="Quote" active={formatState.quote} onClick={() => execCommand("formatBlock", "blockquote")} colorCategory="special" />
            <ToolbarDivider />
            <ToolbarButton icon={Undo2} title="Clear formatting" onClick={clearFormatting} colorCategory="text" />
          </div>

          <div className="flex-1 overflow-hidden relative">
            <div
              ref={editorRef}
              contentEditable
              className="w-full h-full p-6 md:p-8 outline-none overflow-y-auto scrollbar-thin prose-editor text-card-foreground leading-relaxed"
              suppressContentEditableWarning={true}
              onKeyUp={updateFormatState}
              onMouseUp={updateFormatState}
              onFocus={updateFormatState}
              onInput={handleEditorInput}
            />
            {!hasContent && (
              <div className="absolute top-6 md:top-8 left-6 md:left-8 text-muted-foreground pointer-events-none select-none">
                Start writing...
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showLinkModal}
        onClose={() => {
          setShowLinkModal(false);
          setLinkUrl("");
          savedSelectionRef.current = null;
        }}
        title="Insert Link"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="link-url" className="block text-sm font-medium text-foreground mb-2">
              URL
            </label>
            <input
              id="link-url"
              type="text"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              onKeyDown={(e) => e.key === "Enter" && insertLink()}
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Select text in the editor first, then add a link
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowLinkModal(false);
                setLinkUrl("");
                savedSelectionRef.current = null;
              }}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all hover:scale-105 active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={insertLink}
              disabled={!linkUrl.trim()}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
            >
              Insert Link
            </button>
          </div>
        </div>
      </Modal>
    </TooltipProvider>
  );
}