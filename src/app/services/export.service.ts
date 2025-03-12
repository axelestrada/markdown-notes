import { Injectable } from '@angular/core';
import { Note } from '../models/note.model';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor() {}

  /**
   * Exporta una nota como archivo Markdown
   * @param note La nota a exportar
   */
  exportNoteAsMarkdown(note: Note): void {
    // Crear un blob con el contenido de la nota
    const blob = new Blob([note.content], {
      type: 'text/markdown;charset=utf-8',
    });

    // Generar un nombre de archivo basado en el título de la nota
    // Reemplazar caracteres problemáticos para nombres de archivo
    const fileName = this.sanitizeFileName(note.title) + '.md';

    // Crear un enlace temporal para descargar el archivo
    this.downloadBlob(blob, fileName);
  }

  /**
   * Sanitiza un nombre de archivo para eliminar caracteres no válidos
   * @param fileName Nombre de archivo original
   * @returns Nombre de archivo sanitizado
   */
  private sanitizeFileName(fileName: string): string {
    // Reemplazar caracteres no válidos con guiones
    return fileName
      .split('.')[0]
      .trim()
      .replace(/[\\/:*?"<>|]/g, '-') // Caracteres no válidos en sistemas de archivos
      .replace(/\s+/g, '_'); // Reemplazar espacios con guiones bajos
  }

  /**
   * Descarga un blob como archivo
   * @param blob El blob a descargar
   * @param fileName Nombre del archivo
   */
  private downloadBlob(blob: Blob, fileName: string): void {
    // Crear URL para el blob
    const url = URL.createObjectURL(blob);

    // Crear un elemento <a> temporal
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;

    // Añadir al DOM, hacer clic y eliminar
    document.body.appendChild(a);
    a.click();

    // Limpiar después de la descarga
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }
}
