<template>
  <div>
    <v-card-text class="pa-4">
      <div class="notes-container">
        <div v-if="notes.length === 0" class="no-data">
          אין פתקים 
        </div>
        <div v-else class="notes-grid">
          <div 
            v-for="note in notes" 
            :key="note.id" 
            class="note-tile"
          >
            <v-textarea
              v-model="note.content"
              :readonly="!canEdit"
              variant="outlined"
              density="compact"
              rows="8"
              class="note-textarea"
              placeholder="כתוב משהו..."
            ></v-textarea>
            <div v-if="userStore.user.role === 1" class="note-actions">
              <v-btn 
                color="primary" 
                size="small" 
                @click="saveNote(note)"
                :loading="savingNoteId === note.id"
              >
                <v-icon left>mdi-content-save</v-icon>
                שמור
              </v-btn>
              <v-btn 
                color="error" 
                size="small" 
                @click="deleteNote(note)"
              >
                <v-icon left>mdi-delete</v-icon>
                מחק
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/UserStore'

export default {
  name: 'FactoryYellowNotes',
  setup() {
    const userStore = useUserStore()
    const savingNoteId = ref(null)

    // Parse notes from factory
    const notes = computed(() => {
      const factory = userStore.selectedFactory
      if (!factory || !factory.notes) {
        return []
      }
      
      try {
        const parsed = JSON.parse(factory.notes)
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        console.error('Error parsing notes:', e)
        return []
      }
    })

    const canEdit = computed(() => userStore.user.role === 1)

    function openDialog() {
      // Add new note
      addNewNote()
    }

    function addNewNote() {
      const factory = userStore.selectedFactory
      if (!factory) {
        alert('מפעל לא נבחר')
        return
      }

      // Get current notes
      let notesList = []
      try {
        notesList = factory.notes ? JSON.parse(factory.notes) : []
      } catch (e) {
        notesList = []
      }

      if (!Array.isArray(notesList)) {
        notesList = []
      }

      // Add new note
      const newNote = {
        id: Date.now(),
        content: ''
      }
      notesList.push(newNote)

      // Update factory
      saveNotesToFactory(notesList)
    }

    async function saveNote(note) {
      try {
        savingNoteId.value = note.id
        const factory = userStore.selectedFactory
        if (!factory) {
          alert('מפעל לא נבחר')
          return
        }

        // Get current notes
        let notesList = []
        try {
          notesList = factory.notes ? JSON.parse(factory.notes) : []
        } catch (e) {
          notesList = []
        }

        if (!Array.isArray(notesList)) {
          notesList = []
        }

        // Update the note
        const index = notesList.findIndex(n => n.id === note.id)
        if (index !== -1) {
          notesList[index] = {
            ...notesList[index],
            content: note.content
          }
        }

        // Update factory
        await saveNotesToFactory(notesList)
      } catch (error) {
        console.error('Failed to save note:', error)
        alert('שגיאה בשמירת הפתק')
      } finally {
        savingNoteId.value = null
      }
    }

    async function deleteNote(note) {
      const confirmed = confirm('האם למחוק את הפתק?')
      if (!confirmed) return

      try {
        const factory = userStore.selectedFactory
        if (!factory) {
          alert('מפעל לא נבחר')
          return
        }

        // Get current notes
        let notesList = []
        try {
          notesList = factory.notes ? JSON.parse(factory.notes) : []
        } catch (e) {
          notesList = []
        }

        if (!Array.isArray(notesList)) {
          notesList = []
        }

        // Remove note
        notesList = notesList.filter(n => n.id !== note.id)

        // Update factory
        await saveNotesToFactory(notesList)
      } catch (error) {
        console.error('Failed to delete note:', error)
        alert('שגיאה במחיקת הפתק')
      }
    }

    async function saveNotesToFactory(notesList) {
      const factory = userStore.selectedFactory
      const updatedFactory = {
        ...factory,
        notes: JSON.stringify(notesList)
      }

      await userStore.updateFactory(updatedFactory)
      
      // Update selectedFactory in store
      userStore.selectedFactory = updatedFactory
    }

    return {
      userStore,
      notes,
      canEdit,
      savingNoteId,
      openDialog,
      saveNote,
      deleteNote
    }
  },
  // Expose methods for parent component
  expose: ['openDialog']
}
</script>

<style scoped>
.notes-container {
  padding: 16px;
}

.no-data {
  padding: 48px;
  text-align: center;
  color: #999;
  font-size: 1.1rem;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.note-tile {
  background-color: #fff9c4;
  border: 2px solid #fdd835;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 250px;
}

.note-textarea {
  flex: 1;
  background-color: white;
}

.note-textarea :deep(.v-field__input) {
  min-height: 180px;
}

.note-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .notes-grid {
    grid-template-columns: 1fr;
  }
}
</style>

