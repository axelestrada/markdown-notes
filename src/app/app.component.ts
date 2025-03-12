import { HugeiconsIconComponent } from '@hugeicons/angular';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { EditorComponent } from './components/editor/editor.component';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    EditorComponent,
    NavbarComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'markdown-notes-app';
}
