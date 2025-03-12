import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../../services/notes.service';
import { MarkdownService } from '../../services/markdown.service';
import { Note } from '../../models/note.model';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="selectedNote; else noNote" class="h-full flex flex-col">
      <div class="border-b p-4 flex justify-between items-center">
        <input
          [(ngModel)]="selectedNote.title"
          (ngModelChange)="onTitleChange($event)"
          class="text-xl font-semibold bg-transparent border-none focus:outline-none w-full"
          placeholder="Título de la nota"
        />

        <div class="flex space-x-2">
          <button
            (click)="togglePreview()"
            class="px-3 py-1 rounded text-sm"
            [class.bg-blue-500]="showPreview"
            [class.text-white]="showPreview"
            [class.bg-gray-200]="!showPreview"
          >
            {{ showPreview ? 'Editar' : 'Vista previa' }}
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-hidden">
        <!-- Editor -->
        <div *ngIf="!showPreview" class="h-full">
          <textarea
            [(ngModel)]="selectedNote.content"
            (ngModelChange)="onContentChange($event)"
            class="w-full h-full p-4 resize-none border-none focus:outline-none font-mono"
            placeholder="Escribe tu nota en Markdown..."
          ></textarea>
        </div>

        <!-- Vista previa -->
        <div
          *ngIf="showPreview"
          class="h-full p-4 overflow-y-auto markdown-preview"
          [innerHTML]="renderedContent"
        ></div>
      </div>
    </div>

    <ng-template #noNote>
      <div class="h-full flex items-center justify-center bg-gray-50">
        <div class="text-center text-gray-500">
          <p class="text-xl mb-4">Selecciona una nota o crea una nueva</p>
        </div>
      </div>
    </ng-template>
  `,
})
export class EditorComponent implements OnInit, OnDestroy {
  selectedNote: Note | null = null;
  showPreview = false;
  renderedContent = '';

  private titleChange = new Subject<string>();
  private contentChange = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private notesService: NotesService,
    private markdownService: MarkdownService
  ) {}

  ngOnInit(): void {
    this.notesService.getSelectedNote().subscribe((note) => {
      this.selectedNote = note;
      if (note) {
        this.updateRenderedContent();
      }
    });

    // Implementar autoguardado con debounce
    this.titleChange
      .pipe(takeUntil(this.destroy$), debounceTime(500), distinctUntilChanged())
      .subscribe((title) => {
        if (this.selectedNote) {
          this.notesService.updateNote(this.selectedNote.id, { title });
        }
      });

    this.contentChange
      .pipe(takeUntil(this.destroy$), debounceTime(500), distinctUntilChanged())
      .subscribe((content) => {
        if (this.selectedNote) {
          this.notesService.updateNote(this.selectedNote.id, { content });
          this.updateRenderedContent();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTitleChange(title: string): void {
    this.titleChange.next(title);
  }

  onContentChange(content: string): void {
    this.contentChange.next(content);
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  private updateRenderedContent(): void {
    if (this.selectedNote) {
      this.renderedContent = this.markdownService.parse(
        this.selectedNote.content
      );
    }
  }
}
