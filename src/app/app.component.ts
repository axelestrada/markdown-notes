import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent } from './components/editor/editor.component';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, EditorComponent, NavbarComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'markdown-notes-app';
}
