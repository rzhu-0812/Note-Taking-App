export interface Note {
  id: string
  title: string
  content: string
  fontSize: number
  color: string
  createdAt: string
  updatedAt: string
  bookmarked: boolean
}

export interface Box {
  id: string
  name: string
  notes: Note[]
}

export interface Section {
  id: string
  name: string
  notes: Note[]
}

export interface FormatState {
  bold: boolean
  italic: boolean
  underline: boolean
  highlight: boolean
  alignLeft: boolean
  alignCenter: boolean
  alignRight: boolean
  list: boolean
  orderedList: boolean
}
