import {
  Injectable,
  Renderer2,
  RendererFactory2,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;
  private themeSubject = new BehaviorSubject<Theme>('light');
  private isBrowser: boolean;

  constructor(
    rendererFactory: RendererFactory2,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.isBrowser = isPlatformBrowser(platformId);

    // Solo inicializar el tema si estamos en un navegador
    if (this.isBrowser) {
      this.initTheme();
    }
  }

  private initTheme(): void {
    // Verificar si hay un tema guardado en localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null;

    // Verificar la preferencia del sistema
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    // Determinar el tema inicial
    const initialTheme: Theme = savedTheme || (prefersDark ? 'dark' : 'light');

    this.setTheme(initialTheme);
  }

  getTheme(): Observable<Theme> {
    return this.themeSubject.asObservable();
  }

  toggleTheme(): void {
    const currentTheme = this.themeSubject.getValue();
    const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  private setTheme(theme: Theme): void {
    if (!this.isBrowser) {
      return; // No realizar cambios en el DOM si no estamos en el navegador
    }

    // Actualizar el tema en el DOM
    if (theme === 'dark') {
      this.renderer.addClass(document.documentElement, 'dark');
    } else {
      this.renderer.removeClass(document.documentElement, 'dark');
    }

    // Guardar el tema en localStorage
    localStorage.setItem('theme', theme);

    // Actualizar el BehaviorSubject
    this.themeSubject.next(theme);
  }
}
