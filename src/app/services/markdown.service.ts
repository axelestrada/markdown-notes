import { Injectable } from '@angular/core';
import { marked } from 'marked';

@Injectable({
  providedIn: 'root',
})
export class MarkdownService {
  constructor() {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }

  parse(markdown: string): string {
    return marked.parse(markdown, {
      async: false,
    });
  }
}
