const sidebarToggle = document.getElementById("sidebar-toggle")
const sidebar = document.getElementById("sidebar")
let sidebarOpen = true

sidebarToggle.addEventListener("click", () => {
  sidebarOpen = !sidebarOpen
  sidebar.style.width = sidebarOpen ? "16rem" : "0"
  sidebar.style.padding = sidebarOpen ? "1rem" : "0"
})

function renderNotesList() {
  const notesList = document.getElementById("notes-list")
  notesList.innerHTML = ""
  notes.forEach((note, index) => {
    const noteItem = document.createElement("div")
    noteItem.className = "p-2 hover:bg-gray-300 cursor-pointer rounded"
    noteItem.innerHTML = `
      <h3 class="font-medium text-gray-800 truncate">${note.title || "Untitled Note"}</h3>
      <p class="text-sm text-gray-500 truncate">${note.content.replace(/<[^>]*>/g, "").slice(0, 50)}...</p>
    `
    noteItem.addEventListener("click", () => openEditMode(index))
    notesList.appendChild(noteItem)
  })
}

const notesContainer = document.getElementById("notes-container")
const addNoteBtn = document.getElementById("add-note-btn")
const editOverlay = document.getElementById("edit-overlay")
const editTitle = document.getElementById("edit-title")
const editContent = document.getElementById("edit-content")
const saveBtn = document.getElementById("save-btn")
const cancelBtn = document.getElementById("cancel-btn")
const fontSizeInput = document.getElementById("font-size")
const decreaseFontSizeBtn = document.getElementById("decrease-font-size")
const increaseFontSizeBtn = document.getElementById("increase-font-size")
const boldBtn = document.getElementById("bold-btn")
const italicBtn = document.getElementById("italic-btn")
const underlineBtn = document.getElementById("underline-btn")
const highlightBtn = document.getElementById("highlight-btn")
const textColorInput = document.getElementById("text-color")
const confirmModal = document.getElementById("confirm-modal")
const confirmDeleteBtn = document.getElementById("confirm-delete")
const cancelDeleteBtn = document.getElementById("cancel-delete")
const fontSizeLimitMessage = document.getElementById("font-size-limit-message")

const notes = JSON.parse(localStorage.getItem("notes")) || []
let currentEditingIndex = -1
let deleteIndex = -1

let currentFormatState = {
  bold: false,
  italic: false,
  underline: false,
  highlight: false,
}

function renderNotes() {
  notesContainer.innerHTML = ""
  notes.forEach((note, index) => {
    const noteElement = document.createElement("div")
    noteElement.className =
      "bg-white p-4 rounded-lg shadow relative group cursor-pointer transform transition-all duration-300 hover:scale-105 opacity-0"
    noteElement.style.animation = `fadeIn 0.5s ease-out ${index * 0.1}s forwards`
    noteElement.innerHTML = `
      <h2 class="text-lg font-bold mb-2 truncate">${note.title || "Untitled Note"}</h2>
      <div class="note-content break-words mb-2 overflow-hidden" style="max-height: 100px;">
        ${note.content || '<span class="text-gray-400 italic">Empty note</span>'}
      </div>
      <div class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button class="delete-btn text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 rounded-full p-1" aria-label="Delete note">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    `
    noteElement.addEventListener("click", (e) => {
      if (!e.target.closest(".delete-btn")) {
        openEditMode(index)
      }
    })
    noteElement.querySelector(".delete-btn").addEventListener("click", (e) => {
      e.stopPropagation()
      showDeleteConfirmation(index)
    })
    notesContainer.appendChild(noteElement)
  })
  renderNotesList()
}

const style = document.createElement("style")
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`
document.head.appendChild(style)

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes))
}

function addNote() {
  const newNote = {
    title: "Untitled Note",
    content: "",
    fontSize: 16,
    color: "#000000",
  }
  notes.unshift(newNote)
  saveNotes()
  renderNotes()
  openEditMode(0)
}

function showDeleteConfirmation(index) {
  deleteIndex = index
  confirmModal.style.display = "block"
}

function deleteNote() {
  if (deleteIndex !== -1) {
    notes.splice(deleteIndex, 1)
    saveNotes()
    renderNotes()
    deleteIndex = -1
  }
  confirmModal.style.display = "none"
}

function openEditMode(index) {
  currentEditingIndex = index
  const note = notes[index]
  editTitle.value = note.title || ""
  editContent.innerHTML = note.content || ""
  updateFontSize(note.fontSize)
  editContent.style.color = note.color
  textColorInput.value = note.color
  updateColorPickerIcon(note.color)
  resetFormatButtons()
  editOverlay.style.display = "flex"
  editOverlay.style.opacity = "0"
  setTimeout(() => {
    editOverlay.style.opacity = "1"
  }, 50)

  if (!editTitle.value) {
    editTitle.placeholder = "Enter title here..."
  }
  if (!editContent.textContent.trim()) {
    editContent.innerHTML = '<span class="placeholder">Start writing your note here...</span>'
  }
}

function closeEditMode() {
  editOverlay.style.opacity = "0"
  setTimeout(() => {
    editOverlay.style.display = "none"
  }, 300)
  currentEditingIndex = -1
}

function updateNote() {
  if (currentEditingIndex === -1) return
  notes[currentEditingIndex] = {
    title: editTitle.value,
    content: editContent.innerHTML,
    fontSize: Number.parseInt(fontSizeInput.value),
    color: textColorInput.value,
  }
  saveNotes()
  renderNotes()
  closeEditMode()
}

function updateButtonState(button, isActive) {
  button.classList.toggle("active", isActive)
  button.setAttribute("aria-pressed", isActive.toString())
}

function resetFormatButtons() {
  ;[boldBtn, italicBtn, underlineBtn, highlightBtn].forEach((btn) => {
    updateButtonState(btn, false)
  })
  currentFormatState = {
    bold: false,
    italic: false,
    underline: false,
    highlight: false,
  }
}

function applyFormatting(format) {
  if (format === "highlight") {
    const isActive = currentFormatState.highlight
    document.execCommand("backColor", false, isActive ? "transparent" : "yellow")
    currentFormatState.highlight = !isActive
  } else {
    document.execCommand(format, false, null)
    currentFormatState[format] = !currentFormatState[format]
  }
  updateButtonState(getButtonForFormat(format), currentFormatState[format])
}

function insertTextWithCurrentFormatting(text) {
  const tempElement = document.createElement("span")
  tempElement.innerHTML = text

  if (currentFormatState.bold) tempElement.style.fontWeight = "bold"
  if (currentFormatState.italic) tempElement.style.fontStyle = "italic"
  if (currentFormatState.underline) tempElement.style.textDecoration = "underline"
  if (currentFormatState.highlight) tempElement.style.backgroundColor = "yellow"

  document.execCommand("insertHTML", false, tempElement.outerHTML)
}

function getButtonForFormat(format) {
  switch (format) {
    case "bold":
      return boldBtn
    case "italic":
      return italicBtn
    case "underline":
      return underlineBtn
    case "highlight":
      return highlightBtn
  }
}

function updateColorPickerIcon(color) {
  const colorPickerIcon = document.querySelector(".color-picker-icon")
  if (colorPickerIcon) {
    const bottomPath = colorPickerIcon.querySelector("path:first-child")
    bottomPath.setAttribute("stroke", color)
  }
}

function updateColorPickerOnSelection() {
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    const color = window.getComputedStyle(range.startContainer.parentElement).color
    updateColorPickerIcon(color)
    textColorInput.value = rgbToHex(color)
  }
}

function rgbToHex(rgb) {
  const rgbValues = rgb.match(/^rgb$$(\d+),\s*(\d+),\s*(\d+)$$$/)
  if (!rgbValues) return "#000000"
  const r = Number.parseInt(rgbValues[1], 10).toString(16).padStart(2, "0")
  const g = Number.parseInt(rgbValues[2], 10).toString(16).padStart(2, "0")
  const b = Number.parseInt(rgbValues[3], 10).toString(16).padStart(2, "0")
  return `#${r}${g}${b}`
}

function updateFontSize(newSize) {
  let size = Number.parseInt(newSize)
  if (isNaN(size) || size < 8) {
    size = 8
    showFontSizeLimitMessage("min")
  } else if (size > 250) {
    size = 250
    showFontSizeLimitMessage("max")
  } else {
    hideFontSizeLimitMessage()
  }
  fontSizeInput.value = size
  editContent.style.fontSize = `${size}px`
}

function showFontSizeLimitMessage(type) {
  const message = type === "max" ? fontSizeLimitMessage : document.getElementById("font-size-min-limit-message")
  message.style.display = "block"
  clearTimeout(message.timeoutId)
  message.timeoutId = setTimeout(() => {
    message.style.display = "none"
  }, 2000)
}

function hideFontSizeLimitMessage() {
  fontSizeLimitMessage.style.display = "none"
  document.getElementById("font-size-min-limit-message").style.display = "none"
}

function updateAllButtonStates() {
  currentFormatState.bold = document.queryCommandState("bold")
  currentFormatState.italic = document.queryCommandState("italic")
  currentFormatState.underline = document.queryCommandState("underline")
  currentFormatState.highlight = isHighlighted(window.getSelection().anchorNode.parentElement)

  updateButtonState(boldBtn, currentFormatState.bold)
  updateButtonState(italicBtn, currentFormatState.italic)
  updateButtonState(underlineBtn, currentFormatState.underline)
  updateButtonState(highlightBtn, currentFormatState.highlight)
}

function isHighlighted(element) {
  return window.getComputedStyle(element).backgroundColor === "yellow"
}

addNoteBtn.addEventListener("click", addNote)
saveBtn.addEventListener("click", updateNote)
cancelBtn.addEventListener("click", closeEditMode)
confirmDeleteBtn.addEventListener("click", deleteNote)
cancelDeleteBtn.addEventListener("click", () => {
  confirmModal.style.display = "none"
  deleteIndex = -1
})

fontSizeInput.addEventListener("input", (e) => {
  const newValue = e.target.value
  if (newValue.length === 0 || (newValue.length === 1 && Number.parseInt(newValue) < 8)) {
    updateFontSize(8)
    showFontSizeLimitMessage("min")
  } else {
    updateFontSize(newValue)
  }
})

fontSizeInput.addEventListener("blur", () => {
  updateFontSize(fontSizeInput.value)
})

fontSizeInput.addEventListener("keydown", (e) => {
  if (e.key === "Backspace" || e.key === "Delete") {
    if (
      fontSizeInput.value.length === 1 ||
      (fontSizeInput.value.length === 2 && Number.parseInt(fontSizeInput.value) < 10)
    ) {
      e.preventDefault()
      updateFontSize(8)
      showFontSizeLimitMessage("min")
    }
  }
})

decreaseFontSizeBtn.addEventListener("mousedown", (e) => {
  e.preventDefault()
  updateFontSize(Number.parseInt(fontSizeInput.value) - 1)
})

increaseFontSizeBtn.addEventListener("mousedown", (e) => {
  e.preventDefault()
  updateFontSize(Number.parseInt(fontSizeInput.value) + 1)
})

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey) {
    if (e.key === ".") {
      e.preventDefault()
      updateFontSize(Number.parseInt(fontSizeInput.value) + 1)
    } else if (e.key === ",") {
      e.preventDefault()
      updateFontSize(Number.parseInt(fontSizeInput.value) - 1)
    }
  }
})

fontSizeInput.addEventListener("mousewheel", (e) => e.preventDefault(), { passive: false })
fontSizeInput.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    e.preventDefault()
  }
})

textColorInput.addEventListener("input", (e) => {
  const color = e.target.value
  document.execCommand("foreColor", false, color)
  updateColorPickerIcon(color)
  editContent.focus()
})

boldBtn.addEventListener("click", (e) => {
  e.preventDefault()
  applyFormatting("bold")
})
italicBtn.addEventListener("click", (e) => {
  e.preventDefault()
  applyFormatting("italic")
})
underlineBtn.addEventListener("click", (e) => {
  e.preventDefault()
  applyFormatting("underline")
})
highlightBtn.addEventListener("click", (e) => {
  e.preventDefault()
  applyFormatting("highlight")
})

editContent.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault()
    document.execCommand("insertHTML", false, "<br>")
  }

  if (e.ctrlKey) {
    switch (e.key.toLowerCase()) {
      case "b":
        e.preventDefault()
        document.execCommand("bold", false, null)
        break
      case "i":
        e.preventDefault()
        document.execCommand("italic", false, null)
        break
      case "u":
        e.preventDefault()
        document.execCommand("underline", false, null)
        break
      case "h":
        e.preventDefault()
        applyFormatting("highlight")
        break
    }
  }
})

editContent.addEventListener("input", updateAllButtonStates)
editContent.addEventListener("keyup", updateAllButtonStates)
editContent.addEventListener("mouseup", updateAllButtonStates)

editTitle.addEventListener("focus", function () {
  if (this.placeholder) {
    this.placeholder = ""
  }
})

editTitle.addEventListener("blur", function () {
  if (!this.value) {
    this.placeholder = "Enter title here..."
  }
})

editContent.addEventListener("focus", function () {
  if (this.innerHTML === '<span class="placeholder">Start writing your note here...</span>') {
    this.innerHTML = ""
  }
})

editContent.addEventListener("blur", function () {
  if (!this.textContent.trim()) {
    this.innerHTML = '<span class="placeholder">Start writing your note here...</span>'
  }
})

renderNotes()
renderNotesList()