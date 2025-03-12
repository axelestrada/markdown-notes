import { afterNextRender, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Note } from '../models/note.model';

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  private notes: Note[] = [];
  private notesSubject = new BehaviorSubject<Note[]>([]);
  private selectedNoteSubject = new BehaviorSubject<Note | null>(null);

  constructor() {
    // Cargar notas del localStorage al iniciar
    this.loadFromLocalStorage();
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
      title: 'Nueva nota',
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
    // localStorage.setItem('notes', JSON.stringify(this.notes));
  }

  private loadFromLocalStorage(): void {
    // const storedNotes = localStorage.getItem('notes');
    // if (storedNotes) {
    //   this.notes = JSON.parse(storedNotes).map((note: any) => ({
    //     ...note,
    //     createdAt: new Date(note.createdAt),
    //     updatedAt: new Date(note.updatedAt),
    //   }));
    //   this.notesSubject.next([...this.notes]);
    //   if (this.notes.length > 0) {
    //     this.selectedNoteSubject.next(this.notes[0]);
    //   }
    // }
  }
}
