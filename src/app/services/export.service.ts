import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Note } from '../models/note.model';
import { MarkdownService } from './markdown.service';

// Importaciones para PDF
declare const jspdf: any;
declare const html2canvas: any;

export type ExportFormat = 'md' | 'pdf';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  private isBrowser: boolean;

  constructor(
    private markdownService: MarkdownService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Exporta una nota en el formato especificado
   * @param note La nota a exportar
   * @param format Formato de exportación ('md' o 'pdf')
   * @param renderElement Elemento DOM para renderizar PDF (solo necesario para PDF)
   */
  exportNote(
    note: Note,
    format: ExportFormat,
    renderElement?: HTMLElement
  ): void {
    if (!this.isBrowser) {
      return; // No realizar operaciones de navegador en SSR
    }

    // Comprobar el formato solicitado
    if (format === 'md') {
      this.exportNoteAsMarkdown(note);
    } else if (format === 'pdf') {
      if (!renderElement) {
        console.error('Se requiere un elemento DOM para renderizar a PDF');
        return;
      }
      this.exportNoteAsPDF(note, renderElement);
    }
  }

  /**
   * Exporta una nota como archivo Markdown
   * @param note La nota a exportar
   */
  private exportNoteAsMarkdown(note: Note): void {
    // Crear un blob con el contenido de la nota
    const blob = new Blob([note.content], {
      type: 'text/markdown;charset=utf-8',
    });

    // Generar un nombre de archivo basado en el título de la nota
    const fileName = this.sanitizeFileName(note.title) + '.md';

    // Descargar el archivo
    this.downloadBlob(blob, fileName);
  }

  /**
   * Exporta una nota como archivo PDF renderizado
   * @param note La nota a exportar
   * @param renderElement Elemento DOM que contiene el contenido renderizado
   */
  private exportNoteAsPDF(note: Note, renderElement: HTMLElement): void {
    // Asegurarse de que los scripts de jspdf y html2canvas están cargados
    this.loadScripts()
      .then(() => {
        // Opciones para html2canvas
        const options = {
          scale: 2, // Mayor escala para mejor calidad
          useCORS: true,
          logging: false,
        };

        // Crear una copia del elemento para manipular sin afectar la UI
        const element = renderElement.cloneNode(true) as HTMLElement;
        element.style.width = '800px'; // Ancho fijo para el PDF
        element.style.padding = '20px';
        element.style.position = 'absolute';
        element.style.left = '-9999px';
        document.body.appendChild(element);

        // Usar html2canvas para crear una imagen del contenido HTML
        html2canvas(element, options).then((canvas: any) => {
          // Eliminar el elemento temporal
          document.body.removeChild(element);

          // Crear un PDF con jsPDF
          const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          });

          // Dimensiones del PDF (A4)
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();

          // Calcular dimensiones de la imagen manteniendo la proporción
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          const ratio = canvasWidth / canvasHeight;

          let imgWidth = pdfWidth;
          let imgHeight = imgWidth / ratio;

          // Si la altura es mayor que la página, ajustar
          if (imgHeight > pdfHeight) {
            imgHeight = pdfHeight - 20; // Dejar un margen
            imgWidth = imgHeight * ratio;
          }

          // Añadir la imagen al PDF
          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(
            imgData,
            'PNG',
            (pdfWidth - imgWidth) / 2,
            10,
            imgWidth,
            imgHeight
          );

          // Generar nombre del archivo
          const fileName = this.sanitizeFileName(note.title) + '.pdf';

          // Descargar el PDF
          pdf.save(fileName);
        });
      })
      .catch((error) => {
        console.error('Error al cargar scripts para PDF:', error);
        alert(
          'No se pudieron cargar las bibliotecas necesarias para generar el PDF. Por favor, inténtalo de nuevo.'
        );
      });
  }

  /**
   * Carga dinámicamente los scripts necesarios para PDF si no están ya cargados
   */
  private loadScripts(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Comprobar si ya están cargados
      if (
        typeof (window as any)['jspdf'] !== 'undefined' &&
        typeof (window as any)['html2canvas'] !== 'undefined'
      ) {
        resolve();
        return;
      }

      // Cargar html2canvas
      const html2canvasScript = document.createElement('script');
      html2canvasScript.src =
        'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      html2canvasScript.async = true;

      // Cargar jsPDF
      const jspdfScript = document.createElement('script');
      jspdfScript.src =
        'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      jspdfScript.async = true;

      // Contador para saber cuándo se han cargado todos los scripts
      let loadedCount = 0;

      const onLoad = () => {
        loadedCount++;
        if (loadedCount === 2) {
          // Ambos scripts cargados
          resolve();
        }
      };

      const onError = (error: any) => {
        reject(error);
      };

      html2canvasScript.onload = onLoad;
      html2canvasScript.onerror = onError;

      jspdfScript.onload = onLoad;
      jspdfScript.onerror = onError;

      // Añadir scripts al DOM
      document.head.appendChild(html2canvasScript);
      document.head.appendChild(jspdfScript);
    });
  }

  /**
   * Sanitiza un nombre de archivo para eliminar caracteres no válidos
   * @param fileName Nombre de archivo original
   * @returns Nombre de archivo sanitizado
   */
  private sanitizeFileName(fileName: string): string {
    // Reemplazar caracteres no válidos con guiones
    return fileName
      .split('.')[0] // Eliminar extensión
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
