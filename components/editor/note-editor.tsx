"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Save,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link,
  Code,
  Quote,
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  RotateCcw,
} from "lucide-react";
import type { Note } from "@/types";

interface NoteEditorProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
}

interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  highlight: boolean;
  h1: boolean;
  h2: boolean;
  unorderedList: boolean;
  orderedList: boolean;
  alignLeft: boolean;
  alignCenter: boolean;
  alignRight: boolean;
  link: boolean;
  code: boolean;
  quote: boolean;
}

export function NoteEditor({ note, isOpen, onClose, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState("#000000");
  const [formatState, setFormatState] = useState<FormatState>({
    bold: false,
    italic: false,
    underline: false,
    highlight: false,
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
  });
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setFontSize(note.fontSize);
      setTextColor(note.color);
      if (editorRef.current) {
        editorRef.current.innerHTML = note.content || "";
      }
    } else {
      setTitle("");
      setFontSize(16);
      setTextColor("#000000");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    }
  }, [note]);

  const updateFormatState = () => {
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

      let hasHighlight = false;
      let currentElement = element;
      while (currentElement && currentElement !== editorRef.current) {
        const computedStyle = window.getComputedStyle(currentElement);
        const backgroundColor = computedStyle.backgroundColor;
        if (
          backgroundColor &&
          backgroundColor !== "rgba(0, 0, 0, 0)" &&
          backgroundColor !== "transparent" &&
          backgroundColor !== "rgb(255, 255, 255)" &&
          (backgroundColor.includes("255, 255, 0") ||
            backgroundColor.includes("yellow"))
        ) {
          hasHighlight = true;
          break;
        }
        currentElement = currentElement.parentElement;
      }

      setFormatState({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        highlight: hasHighlight,
        h1:
          element?.tagName === "H1" ||
          document.queryCommandValue("formatBlock") === "h1",
        h2:
          element?.tagName === "H2" ||
          document.queryCommandValue("formatBlock") === "h2",
        unorderedList: document.queryCommandState("insertUnorderedList"),
        orderedList: document.queryCommandState("insertOrderedList"),
        alignLeft: document.queryCommandState("justifyLeft"),
        alignCenter: document.queryCommandState("justifyCenter"),
        alignRight: document.queryCommandState("justifyRight"),
        link: element?.tagName === "A" || element?.closest("a") !== null,
        code: element?.tagName === "PRE" || element?.closest("pre") !== null,
        quote:
          element?.tagName === "BLOCKQUOTE" ||
          element?.closest("blockquote") !== null,
      });
    } catch (error) {
      console.error("Error updating format state:", error);
    }
  };

  const handleSave = () => {
    if (!note || !editorRef.current) return;

    const updatedNote: Note = {
      ...note,
      title: title || "Untitled Note",
      content: editorRef.current.innerHTML,
      fontSize,
      color: textColor,
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedNote);
    onClose();
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    setTimeout(updateFormatState, 10);
  };

  const handleColorChange = (newColor: string) => {
    setTextColor(newColor);

    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;

    if (selection.rangeCount > 0 && !selection.getRangeAt(0).collapsed) {
      document.execCommand("foreColor", false, newColor);
    } else {
      document.execCommand("foreColor", false, newColor);
    }

    editorRef.current.focus();
    setTimeout(updateFormatState, 10);
  };

  const toggleHighlight = () => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;

    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      if (range.collapsed) {
        if (formatState.highlight) {
          document.execCommand("backColor", false, "transparent");
        } else {
          document.execCommand("backColor", false, "#ffff00");
        }
      } else {
        const container = range.commonAncestorContainer;
        const element =
          container.nodeType === Node.TEXT_NODE
            ? container.parentElement
            : (container as Element);

        let hasHighlight = false;
        let currentElement = element;
        while (currentElement && currentElement !== editorRef.current) {
          const computedStyle = window.getComputedStyle(currentElement);
          const backgroundColor = computedStyle.backgroundColor;
          if (
            backgroundColor &&
            backgroundColor !== "rgba(0, 0, 0, 0)" &&
            backgroundColor !== "transparent" &&
            backgroundColor !== "rgb(255, 255, 255)" &&
            (backgroundColor.includes("255, 255, 0") ||
              backgroundColor.includes("yellow"))
          ) {
            hasHighlight = true;
            break;
          }
          currentElement = currentElement.parentElement;
        }

        if (hasHighlight || formatState.highlight) {
          document.execCommand("removeFormat", false, undefined);
        } else {
          document.execCommand("backColor", false, "#ffff00");
        }
      }
    }

    editorRef.current.focus();
    setTimeout(updateFormatState, 10);
  };

  const toggleHeader = (headerType: "h1" | "h2") => {
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
  };

  const clearFormatting = () => {
    document.execCommand("removeFormat", false, undefined);
    document.execCommand("formatBlock", false, "p");
    editorRef.current?.focus();
    setTimeout(updateFormatState, 10);
  };

  const formatButtons = [
    {
      icon: Bold,
      title: "Bold",
      command: "bold",
      active: formatState.bold,
    },
    {
      icon: Italic,
      title: "Italic",
      command: "italic",
      active: formatState.italic,
    },
    {
      icon: Underline,
      title: "Underline",
      command: "underline",
      active: formatState.underline,
    },
  ];

  const headerButtons = [
    {
      icon: Heading1,
      title: "Heading 1 (click again to remove)",
      active: formatState.h1,
      action: () => toggleHeader("h1"),
    },
    {
      icon: Heading2,
      title: "Heading 2 (click again to remove)",
      active: formatState.h2,
      action: () => toggleHeader("h2"),
    },
  ];

  const listButtons = [
    {
      icon: List,
      title: "Bullet List",
      command: "insertUnorderedList",
      active: formatState.unorderedList,
    },
    {
      icon: ListOrdered,
      title: "Numbered List",
      command: "insertOrderedList",
      active: formatState.orderedList,
    },
  ];

  const alignButtons = [
    {
      icon: AlignLeft,
      title: "Align Left",
      command: "justifyLeft",
      active: formatState.alignLeft,
    },
    {
      icon: AlignCenter,
      title: "Align Center",
      command: "justifyCenter",
      active: formatState.alignCenter,
    },
    {
      icon: AlignRight,
      title: "Align Right",
      command: "justifyRight",
      active: formatState.alignRight,
    },
  ];

  const specialButtons = [
    {
      icon: Link,
      title: "Insert Link",
      active: formatState.link,
      action: () => {
        const url = prompt("Enter URL:");
        if (url) {
          execCommand("createLink", url);
        }
      },
    },
    {
      icon: Code,
      title: "Code Block",
      active: formatState.code,
      action: () => execCommand("formatBlock", "pre"),
    },
    {
      icon: Quote,
      title: "Quote",
      active: formatState.quote,
      action: () => execCommand("formatBlock", "blockquote"),
    },
  ];

  const handleEditorEvents = () => {
    updateFormatState();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="text-2xl font-bold bg-transparent border-0 outline-none flex-1 mr-4 placeholder-gray-400"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="border-b bg-gray-50 p-4">
          <div className="flex flex-wrap gap-2 items-center mb-4">
            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {formatButtons.map((button, index) => (
                <button
                  key={index}
                  onClick={() => execCommand(button.command)}
                  className={`p-3 transition-colors border-r border-gray-200 last:border-r-0 ${
                    button.active
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  title={button.title}
                >
                  <button.icon className="h-4 w-4" />
                </button>
              ))}
              <button
                onClick={toggleHighlight}
                className={`p-3 transition-colors ${
                  formatState.highlight
                    ? "bg-yellow-100 text-yellow-700"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
                title="Highlight (Yellow) - Click again to remove"
              >
                <Highlighter className="h-4 w-4" />
              </button>
            </div>

            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {headerButtons.map((button, index) => (
                <button
                  key={index}
                  onClick={button.action}
                  className={`p-3 transition-colors border-r border-gray-200 last:border-r-0 ${
                    button.active
                      ? "bg-purple-100 text-purple-700"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  title={button.title}
                >
                  <button.icon className="h-4 w-4" />
                </button>
              ))}
            </div>

            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {listButtons.map((button, index) => (
                <button
                  key={index}
                  onClick={() => execCommand(button.command)}
                  className={`p-3 transition-colors border-r border-gray-200 last:border-r-0 ${
                    button.active
                      ? "bg-green-100 text-green-700"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  title={button.title}
                >
                  <button.icon className="h-4 w-4" />
                </button>
              ))}
            </div>

            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {alignButtons.map((button, index) => (
                <button
                  key={index}
                  onClick={() => execCommand(button.command)}
                  className={`p-3 transition-colors border-r border-gray-200 last:border-r-0 ${
                    button.active
                      ? "bg-orange-100 text-orange-700"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  title={button.title}
                >
                  <button.icon className="h-4 w-4" />
                </button>
              ))}
            </div>

            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {specialButtons.map((button, index) => (
                <button
                  key={index}
                  onClick={button.action}
                  className={`p-3 transition-colors border-r border-gray-200 last:border-r-0 ${
                    button.active
                      ? "bg-indigo-100 text-indigo-700"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  title={button.title}
                >
                  <button.icon className="h-4 w-4" />
                </button>
              ))}
            </div>

            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={clearFormatting}
                className="p-3 hover:bg-gray-50 text-gray-700 transition-colors"
                title="Clear All Formatting"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
              <Type className="h-4 w-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Size:</label>
              <input
                type="range"
                min="12"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-600 w-8">{fontSize}px</span>
            </div>

            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
              <Palette className="h-4 w-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">
                Text Color:
              </label>
              <div className="relative">
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer shadow-sm"
                  style={{ backgroundColor: textColor }}
                  title="Click to change text color - applies automatically to selected text or next typed text"
                />
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(formatState).some(([, active]) => active) && (
              <div className="text-xs text-gray-600 flex items-center gap-2">
                <span className="font-medium">Active:</span>
                {formatState.bold && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Bold
                  </span>
                )}
                {formatState.italic && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Italic
                  </span>
                )}
                {formatState.underline && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Underline
                  </span>
                )}
                {formatState.highlight && (
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                    Highlight
                  </span>
                )}
                {formatState.h1 && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    Heading 1
                  </span>
                )}
                {formatState.h2 && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    Heading 2
                  </span>
                )}
                {formatState.unorderedList && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                    Bullet List
                  </span>
                )}
                {formatState.orderedList && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                    Numbered List
                  </span>
                )}
                {formatState.alignLeft && (
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    Left Align
                  </span>
                )}
                {formatState.alignCenter && (
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    Center Align
                  </span>
                )}
                {formatState.alignRight && (
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    Right Align
                  </span>
                )}
                {formatState.link && (
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                    Link
                  </span>
                )}
                {formatState.code && (
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                    Code
                  </span>
                )}
                {formatState.quote && (
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                    Quote
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <div
            ref={editorRef}
            contentEditable
            className="w-full h-full p-8 outline-none overflow-y-auto prose prose-lg max-w-none text-gray-900"
            style={{
              fontSize: `${fontSize}px`,
            }}
            suppressContentEditableWarning={true}
            onKeyUp={handleEditorEvents}
            onMouseUp={handleEditorEvents}
            onFocus={handleEditorEvents}
            onInput={handleEditorEvents}
          />
          {(!editorRef.current?.innerHTML ||
            editorRef.current.innerHTML === "") && (
            <div className="absolute top-8 left-8 text-gray-400 pointer-events-none select-none">
              Start writing your note...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
