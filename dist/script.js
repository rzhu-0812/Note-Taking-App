const sidebarToggle = document.getElementById("sidebar-toggle")
const sidebar = document.getElementById("sidebar")
const addNoteBtn = document.getElementById("add-note-btn")
const addSectionBtn = document.getElementById("add-section-btn")
const editOverlay = document.getElementById("edit-overlay")
const editTitle = document.getElementById("edit-title")
const editContent = document.getElementById("edit-content")
const saveBtn = document.getElementById("save-btn")
const cancelBtn = document.getElementById("cancel-btn")
const notesContainer = document.getElementById("notes-container")
const sectionTitle = document.getElementById("section-title")
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
const alignLeftBtn = document.getElementById("align-left-btn")
const alignCenterBtn = document.getElementById("align-center-btn")
const alignRightBtn = document.getElementById("align-right-btn")
const listBtn = document.getElementById("list-btn")
const orderedListBtn = document.getElementById("ordered-list-btn")
const colorPreview = document.getElementById("color-preview")
const sectionsContainer = document.getElementById("sections-list")
const addBoxModal = document.getElementById("add-box-modal")
const newBoxNameInput = document.getElementById("new-box-name")
const confirmAddBoxBtn = document.getElementById("confirm-add-box")
const cancelAddBoxBtn = document.getElementById("cancel-add-box")
const editBoxModal = document.getElementById("edit-box-modal")
const editBoxNameInput = document.getElementById("edit-box-name")
const confirmEditBoxBtn = document.getElementById("confirm-edit-box")
const cancelEditBoxBtn = document.getElementById("cancel-edit-box")

let sidebarOpen = true
let currentEditingIndex = -1
let deleteIndex = -1
let currentEditingSectionId = null

let currentFormatState = {
  bold: false,
  italic: false,
  underline: false,
  highlight: false,
  alignLeft: true,
  alignCenter: false,
  alignRight: false,
  list: false,
  orderedList: false,
}

let sections = JSON.parse(localStorage.getItem("sections")) || [{ id: "default", name: "Default Box", notes: [] }]
let currentSection = sections[0].id

saveBtn.addEventListener("click", updateNote)
cancelBtn.addEventListener("click", closeEditMode)

function saveSections() {
  localStorage.setItem("sections", JSON.stringify(sections))
}

function loadSections() {
  sections = JSON.parse(localStorage.getItem("sections")) || [{ id: "default", name: "Default Box", notes: [] }]
  renderSections()
  if (sections.length > 0) {
    displaySectionNotes(sections[0].id)
  }
}

function renderSections() {
  sectionsContainer.innerHTML = ""
  sections.forEach((section) => {
    const sectionElement = document.createElement("li")
    sectionElement.className =
      "flex items-center justify-between cursor-pointer p-2 hover:bg-gray-100 rounded section-item group"
    sectionElement.dataset.sectionId = section.id
    sectionElement.setAttribute("draggable", true)

    const leftContent = document.createElement("div")
    leftContent.className = "flex items-center flex-grow min-w-0"

    const iconElement = document.createElement("span")
    iconElement.innerHTML = `
         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <path d="M21 8v13H3V8"></path>
           <path d="M1 3h22v5H1z"></path>
         </svg>
       `

    const textElement = document.createElement("span")
    textElement.textContent = section.name
    textElement.className = "flex-grow truncate"

    leftContent.appendChild(iconElement)
    leftContent.appendChild(textElement)

    const rightContent = document.createElement("div")
    rightContent.className =
      "flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0"

    const editButton = document.createElement("button")
    editButton.className = "p-1 text-gray-500 hover:text-blue-500 focus:outline-none"
    editButton.innerHTML = `
         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
           <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
         </svg>
       `
    editButton.onclick = (e) => {
      e.stopPropagation()
      editSectionName(section.id)
    }

    const deleteButton = document.createElement("button")
    deleteButton.className = "p-1 text-gray-500 hover:text-red-500 focus:outline-none"
    deleteButton.innerHTML = `
         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <polyline points="3 6 5 6 21 6"></polyline>
           <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
         </svg>
       `
    deleteButton.onclick = (e) => {
      e.stopPropagation()
      showDeleteSectionModal(section.id)
    }

    rightContent.appendChild(editButton)
    rightContent.appendChild(deleteButton)

    sectionElement.appendChild(leftContent)
    sectionElement.appendChild(rightContent)

    sectionElement.onclick = () => displaySectionNotes(section.id)
    sectionsContainer.appendChild(sectionElement)
  })

  setupSectionDragAndDrop()
}

function setupSectionDragAndDrop() {
  const sectionItems = document.querySelectorAll(".section-item")

  sectionItems.forEach((item) => {
    item.addEventListener("dragstart", handleSectionDragStart)
    item.addEventListener("dragover", handleSectionDragOver)
    item.addEventListener("dragleave", handleSectionDragLeave)
    item.addEventListener("drop", handleSectionDrop)
    item.addEventListener("dragend", handleSectionDragEnd)
  })
}

let draggedSectionId = null
let dragSectionIndicator = null

function handleSectionDragStart(e) {
  draggedSectionId = this.dataset.sectionId
  this.classList.add("opacity-50")

  if (!dragSectionIndicator) {
    dragSectionIndicator = document.createElement("div")
    dragSectionIndicator.className = "h-1 bg-blue-500 rounded my-1 transition-all duration-200"
    dragSectionIndicator.style.display = "none"
    sectionsContainer.appendChild(dragSectionIndicator)
  }

  e.stopPropagation()
}

function handleSectionDragOver(e) {
  e.preventDefault()

  if (draggedSectionId && draggedSectionId !== this.dataset.sectionId) {
    const rect = this.getBoundingClientRect()
    const mouseY = e.clientY
    const threshold = rect.top + rect.height / 2

    this.classList.remove("border-t-2", "border-b-2", "border-blue-500")

    if (mouseY < threshold) {
      dragSectionIndicator.style.display = "block"
      dragSectionIndicator.style.position = "absolute"
      dragSectionIndicator.style.width = `${rect.width}px`
      dragSectionIndicator.style.left = `${rect.left}px`
      dragSectionIndicator.style.top = `${rect.top - 2}px`
    } else {
      dragSectionIndicator.style.display = "block"
      dragSectionIndicator.style.position = "absolute"
      dragSectionIndicator.style.width = `${rect.width}px`
      dragSectionIndicator.style.left = `${rect.left}px`
      dragSectionIndicator.style.top = `${rect.bottom}px`
    }
  }
}

function handleSectionDragLeave() {
  if (dragSectionIndicator) {
    dragSectionIndicator.style.display = "none"
  }
  this.classList.remove("border-t-2", "border-b-2", "border-blue-500")
}

function handleSectionDrop(e) {
  e.preventDefault()
  e.stopPropagation()

  if (draggedSectionId && draggedSectionId !== this.dataset.sectionId) {
    const rect = this.getBoundingClientRect()
    const mouseY = e.clientY
    const threshold = rect.top + rect.height / 2

    const draggedIndex = sections.findIndex((s) => s.id === draggedSectionId)
    const targetIndex = sections.findIndex((s) => s.id === this.dataset.sectionId)

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedSection] = sections.splice(draggedIndex, 1)

      let newIndex = targetIndex
      if (draggedIndex < targetIndex && mouseY >= threshold) {
        newIndex = targetIndex
      } else if (draggedIndex > targetIndex && mouseY < threshold) {
        newIndex = targetIndex
      } else if (draggedIndex > targetIndex && mouseY >= threshold) {
        newIndex = targetIndex + 1
      } else if (draggedIndex < targetIndex && mouseY < threshold) {
        newIndex = targetIndex - 1
      }

      sections.splice(newIndex, 0, draggedSection)
      saveSections()
      renderSections()
    }
  }

  if (dragSectionIndicator) {
    dragSectionIndicator.style.display = "none"
  }
}

function handleSectionDragEnd() {
  this.classList.remove("opacity-50")
  if (dragSectionIndicator) {
    dragSectionIndicator.style.display = "none"
  }
  draggedSectionId = null
}

function displaySectionNotes(sectionId) {
  currentSection = sectionId
  currentEditingSectionId = sectionId
  const section = sections.find((s) => s.id === sectionId)
  if (!section) {
    console.error("Section not found:", sectionId)
    return
  }
  sectionTitle.textContent = section.name
  notesContainer.innerHTML = ""
  if (section.notes.length === 0) {
    const emptyMessage = document.createElement("div")
    emptyMessage.className = "col-span-full flex flex-col items-center justify-center py-12 text-center"
    emptyMessage.innerHTML = `
       <div class="bg-gray-100 rounded-full p-4 mb-4">
         <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
           <polyline points="14 2 14 8 20 8"></polyline>
           <line x1="12" y1="18" x2="12" y2="12"></line>
           <line x1="9" y1="15" x2="15" y2="15"></line>
         </svg>
       </div>
       <h3 class="text-lg font-medium text-gray-900 mb-1">No notes yet</h3>
       <p class="text-gray-500 mb-4">Get started by creating your first note</p>
       <button class="btn-primary" onclick="addNote()">
         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <path d="M12 5v14M5 12h14"/>
         </svg>
         <span>New Note</span>
       </button>
     `
    notesContainer.appendChild(emptyMessage)
  } else {
    section.notes.forEach((note, index) => {
      const noteElement = createNoteElement(note, index, sectionId)
      notesContainer.appendChild(noteElement)
    })

    setupNoteDragAndDrop()
  }

  document.querySelectorAll(".section-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.sectionId === sectionId)
  })
}

function setupNoteDragAndDrop() {
  const noteElements = document.querySelectorAll(".note-card")

  noteElements.forEach((note) => {
    note.addEventListener("dragstart", handleNoteDragStart)
    note.addEventListener("dragover", handleNoteDragOver)
    note.addEventListener("dragleave", handleNoteDragLeave)
    note.addEventListener("drop", handleNoteDrop)
    note.addEventListener("dragend", handleNoteDragEnd)
  })
}

let draggedNoteIndex = -1
let dragNoteIndicator = null

function handleNoteDragStart(e) {
  const noteElement = e.target.closest(".note-card")
  if (noteElement) {
    draggedNoteIndex = Array.from(notesContainer.children).indexOf(noteElement)
    noteElement.classList.add("opacity-50")

    const data = {
      sectionId: currentSection,
      noteIndex: draggedNoteIndex,
    }
    e.dataTransfer.setData("text/plain", JSON.stringify(data))

    if (!dragNoteIndicator) {
      dragNoteIndicator = document.createElement("div")
      dragNoteIndicator.className = "h-1 bg-blue-500 rounded my-1 transition-all duration-200"
      dragNoteIndicator.style.display = "none"
      document.body.appendChild(dragNoteIndicator)
    }
  }
}

function handleNoteDragOver(e) {
  e.preventDefault()

  const noteElement = e.target.closest(".note-card")
  if (noteElement && draggedNoteIndex !== -1) {
    const targetIndex = Array.from(notesContainer.children).indexOf(noteElement)

    if (draggedNoteIndex !== targetIndex) {
      const rect = noteElement.getBoundingClientRect()
      const mouseY = e.clientY
      const threshold = rect.top + rect.height / 2

      noteElement.classList.remove("border-t-2", "border-b-2", "border-blue-500")

      if (mouseY < threshold) {
        dragNoteIndicator.style.display = "block"
        dragNoteIndicator.style.position = "absolute"
        dragNoteIndicator.style.width = `${rect.width}px`
        dragNoteIndicator.style.left = `${rect.left}px`
        dragNoteIndicator.style.top = `${rect.top - 2}px`
      } else {
        dragNoteIndicator.style.display = "block"
        dragNoteIndicator.style.position = "absolute"
        dragNoteIndicator.style.width = `${rect.width}px`
        dragNoteIndicator.style.left = `${rect.left}px`
        dragNoteIndicator.style.top = `${rect.bottom}px`
      }
    }
  }
}

function handleNoteDragLeave() {
  if (dragNoteIndicator) {
    dragNoteIndicator.style.display = "none"
  }
  this.classList.remove("border-t-2", "border-b-2", "border-blue-500")
}

function handleNoteDrop(e) {
  e.preventDefault()

  const noteElement = e.target.closest(".note-card")
  if (noteElement && draggedNoteIndex !== -1) {
    const targetIndex = Array.from(notesContainer.children).indexOf(noteElement)

    if (draggedNoteIndex !== targetIndex) {
      const rect = noteElement.getBoundingClientRect()
      const mouseY = e.clientY
      const threshold = rect.top + rect.height / 2

      const section = findSectionById(currentSection)
      if (section) {
        let newIndex = targetIndex
        if (draggedNoteIndex < targetIndex && mouseY >= threshold) {
          newIndex = targetIndex
        } else if (draggedNoteIndex > targetIndex && mouseY < threshold) {
          newIndex = targetIndex
        } else if (draggedNoteIndex > targetIndex && mouseY >= threshold) {
          newIndex = targetIndex + 1
        } else if (draggedNoteIndex < targetIndex && mouseY < threshold) {
          newIndex = targetIndex - 1
        }

        const [draggedNote] = section.notes.splice(draggedNoteIndex, 1)
        section.notes.splice(newIndex, 0, draggedNote)
        saveSections()
        displaySectionNotes(currentSection)
      }
    }
  }

  if (dragNoteIndicator) {
    dragNoteIndicator.style.display = "none"
  }
}

function handleNoteDragEnd() {
  this.classList.remove("opacity-50")
  if (dragNoteIndicator) {
    dragNoteIndicator.style.display = "none"
  }
  draggedNoteIndex = -1
}

sectionsContainer.addEventListener("dragover", (e) => {
  e.preventDefault()
  const dropTarget = e.target.closest(".section-item")

  if (dropTarget && e.dataTransfer.types.includes("text/plain")) {
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"))
      if (data.sectionId && data.noteIndex !== undefined) {
        if (data.sectionId !== dropTarget.dataset.sectionId) {
          dropTarget.classList.add("bg-blue-100")
        }
      }
    } catch (err) {
    }
  }
})

function createNoteElement(note, index, sectionId) {
  const noteElement = document.createElement("div")
  noteElement.className = "note-card"
  noteElement.setAttribute("draggable", true)

  const date = new Date(note.updatedAt)
  const formattedDate = `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`

  noteElement.innerHTML = `
   <div class="note-card-header">
     <h3 class="note-card-title">${note.title || "Untitled Note"}</h3>
     <div class="note-card-date">Edited ${formattedDate}</div>
   </div>
   <div class="note-card-content" style="font-size: ${note.fontSize || 16}px; color: ${note.color || "#000000"}">
     ${note.content || '<span class="placeholder">Empty note</span>'}
   </div>
   <div class="note-card-footer">
     <div class="text-xs text-gray-500">${getWordCount(note.content)} words</div>
     <div class="note-card-actions">
       <button class="note-card-action bookmark-btn" aria-label="Bookmark">
         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="${note.bookmarked ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
         </svg>
       </button>
       <button class="note-card-action edit-btn" aria-label="Edit note">
         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
           <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
         </svg>
       </button>
       <button class="note-card-action delete-btn" aria-label="Delete note">
         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <path d="M3 6h18"></path>
           <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
           <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
         </svg>
       </button>
     </div>
   </div>
 `

  noteElement.querySelector(".edit-btn").addEventListener("click", (e) => {
    e.stopPropagation()
    openEditMode(sectionId, index)
  })

  noteElement.querySelector(".bookmark-btn").addEventListener("click", (e) => {
    e.stopPropagation()
    toggleBookmark(sectionId, index)
  })

  noteElement.querySelector(".delete-btn").addEventListener("click", (e) => {
    e.stopPropagation()
    showDeleteConfirmation(sectionId, index)
  })

  return noteElement
}

function getWordCount(content) {
  if (!content) return 0
  const text = content.replace(/<[^>]*>/g, "")
  return text.split(/\s+/).filter((word) => word.length > 0).length
}

function addNote() {
  const sectionId = currentEditingSectionId || currentSection
  const section = sections.find((s) => s.id === sectionId)
  if (!section) {
    console.error("Current section not found:", sectionId)
    return
  }

  const newNote = {
    title: "Untitled Note",
    content: "",
    fontSize: 16,
    color: "#000000",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bookmarked: false,
  }

  section.notes.unshift(newNote)
  saveSections()
  displaySectionNotes(sectionId)
  openEditMode(sectionId, 0)
}

function showDeleteConfirmation(sectionId, noteIndex) {
  deleteIndex = noteIndex
  currentEditingSectionId = sectionId

  document.querySelector(".confirm-modal h3").textContent = "Delete Note"
  document.querySelector(".confirm-modal p").textContent =
    "Are you sure you want to delete this note? This action cannot be undone."

  confirmModal.style.display = "flex"

  // Set the correct onclick handler for the confirm button
  confirmDeleteBtn.onclick = deleteNote
}

function deleteNote() {
  if (deleteIndex !== -1 && currentEditingSectionId) {
    const section = findSectionById(currentEditingSectionId)
    if (section) {
      section.notes.splice(deleteIndex, 1)
      saveSections()
      displaySectionNotes(currentEditingSectionId)
    } else {
      console.error("Box not found for deletion:", currentEditingSectionId)
    }
    deleteIndex = -1
    currentEditingSectionId = null
  }
  confirmModal.style.display = "none"
}

function openEditMode(sectionId, noteIndex) {
  currentEditingSectionId = sectionId
  currentEditingIndex = noteIndex
  const section = findSectionById(sectionId)
  if (!section || !section.notes[noteIndex]) {
    console.error("Note not found for editing")
    return
  }
  const note = section.notes[noteIndex]

  editTitle.value = note.title || ""
  editContent.innerHTML = note.content || ""

  updateFontSize(note.fontSize || 16)

  editContent.style.color = note.color || "#000000"
  textColorInput.value = note.color || "#000000"
  updateColorPalette(note.color || "#000000")

  resetFormatButtons()

  editOverlay.classList.remove("hidden")
  editOverlay.style.opacity = "0"
  setTimeout(() => {
    editOverlay.style.opacity = "1"
  }, 50)

  if (!editTitle.value) editTitle.placeholder = "Enter title here..."
  if (!editContent.textContent.trim())
    editContent.innerHTML = '<span class="placeholder">Start writing your note here...</span>'
}

function closeEditMode() {
  editOverlay.style.opacity = "0"
  setTimeout(() => {
    editOverlay.classList.add("hidden")
  }, 300)
  currentEditingIndex = -1
  currentEditingSectionId = null
}

function updateNote() {
  if (currentEditingSectionId === null || currentEditingIndex === -1) return
  const section = findSectionById(currentEditingSectionId)
  if (section) {
    section.notes[currentEditingIndex] = {
      ...section.notes[currentEditingIndex],
      title: editTitle.value,
      content: editContent.innerHTML,
      fontSize: Number.parseInt(fontSizeInput.value),
      color: textColorInput.value,
      updatedAt: new Date().toISOString(),
    }
    saveSections()
    displaySectionNotes(currentEditingSectionId)
  } else {
    console.error("Section not found for note update:", currentEditingSectionId)
  }
  closeEditMode()
}

function updateButtonState(button, isActive) {
  button.classList.toggle("active", isActive)
  button.classList.toggle("bg-blue-50", isActive)
  button.classList.toggle("text-blue-600", isActive)
  button.setAttribute("aria-pressed", isActive.toString())
}

function resetFormatButtons() {
  updateButtonState(boldBtn, false)
  updateButtonState(italicBtn, false)
  updateButtonState(underlineBtn, false)
  updateButtonState(highlightBtn, false)

  updateButtonState(alignLeftBtn, true)
  updateButtonState(alignCenterBtn, false)
  updateButtonState(alignRightBtn, false)

  updateButtonState(listBtn, false)
  updateButtonState(orderedListBtn, false)

  currentFormatState = {
    bold: false,
    italic: false,
    underline: false,
    highlight: false,
    alignLeft: true,
    alignCenter: false,
    alignRight: false,
    list: false,
    orderedList: false,
  }
}

function applyFormatting(format) {
  editContent.focus()

  switch (format) {
    case "bold":
      document.execCommand("bold", false, null)
      currentFormatState.bold = !currentFormatState.bold
      updateButtonState(boldBtn, currentFormatState.bold)
      break

    case "italic":
      document.execCommand("italic", false, null)
      currentFormatState.italic = !currentFormatState.italic
      updateButtonState(italicBtn, currentFormatState.italic)
      break

    case "underline":
      document.execCommand("underline", false, null)
      currentFormatState.underline = !currentFormatState.underline
      updateButtonState(underlineBtn, currentFormatState.underline)
      break

    case "highlight":
      document.execCommand("backColor", false, currentFormatState.highlight ? "transparent" : "yellow")
      currentFormatState.highlight = !currentFormatState.highlight
      updateButtonState(highlightBtn, currentFormatState.highlight)
      break

    case "alignLeft":
      document.execCommand("justifyLeft", false, null)
      currentFormatState.alignLeft = true
      currentFormatState.alignCenter = false
      currentFormatState.alignRight = false
      updateButtonState(alignLeftBtn, true)
      updateButtonState(alignCenterBtn, false)
      updateButtonState(alignRightBtn, false)
      break

    case "alignCenter":
      document.execCommand("justifyCenter", false, null)
      currentFormatState.alignLeft = false
      currentFormatState.alignCenter = true
      currentFormatState.alignRight = false
      updateButtonState(alignLeftBtn, false)
      updateButtonState(alignCenterBtn, true)
      updateButtonState(alignRightBtn, false)
      break

    case "alignRight":
      document.execCommand("justifyRight", false, null)
      currentFormatState.alignRight = true
      currentFormatState.alignLeft = false
      currentFormatState.alignCenter = false
      updateButtonState(alignRightBtn, true)
      updateButtonState(alignLeftBtn, false)
      updateButtonState(alignCenterBtn, false)
      break

    case "list":
      document.execCommand("insertUnorderedList", false, null)
      currentFormatState.list = !currentFormatState.list
      updateButtonState(listBtn, currentFormatState.list)
      break

    case "orderedList":
      document.execCommand("insertOrderedList", false, null)
      currentFormatState.orderedList = !currentFormatState.orderedList
      updateButtonState(orderedListBtn, currentFormatState.orderedList)
      break
  }
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
  if (!editContent || document.activeElement !== editContent) return

  currentFormatState.bold = document.queryCommandState("bold")
  currentFormatState.italic = document.queryCommandState("italic")
  currentFormatState.underline = document.queryCommandState("underline")

  currentFormatState.alignLeft = document.queryCommandState("justifyLeft")
  currentFormatState.alignCenter = document.queryCommandState("justifyCenter")
  currentFormatState.alignRight = document.queryCommandState("justifyRight")

  currentFormatState.list = document.queryCommandState("insertUnorderedList")
  currentFormatState.orderedList = document.queryCommandState("insertOrderedList")

  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    const parentElement = range.startContainer.parentElement
    currentFormatState.highlight = isHighlighted(parentElement)
  } else {
    currentFormatState.highlight = false
  }

  updateButtonState(boldBtn, currentFormatState.bold)
  updateButtonState(italicBtn, currentFormatState.italic)
  updateButtonState(underlineBtn, currentFormatState.underline)
  updateButtonState(highlightBtn, currentFormatState.highlight)
  updateButtonState(alignLeftBtn, currentFormatState.alignLeft)
  updateButtonState(alignCenterBtn, currentFormatState.alignCenter)
  updateButtonState(alignRightBtn, currentFormatState.alignRight)
  updateButtonState(listBtn, currentFormatState.list)
  updateButtonState(orderedListBtn, currentFormatState.orderedList)
}

function isHighlighted(element) {
  if (!element) return false
  return window.getComputedStyle(element).backgroundColor === "yellow"
}

function updateColorPalette(color) {
  colorPreview.style.backgroundColor = color
}

function rgbToHex(rgb) {
  if (rgb.startsWith("#")) {
    return rgb
  }

  const rgbValues = rgb.match(/^rgb$$(\d+),\s*(\d+),\s*(\d+)$$$/)
  if (!rgbValues) return "#000000"

  const r = Number.parseInt(rgbValues[1], 10).toString(16).padStart(2, "0")
  const g = Number.parseInt(rgbValues[2], 10).toString(16).padStart(2, "0")
  const b = Number.parseInt(rgbValues[3], 10).toString(16).padStart(2, "0")
  return `#${r}${g}${b}`
}

function updateColorPickerOnSelection() {
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    if (range.startContainer && range.startContainer.parentElement) {
      const colorStyle = window.getComputedStyle(range.startContainer.parentElement).color
      if (colorStyle) {
        const hexColor = rgbToHex(colorStyle)
        textColorInput.value = hexColor
        updateColorPalette(hexColor)
      }
    }
  }
}

textColorInput.addEventListener("input", (e) => {
  const color = e.target.value
  document.execCommand("foreColor", false, color)
  colorPreview.style.backgroundColor = color
  editContent.focus()
})
;[boldBtn, italicBtn, underlineBtn, highlightBtn].forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault()
    applyFormatting(btn.id.replace("-btn", ""))
  })
})
;[alignLeftBtn, alignCenterBtn, alignRightBtn, listBtn, orderedListBtn].forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault()
    applyFormatting(btn.id.replace("-btn", ""))
  })
})

editContent.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault()
    document.execCommand("insertHTML", false, "<br>")
  }

  if (e.ctrlKey) {
    const formatKeys = {
      b: "bold",
      i: "italic",
      u: "underline",
      h: "highlight",
    }
    const format = formatKeys[e.key.toLowerCase()]
    if (format) {
      e.preventDefault()
      applyFormatting(format)
    }
  }
})

editContent.addEventListener("input", updateAllButtonStates)
editContent.addEventListener("keyup", updateAllButtonStates)
editContent.addEventListener("mouseup", updateAllButtonStates)
editContent.addEventListener("click", updateAllButtonStates)
editContent.addEventListener("select", updateColorPickerOnSelection)

editTitle.addEventListener("focus", function () {
  if (this.placeholder && this.value === "") {
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

notesContainer.addEventListener("dragstart", (e) => {
  const noteElement = e.target.closest(".note-card")
  if (noteElement) {
    const noteIndex = Array.from(notesContainer.children).indexOf(noteElement)
    e.dataTransfer.setData("text/plain", JSON.stringify({ sectionId: currentEditingSectionId, noteIndex: noteIndex }))
  }
})

sectionsContainer.addEventListener("dragover", (e) => {
  e.preventDefault()
  const dropTarget = e.target.closest(".section-item")
  if (dropTarget && dropTarget.dataset.sectionId !== currentEditingSectionId) {
    dropTarget.classList.add("bg-blue-100")
  }
})

sectionsContainer.addEventListener("dragleave", (e) => {
  const dropTarget = e.target.closest(".section-item")
  if (dropTarget) {
    dropTarget.classList.remove("bg-blue-100")
  }
})

sectionsContainer.addEventListener("drop", (e) => {
  e.preventDefault()
  const dropTarget = e.target.closest(".section-item")
  if (dropTarget && dropTarget.dataset.sectionId !== currentEditingSectionId) {
    dropTarget.classList.remove("bg-blue-100")
    const data = JSON.parse(e.dataTransfer.getData("text/plain"))
    const sourceSectionId = data.sectionId
    const sourceNoteIndex = data.noteIndex
    const targetSectionId = dropTarget.dataset.sectionId

    if (sourceSectionId && targetSectionId && sourceSectionId !== targetSectionId) {
      moveNoteBetweenSections(sourceSectionId, targetSectionId, sourceNoteIndex)
    }
  }
})

function moveNoteBetweenSections(sourceSectionId, targetSectionId, noteIndex) {
  const sourceSection = findSectionById(sourceSectionId)
  const targetSection = findSectionById(targetSectionId)

  if (sourceSection && targetSection && sourceSection.notes[noteIndex]) {
    const movedNote = sourceSection.notes.splice(noteIndex, 1)[0]
    targetSection.notes.unshift(movedNote)
    saveSections()
    displaySectionNotes(targetSectionId)
    displaySectionNotes(sourceSectionId)
  } else {
    console.error("Error moving note between sections: Section or note not found.")
  }
}

function findSectionById(sectionId) {
  return sections.find((s) => s.id === sectionId)
}

document.addEventListener("DOMContentLoaded", () => {
  loadSections()

  dragSectionIndicator = document.createElement("div")
  dragSectionIndicator.className = "h-1 bg-blue-500 rounded my-1 transition-all duration-200"
  dragSectionIndicator.style.display = "none"
  document.body.appendChild(dragSectionIndicator)

  dragNoteIndicator = document.createElement("div")
  dragNoteIndicator.className = "h-1 bg-blue-500 rounded my-1 transition-all duration-200"
  dragNoteIndicator.style.display = "none"
  document.body.appendChild(dragNoteIndicator)
})

document.querySelectorAll(".note-card").forEach((card, index) => {
  card.style.animationDelay = `${index * 0.05}s`
  card.classList.add("animate-in")
})

window.addEventListener("resize", () => {
  if (window.innerWidth < 768) {
    sidebarOpen = false
    sidebar.style.width = "0"
  } else {
    sidebarOpen = true
    sidebar.style.width = "280px"
  }
})

if (window.innerWidth < 768) {
  sidebarOpen = false
  sidebar.style.width = "0"
}

function toggleBookmark(sectionId, noteIndex) {
  const section = findSectionById(sectionId)
  if (section && section.notes[noteIndex]) {
    const note = section.notes[noteIndex]
    note.bookmarked = !note.bookmarked
    saveSections()
    displaySectionNotes(sectionId)
  }
}
;[
  boldBtn,
  italicBtn,
  underlineBtn,
  highlightBtn,
  alignLeftBtn,
  alignCenterBtn,
  alignRightBtn,
  listBtn,
  orderedListBtn,
].forEach((btn) => {
  btn.addEventListener("mousedown", (e) => e.preventDefault())
})

decreaseFontSizeBtn.addEventListener("click", () => {
  const currentSize = Number.parseInt(fontSizeInput.value, 10)
  updateFontSize(currentSize - 1)
})

increaseFontSizeBtn.addEventListener("click", () => {
  const currentSize = Number.parseInt(fontSizeInput.value, 10)
  updateFontSize(currentSize + 1)
})

fontSizeInput.addEventListener("change", (e) => {
  updateFontSize(e.target.value)
})

function addSection() {
  newBoxNameInput.value = ""
  addBoxModal.style.display = "flex"
  newBoxNameInput.focus()
}

function editSectionName(sectionId) {
  const section = findSectionById(sectionId)
  if (section) {
    currentEditingSectionId = sectionId
    editBoxNameInput.value = section.name
    editBoxModal.style.display = "flex"
    editBoxNameInput.focus()
  }
}

function showDeleteSectionModal(sectionId) {
  currentEditingSectionId = sectionId
  document.querySelector(".confirm-modal h3").textContent = "Delete Box"
  document.querySelector(".confirm-modal p").textContent =
    "Are you sure you want to delete this box and all its notes? This action cannot be undone."

  confirmModal.style.display = "flex"

  confirmDeleteBtn.onclick = deleteSection
}

function deleteSection() {
  if (currentEditingSectionId) {
    const index = sections.findIndex((s) => s.id === currentEditingSectionId)
    if (index !== -1) {
      sections.splice(index, 1)
      saveSections()

      if (currentSection === currentEditingSectionId && sections.length > 0) {
        displaySectionNotes(sections[0].id)
      } else if (sections.length === 0) {
        sections.push({ id: "default", name: "Default Box", notes: [] })
        saveSections()
        displaySectionNotes("default")
      }

      renderSections()
    }
  }
  confirmModal.style.display = "none"
}

sidebarToggle.addEventListener("click", () => {
  sidebarOpen = !sidebarOpen
  sidebar.style.width = sidebarOpen ? "280px" : "0"
})

addSectionBtn.addEventListener("click", addSection)

confirmDeleteBtn.addEventListener("click", () => {
  confirmDeleteBtn.onclick()
})

cancelDeleteBtn.addEventListener("click", () => {
  confirmModal.style.display = "none"
})

confirmAddBoxBtn.addEventListener("click", () => {
  const boxName = newBoxNameInput.value.trim()
  if (boxName) {
    const sectionId = "section_" + Date.now()
    sections.push({
      id: sectionId,
      name: boxName,
      notes: [],
    })
    saveSections()
    renderSections()
    displaySectionNotes(sectionId)
    addBoxModal.style.display = "none"
  } else {
    newBoxNameInput.classList.add("border-red-500")
    setTimeout(() => {
      newBoxNameInput.classList.remove("border-red-500")
    }, 2000)
  }
})

cancelAddBoxBtn.addEventListener("click", () => {
  addBoxModal.style.display = "none"
})

confirmEditBoxBtn.addEventListener("click", () => {
  const newName = editBoxNameInput.value.trim()
  if (newName && currentEditingSectionId) {
    const section = findSectionById(currentEditingSectionId)
    if (section) {
      section.name = newName
      saveSections()
      renderSections()
      if (currentSection === currentEditingSectionId) {
        sectionTitle.textContent = newName
      }
      editBoxModal.style.display = "none"
    }
  } else {
    editBoxNameInput.classList.add("border-red-500")
    setTimeout(() => {
      editBoxNameInput.classList.remove("border-red-500")
    }, 2000)
  }
})

cancelEditBoxBtn.addEventListener("click", () => {
  editBoxModal.style.display = "none"
})

newBoxNameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    confirmAddBoxBtn.click()
  }
})

editBoxNameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    confirmEditBoxBtn.click()
  }
})
