import { Routes } from '@angular/router';
import { RoomPage } from './pages/room/room';
import { DefaultPage } from './pages/default/default'

// Define each route in the app, for the moment 2 will be enough
// Previous app will still be available in route "/"
export const routes: Routes = [
    { path: '', component: DefaultPage},
    { path: 'room', component: RoomPage },
];
