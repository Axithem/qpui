import { computed, Injectable, signal } from '@angular/core';
import Team from './types/team';
import { TeamStatus } from './types/team';

@Injectable({
  providedIn: 'root',
})
export default class Timer {
  private readonly _teams = signal<Team[]>([]);
  private numberOfTeams = computed(() => this._teams().length);
  private teamTimers: { [key: number]: any } = {};
  private activeTeamId = signal<number>(0);
  private timerOn = signal<boolean>(false);
  private winnerTeamId = signal<number | null>(null);

  get teams() {
    return this._teams();
  }

  set teams(teams: Team[]) {
    this._teams.set(teams);
  }

  createTeam(name: string) {
    const newTeam: Team = {
      id: this.numberOfTeams(),
      name,
      score: 0,
      time: 60000, // 60 seconds in milliseconds
      players: [],
      status: TeamStatus.InGame,
    };
    this.addTeam(newTeam);
  }

  addPlayerToTeam(teamId: number, playerName: string) {
    this._teams.update((teams) => {
      const team = teams.find((t) => t.id === teamId);
      if (team) {
        const newPlayer = {
          id: Date.now(),
          name: playerName,
          active: false,
        };
        team.players.push(newPlayer);
      }
      return teams;
    });
  }

  addTeam(team: Team) {
    this._teams.update((teams) => [...teams, team]);
  }

  updateTeam(updatedTeam: Team) {
    this._teams.update((teams) => {
      const index = teams.findIndex((team) => team.id === updatedTeam.id);
      if (index !== -1) {
        teams[index] = updatedTeam;
      }
      return teams;
    });
  }

  removeTeam(teamId: number) {
    this._teams.update((teams) => {
      const index = teams.findIndex((team) => team.id === teamId);
      if (index !== -1) {
        teams.splice(index, 1);
      }
      return teams;
    });
  }

  startTeamTimer(teamId: number) {
    const timerInterval = setInterval(() => {
      this._teams.update((teams) => {
        const team = teams.find((t) => t.id === teamId);
        if (team && team.time > 0) {
          team.time -= 10; // Decrease by 10ms
        } else if (team && team.time <= 0) {
          clearInterval(timerInterval);
          delete this.teamTimers[teamId];
        }
        return [...teams];
      });
    }, 10); // Update every 10ms
    this.teamTimers[teamId] = timerInterval;
  }

  stopTeamTimer(teamId: number) {
    if (this.teamTimers[teamId]) {
      clearInterval(this.teamTimers[teamId]);
      delete this.teamTimers[teamId];
    }
  }

  resetTeamTimer(teamId: number, time: number = 60000) { // Default 60 seconds in ms
    this._teams.update((teams) => {
      const team = teams.find((t) => t.id === teamId);
      if (team) {
        team.time = time;
      }
      return [...teams];
    });
  }

  setActiveTeam(teamId: number) {
    this.activeTeamId.set(teamId);
  }

  getActiveTeam() {
    return this.teams.find((t) => t.id === this.activeTeamId());
  }

  getTimerStatus() {
    return this.timerOn();
  }

  startTimer() {
    const activeTeam = this.getActiveTeam();
    if (activeTeam && !this.timerOn()) {
      this.timerOn.set(true);
      this.startTeamTimer(activeTeam.id);
    }
  }

  stopTimer() {
    const activeTeam = this.getActiveTeam();
    if (activeTeam && this.timerOn()) {
      this.stopTeamTimer(activeTeam.id);
      this.timerOn.set(false);
    }
  }

  goToNextTeam() {
    this.activeTeamId.update((currentId) => {
      let i = 1;
      while (i <= this.numberOfTeams()) {
        const nextId = (currentId + i) % this.numberOfTeams();
        if (this.teams[nextId].time > 0) {
          return nextId;
        }
        i++;
      }
      return (currentId + 1) % this.numberOfTeams();
    });
  }

  goodAnswer() {
    const activeTeam = this.getActiveTeam();
    if (activeTeam && this.timerOn()) {
      this._teams.update((teams) => {
        const team = teams.find((t) => t.id === activeTeam.id);
        if (team) {
          team.score += 1;
        }
        return [...teams];
      });

      this.stopTimer();
      this.goToNextTeam();

      if (activeTeam == this.getActiveTeam()) {
        this.winnerTeamId.set(activeTeam.id);
        this._teams.update((teams) => {
          const team = teams.find((t) => t.id === activeTeam.id);
          if (team) {
            team.status = TeamStatus.Winner;
          }
          return [...teams];
        });
        return;
      }

      this.startTimer();
    }
  }
}
