import {
  afterNextRender,
  Inject,
  Injectable,
  PLATFORM_ID,
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Note } from '../models/note.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  private notes: Note[] = [];
  private notesSubject = new BehaviorSubject<Note[]>([]);
  private selectedNoteSubject = new BehaviorSubject<Note | null>(null);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    // Cargar notas del localStorage al iniciar
    this.isBrowser = isPlatformBrowser(platformId);

    // Solo inicializar el tema si estamos en un navegador
    if (this.isBrowser) {
      this.loadFromLocalStorage();
    }
  }

  getNotes(): Observable<Note[]> {
    return this.notesSubject.asObservable();
  }

  getSelectedNote(): Observable<Note | null> {
    return this.selectedNoteSubject.asObservable();
  }

  selectNote(id: string): void {
    const note = this.notes.find((note) => note.id === id) || null;
    this.selectedNoteSubject.next(note);
  }

  addNote(): void {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'new-document.md',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.notes = [newNote, ...this.notes];
    this.notesSubject.next([...this.notes]);
    this.selectedNoteSubject.next(newNote);
    this.saveToLocalStorage();
  }

  updateNote(id: string, changes: Partial<Note>): void {
    this.notes = this.notes.map((note) => {
      if (note.id === id) {
        const updatedNote = {
          ...note,
          ...changes,
          updatedAt: new Date(),
        };
        if (this.selectedNoteSubject.value?.id === id) {
          this.selectedNoteSubject.next(updatedNote);
        }
        return updatedNote;
      }
      return note;
    });

    this.notesSubject.next([...this.notes]);
    this.saveToLocalStorage();
  }

  deleteNote(id: string): void {
    this.notes = this.notes.filter((note) => note.id !== id);
    this.notesSubject.next([...this.notes]);

    if (this.selectedNoteSubject.value?.id === id) {
      const firstNote = this.notes.length > 0 ? this.notes[0] : null;
      this.selectedNoteSubject.next(firstNote);
    }

    this.saveToLocalStorage();
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('notes', JSON.stringify(this.notes));
  }

  private loadFromLocalStorage(): void {
    const storedNotes = localStorage.getItem('notes');
    if (storedNotes) {
      this.notes = JSON.parse(storedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
      this.notesSubject.next([...this.notes]);
      if (this.notes.length > 0) {
        this.selectedNoteSubject.next(this.notes[0]);
      } else {
        const newNote: Note = {
          id: Date.now().toString(),
          title: 'welcome.md',
          content: `# Welcome to Markdown

Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.

## How to use this?

1. Write markdown in the markdown editor window
2. See the rendered markdown in the preview window

### Features

- Create headings, paragraphs, links, blockquotes, inline-code, code blocks, and lists
- Name and save the document to access again later
- Choose between Light or Dark mode depending on your preference

> This is an example of a blockquote. If you would like to learn more about markdown syntax, you can visit this [markdown cheatsheet](https://www.markdownguide.org/cheat-sheet/).

#### Headings

To create a heading, add the hash sign (#) before the heading. The number of number signs you use should correspond to the heading level. You'll see in this guide that we've used all six heading levels (not necessarily in the correct way you should use headings!) to illustrate how they should look.

##### Lists

You can see examples of ordered and unordered lists above.

###### Code Blocks

This markdown editor allows for inline-code snippets, like this: \`<p>I'm inline</p>\`. It also allows for larger code blocks like this:

\`\`\`
<main>
  <h1>This is a larger code block</h1>
</main>
\`\`\``,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        this.notes = [newNote, ...this.notes];
        this.notesSubject.next([...this.notes]);
        this.selectedNoteSubject.next(newNote);
        this.saveToLocalStorage();
      }
    }
  }
}
