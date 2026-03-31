import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'default',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './default.html',
  styleUrl: './default.scss'
})
export class DefaultPage {
  protected readonly title = signal('qpui');
}
