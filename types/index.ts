export interface Note {
  id: string;
  title: string;
  content: string;
  fontSize: number;
  color: string;
  createdAt: string;
  updatedAt: string;
  bookmarked: boolean;
}

export interface Box {
  id: string;
  name: string;
  notes: Note[];
}

export interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
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

export type NewNote = Omit<Note, "id" | "createdAt" | "updatedAt">;

export function createNote(partial?: Partial<NewNote>): Note {
  const now = new Date().toISOString();
  return {
    id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    title: "",
    content: "",
    fontSize: 16,
    color: "#1a1a2e",
    createdAt: now,
    updatedAt: now,
    bookmarked: false,
    ...partial,
  };
}

export function createBox(name: string): Box {
  return {
    id: `box_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    name,
    notes: [],
  };
}