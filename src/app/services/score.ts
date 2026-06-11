import { Injectable, signal } from '@angular/core';
import Team from '../types/team';

@Injectable({
  providedIn: 'root',
})
export default class Score {
  private readonly _teams = signal<Team[]>([]);

  get teams() {
    return this._teams();
  }

  set teams(teams: Team[]) {
    this._teams.set(teams);
  }

  updateTeamScore(teamId: number, score: number) {
    this._teams.update((teams) => {
      return teams.map((team) => {
        if (team.id === teamId) {
          return { ...team, score };
        }
        return team;
      });
    });
  }

  addTeamScore(teamId: number, points: number) {
    this._teams.update((teams) => {
      return teams.map((team) => {
        if (team.id === teamId) {
          return { ...team, score: Math.max(0, team.score + points) };
        }
        return team;
      });
    });
  }

  addTeam(team: Team) {
    this._teams.update((teams) => [...teams, team]);
  }

  createTeam(name: string) {
    const newTeam: Team = {
      id: this.teams.length,
      name,
      score: 0,
      time: -1,
      players: [],
    };
    this.addTeam(newTeam);
  }

  addPlayerToTeam(teamId: number, playerName: string) {
    this._teams.update((teams) => {
      return teams.map((team) => {
        if (team.id === teamId) {
          const newPlayer = {
            id: Date.now() + Math.random(),
            name: playerName,
            active: false,
          };
          return {
            ...team,
            players: [...team.players, newPlayer],
          };
        }
        return team;
      });
    });
  }

  removeTeam(teamId: number) {
    this._teams.update((teams) => {
      const remaining = teams.filter((team) => team.id !== teamId);
      // Re-index remaining teams
      return remaining.map((t, idx) => ({ ...t, id: idx }));
    });
  }

  clearAll() {
    this._teams.set([]);
  }
}
