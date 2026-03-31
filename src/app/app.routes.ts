import { Routes } from '@angular/router';
import { RoomPage } from './pages/room/room';
import { DefaultPage } from './pages/default/default';
import { Backlog } from './pages/backlog/backlog';
import { Teams } from './pages/teams/teams';
import { Buzzers } from './pages/buzzers/buzzers';
import { Archives } from './pages/archives/archives';

// Define each route in the app, for the moment 2 will be enough
// Previous app will still be available in route "/"
export const routes: Routes = [
    { path: '', component: DefaultPage},
    { path: 'room', component: RoomPage },
    { path: 'backlog', component: Backlog },
    { path: 'teams', component: Teams },
    { path: 'buzzers', component: Buzzers },
    { path: 'archives', component: Archives },
];
