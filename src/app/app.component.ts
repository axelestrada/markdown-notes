import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent } from './components/editor/editor.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, EditorComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'markdown-notes-app';

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Al inicializar el componente, el ThemeService ya habrá establecido el tema
  }
}
