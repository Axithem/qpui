import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Timer } from '../../timer/timer';
import { Score } from '../../score/score';

@Component({
  selector: 'default',
  imports: [RouterOutlet, Timer, Score],
  templateUrl: './default.html',
  styleUrl: './default.scss'
})
export class DefaultPage {
  protected readonly title = signal('qpui');
  readonly activeTab = signal<'timer' | 'scoreboard'>('timer');

  setTab(tab: 'timer' | 'scoreboard') {
    this.activeTab.set(tab);
  }
}
