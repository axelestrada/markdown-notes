import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesService } from '../../services/notes.service';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col">
      <div class="p-4 border-b">
        <h1 class="text-xl font-bold">Notas Markdown</h1>
        <button
          (click)="addNote()"
          class="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition duration-200"
        >
          Nueva Nota
        </button>
      </div>

      <div class="flex-1 overflow-y-auto">
        <ul>
          @for (note of notes; track note.id) {
          <li
            (click)="selectNote(note.id)"
            [class.bg-blue-100]="selectedNote?.id === note.id"
            class="p-3 border-b hover:bg-gray-100 cursor-pointer transition duration-200"
          >
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-medium truncate">{{ note.title }}</h3>
                <p class="text-xs text-gray-500">
                  {{ note.updatedAt | date : 'short' }}
                </p>
              </div>
              <button
                (click)="deleteNote(note.id, $event)"
                class="text-red-500 hover:text-red-700 p-1"
              >
                ✕
              </button>
            </div>
          </li>
          }
        </ul>
      </div>
    </div>
  `,
})
export class SidebarComponent implements OnInit {
  notes: Note[] = [];
  selectedNote: Note | null = null;

  constructor(private notesService: NotesService) {}

  ngOnInit(): void {
    this.notesService.getNotes().subscribe((notes) => {
      this.notes = notes;
    });

    this.notesService.getSelectedNote().subscribe((note) => {
      this.selectedNote = note;
    });
  }

  addNote(): void {
    this.notesService.addNote();
  }

  selectNote(id: string): void {
    this.notesService.selectNote(id);
  }

  deleteNote(id: string, event: MouseEvent): void {
    event.stopPropagation();
    if (confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
      this.notesService.deleteNote(id);
    }
  }
}
