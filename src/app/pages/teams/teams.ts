import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Timer } from '../../timer/timer';
import { Score } from '../../score/score';

@Component({
  selector: 'app-teams',
  imports: [RouterLink, Timer, Score],
  templateUrl: './teams.html',
  styleUrl: './teams.scss',
})
export class Teams {

}
