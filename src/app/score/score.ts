import { Component, computed, inject, signal } from '@angular/core';
import ScoreService from '../services/score';
import Team from '../types/team';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-score',
  imports: [ReactiveFormsModule],
  templateUrl: './score.html',
  styleUrl: './score.scss',
})
export class Score {
  readonly scoreService = inject(ScoreService);
  teams = computed(() => this.scoreService.teams);

  setup = signal<boolean>(true);

  finishSetup() {
    this.setup.set(false);  
  }

  readonly teamForm = new FormGroup({
    teamName: new FormControl(''),
    player1: new FormControl(''),
    player2: new FormControl('')
  });

  submitTeam() {
    const teamName = this.teamForm.get('teamName')?.value;
    const player1 = this.teamForm.get('player1')?.value;
    const player2 = this.teamForm.get('player2')?.value;

    if (teamName && player1 && player2) {
      this.scoreService.createTeam(teamName);
      const teamId = this.scoreService.teams[this.scoreService.teams.length - 1].id;
      this.scoreService.addPlayerToTeam(teamId, player1);
      this.scoreService.addPlayerToTeam(teamId, player2);
      this.teamForm.reset();
    }
  }

  addScore(teamId: number, points: number) {
    this.scoreService.addTeamScore(teamId, points);
  }

  getPlayerNames(team: Team): string {
    return team.players.map(p => p.name).join(', ');
  }

  startNewSetup() {
    this.scoreService.clearAll();
    this.setup.set(true);
  }
}
