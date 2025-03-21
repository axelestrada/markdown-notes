import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../../services/notes.service';
import { MarkdownService } from '../../services/markdown.service';
import { Note } from '../../models/note.model';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ExportFormat, ExportService } from '../../services/export.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './editor.component.html',
})
export class EditorComponent implements OnInit, OnDestroy {
  @ViewChild('previewContainer') previewContainer!: ElementRef;
  @ViewChild('exportDropdown') exportDropdown!: ElementRef;

  sidebarOpen = false;
  deletePromptVisible: boolean = false;

  selectedNote: Note | null = null;
  showPreview = false;
  showExportMenu = false;
  renderedContent = '';

  private isBrowser: boolean;

  private titleChange = new Subject<string>();
  private contentChange = new Subject<string>();
  private destroy$ = new Subject<void>();
  private documentClickListener: any;

  constructor(
    private notesService: NotesService,
    private markdownService: MarkdownService,
    private exportService: ExportService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      return; // No realizar operaciones de navegador en SSR
    }

    this.notesService.getSelectedNote().subscribe((note) => {
      this.selectedNote = note;

      if (note) {
        this.updateRenderedContent();
      }
    });

    this.titleChange
      .pipe(takeUntil(this.destroy$), debounceTime(500), distinctUntilChanged())
      .subscribe((title) => {
        if (this.selectedNote) {
          this.notesService.updateNote(this.selectedNote.id, { title });
        }
      });

    this.contentChange
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe((content) => {
        if (this.selectedNote) {
          this.notesService.updateNote(this.selectedNote.id, { content });
          this.updateRenderedContent();
        }
      });

    this.documentClickListener = (event: MouseEvent) => {
      if (
        this.showExportMenu &&
        this.exportDropdown &&
        !this.exportDropdown.nativeElement.contains(event.target)
      ) {
        this.showExportMenu = false;
      }
    };

    document.addEventListener('click', this.documentClickListener);
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) {
      return; // No realizar operaciones de navegador en SSR
    }

    this.destroy$.next();
    this.destroy$.complete();

    // Eliminar el listener de documento
    if (this.documentClickListener) {
      document.removeEventListener('click', this.documentClickListener);
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleExportMenu(): void {
    this.showExportMenu = !this.showExportMenu;
  }

  toggleDeletePromptVisibility() {
    this.deletePromptVisible = !this.deletePromptVisible;
  }

  deleteNote(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.notesService.deleteNote(id);
    this.deletePromptVisible = false;
  }

  addNote(): void {
    this.notesService.addNote();
  }

  onTitleChange(title: string): void {
    this.titleChange.next(title);
  }

  onContentChange(content: string): void {
    this.contentChange.next(content);
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;

    // Si activamos la vista previa, asegurarnos de que el contenido esté actualizado
    if (this.showPreview) {
      this.updateRenderedContent();
    }
  }

  private updateRenderedContent(): void {
    if (this.selectedNote) {
      this.renderedContent = this.markdownService.parse(
        this.selectedNote.content
      );
    }
  }

  exportNote(format: ExportFormat): void {
    if (!this.selectedNote) {
      return;
    }

    // Si no estamos en modo vista previa y queremos exportar como PDF,
    // activar temporalmente la vista previa para renderizar
    const needsTemporaryPreview = format === 'pdf' && !this.showPreview;

    if (needsTemporaryPreview) {
      // Activar vista previa temporalmente
      this.showPreview = true;
      this.updateRenderedContent();

      // Esperar a que el DOM se actualice
      setTimeout(() => {
        // Exportar
        this.performExport(format);

        // Volver al modo edición
        this.showPreview = false;
      }, 100);
    } else {
      // Exportar directamente
      this.performExport(format);
    }

    // Cerrar el menú desplegable
    this.showExportMenu = false;
  }

  private performExport(format: ExportFormat): void {
    if (!this.selectedNote) {
      return;
    }

    if (format === 'pdf') {
      if (!this.previewContainer) {
        console.error('No se encontró el contenedor de vista previa');
        return;
      }
      // Exportar como PDF usando el elemento del DOM
      this.exportService.exportNote(
        this.selectedNote,
        format,
        this.previewContainer.nativeElement
      );
    } else {
      // Exportar como Markdown
      this.exportService.exportNote(this.selectedNote, format);
    }
  }
}
