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
  templateUrl: './editor.component.html',
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

    this.notesService.addNote();
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
