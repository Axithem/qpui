import { computed, Injectable, signal } from '@angular/core';
import Team from './types/team';

@Injectable({
  providedIn: 'root',
})
export default class Timer {
  private readonly _teams = signal<Team[]>([]);
  private teamTimers: { [key: number]: any } = {};
  private teamTurnCounts: { [key: number]: number } = {};
  
  readonly turnCount = signal<number>(0);
  readonly timeUpTeam = signal<Team | null>(null);
  readonly winnerTeam = signal<Team | null>(null);
  readonly timerOn = signal<boolean>(false);
  readonly activeTeamId = signal<number>(0);

  readonly currentTeam = computed(() => {
    return this._teams().find(t => t.id === this.activeTeamId()) || null;
  });

  readonly currentPlayer = computed(() => {
    const team = this.currentTeam();
    if (!team || team.players.length === 0) return null;
    const teamTurns = this.teamTurnCounts[team.id] ?? 0;
    return team.players[teamTurns % team.players.length];
  });

  readonly nextTeam = computed(() => {
    return this.getNextActiveTeam(this.activeTeamId());
  });

  readonly nextPlayer = computed(() => {
    const team = this.nextTeam();
    if (!team || team.players.length === 0) return null;
    const teamTurns = this.teamTurnCounts[team.id] ?? 0;
    const offset = (team.id === this.activeTeamId()) ? 1 : 0;
    return team.players[(teamTurns + offset) % team.players.length];
  });

  get teams() {
    return this._teams();
  }

  set teams(teams: Team[]) {
    this._teams.set(teams);
  }

  createTeam(name: string) {
    const newTeam: Team = {
      id: this._teams().length,
      name,
      score: 0,
      time: 60000, // 60 seconds
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

  addTeam(team: Team) {
    this._teams.update((teams) => [...teams, team]);
  }

  updateTeam(updatedTeam: Team) {
    this._teams.update((teams) => {
      return teams.map((team) => (team.id === updatedTeam.id ? updatedTeam : team));
    });
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

  removeTeam(teamId: number) {
    this._teams.update((teams) => {
      const remaining = teams.filter((team) => team.id !== teamId);
      return remaining.map((t, idx) => ({ ...t, id: idx }));
    });
  }

  getNextActiveTeam(currentId: number): Team | null {
    const ts = this._teams();
    if (ts.length === 0) return null;
    const currentIndex = ts.findIndex(t => t.id === currentId);
    if (currentIndex === -1) return null;
    
    // Cycle and find the next team that has time > 0
    for (let i = 1; i <= ts.length; i++) {
      const nextIndex = (currentIndex + i) % ts.length;
      const team = ts[nextIndex];
      if (team && team.time > 0) {
        return team;
      }
    }
    return null;
  }

  startTeamTimer(teamId: number) {
    const timerInterval = setInterval(() => {
      this._teams.update((teams) => {
        const team = teams.find((t) => t.id === teamId);
        if (team) {
          if (team.time > 0) {
            const newTime = Math.max(0, team.time - 10);
            
            const updatedTeams = teams.map((t) => {
              if (t.id === teamId) {
                return { ...t, time: newTime };
              }
              return t;
            });
            
            if (newTime <= 0) {
              clearInterval(timerInterval);
              delete this.teamTimers[teamId];
              
              setTimeout(() => {
                const activeTeams = updatedTeams.filter(t => t.time > 0);
                if (activeTeams.length <= 1) {
                  // Round is over. The last team standing wins
                  const winner = activeTeams[0] || null;
                  this.winnerTeam.set(winner);
                  this.timeUpTeam.set(team);
                  this.stopTimer();
                } else {
                  // Stop current timer (sets timerOn to false), and move to next active team, keeping it paused
                  this.stopTimer();
                  this.goToNextTeam();
                }
              }, 0);
            }
            
            return updatedTeams;
          }
        }
        return teams;
      });
    }, 10);
    this.teamTimers[teamId] = timerInterval;
  }

  stopTeamTimer(teamId: number) {
    if (this.teamTimers[teamId]) {
      clearInterval(this.teamTimers[teamId]);
      delete this.teamTimers[teamId];
    }
  }

  resetTeamTimer(teamId: number, time: number = 60000) {
    this._teams.update((teams) => {
      return teams.map((team) => {
        if (team.id === teamId) {
          return { ...team, time };
        }
        return team;
      });
    });
  }

  setActiveTeam(teamId: number) {
    this.activeTeamId.set(teamId);
  }

  getActiveTeam() {
    return this.currentTeam() ?? undefined;
  }

  getTimerStatus() {
    return this.timerOn();
  }

  startTimer() {
    const activeTeam = this.getActiveTeam();
    if (activeTeam && activeTeam.time > 0 && !this.timerOn() && !this.winnerTeam()) {
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
    const nextTeam = this.getNextActiveTeam(this.activeTeamId());
    if (nextTeam) {
      this.activeTeamId.set(nextTeam.id);
    }
  }

  goodAnswer() {
    const activeTeam = this.getActiveTeam();
    if (activeTeam && this.timerOn() && !this.winnerTeam()) {
      this.addTeamScore(activeTeam.id, 1);
      this.teamTurnCounts[activeTeam.id] = (this.teamTurnCounts[activeTeam.id] ?? 0) + 1;
      this.stopTimer();
      this.goToNextTeam();
      this.startTimer();
    }
  }

  clearAll() {
    this.stopTimer();
    this.turnCount.set(0);
    this.timeUpTeam.set(null);
    this.winnerTeam.set(null);
    this.teamTurnCounts = {};
    this._teams.set([]);
  }

  resetGame() {
    this.stopTimer();
    this.turnCount.set(0);
    this.timeUpTeam.set(null);
    this.winnerTeam.set(null);
    this.teamTurnCounts = {};
    this._teams.update((teams) => {
      return teams.map((t) => {
        return {
          ...t,
          score: 0,
          time: 60000,
        };
      });
    });
    if (this._teams().length > 0) {
      this.activeTeamId.set(this._teams()[0].id);
    }
  }
}
