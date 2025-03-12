import { ExportService } from './../../services/export.service';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { NotesService } from '../../services/notes.service';
import { Note } from '../../models/note.model';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  sidebarOpen = false;
  selectedNote: Note | null = null;
  deletePromptVisible: boolean = false;

  private titleChange = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private notesService: NotesService,
    private exportService: ExportService
  ) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  ngOnInit(): void {
    this.notesService.getSelectedNote().subscribe((note) => {
      this.selectedNote = note;
    });

    this.titleChange
      .pipe(takeUntil(this.destroy$), debounceTime(500), distinctUntilChanged())
      .subscribe((title) => {
        if (this.selectedNote) {
          this.notesService.updateNote(this.selectedNote.id, { title });
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

  toggleDeletePromptVisibility() {
    this.deletePromptVisible = !this.deletePromptVisible;
  }

  deleteNote(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.notesService.deleteNote(id);
    this.deletePromptVisible = false;
  }

  exportNote(): void {
    if (this.selectedNote) {
      this.exportService.exportNoteAsMarkdown(this.selectedNote);
    }
  }
}
