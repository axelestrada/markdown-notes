import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesService } from '../../services/notes.service';
import { ThemeService } from '../../services/theme.service';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  @Input() isVisible: boolean;
  @Output() toggleSidebarVisible = new EventEmitter<boolean>();

  notes: Note[] = [];
  selectedNote: Note | null = null;

  isDarkTheme = false;

  constructor(
    private notesService: NotesService,
    private themeService: ThemeService
  ) {
    this.isVisible = false;
  }

  handleToggleSidebarClick(): void {
    this.toggleSidebarVisible.emit(!this.isVisible);
  }

  ngOnInit(): void {
    this.notesService.getNotes().subscribe((notes) => {
      this.notes = notes;
    });

    this.notesService.getSelectedNote().subscribe((note) => {
      this.selectedNote = note;
    });

    this.themeService.getTheme().subscribe((theme) => {
      this.isDarkTheme = theme === 'dark';
    });
  }

  addNote(): void {
    this.notesService.addNote();
  }

  selectNote(id: string): void {
    this.notesService.selectNote(id);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
