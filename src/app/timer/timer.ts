import { Component, computed, inject, signal } from '@angular/core';
import TimerService from '../timer';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import Team from '../types/team';

@Component({
  selector: 'app-timer',
  imports: [ReactiveFormsModule],
  templateUrl: './timer.html',
  styleUrl: './timer.scss',
})
export class Timer {
  readonly timerService = inject(TimerService);
  teams = computed(() => this.timerService.teams);

  setup = signal<boolean>(true);

  finishSetup() {
    if (this.teams().length > 0) {
      this.timerService.setActiveTeam(this.teams()[0].id);
    }
    this.setup.set(false);  
  }

  readonly teamForm = new FormGroup({
    teamName: new FormControl(''),
    player1: new FormControl(''),
    player2: new FormControl('')
  });

  getPlayerNames(team: Team): string {
    return team.players.map(p => p.name).join(', ');
  }

  formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const ms = Math.floor((milliseconds % 1000) / 10); // Get centiseconds
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }

  submitTeam() {
    const teamName = this.teamForm.get('teamName')?.value;
    const player1 = this.teamForm.get('player1')?.value;
    const player2 = this.teamForm.get('player2')?.value;

    if (teamName && player1 && player2) {
      this.timerService.createTeam(teamName);
      const teamId = this.timerService.teams[this.timerService.teams.length - 1].id;
      this.timerService.addPlayerToTeam(teamId, player1);
      this.timerService.addPlayerToTeam(teamId, player2);
      this.teamForm.reset();
    }
  }

  startNewSetup() {
    this.timerService.clearAll();
    this.setup.set(true);
  }
}
