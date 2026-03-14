import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import RoomService from '../../services/room';

@Component({
  selector: 'room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room.html',
  styleUrl: './room.scss'
})
export class RoomPage implements OnDestroy {
  readonly roomService = inject(RoomService);
  public roomId: string = ""
  public username: string = ""

  createRoom() {
    this.roomService.createRoom(this.username)
  }

  joinRoom() {
    this.roomService.joinRoom(this.roomId, this.username)
  }

  getState(): string {
    return this.roomService.state()
  }

  getRoomId(): string {
    return this.roomService.roomId()
  }

  disconnect() {
    this.roomService.disconnect()
  }

  ngOnDestroy(): void {
    this.roomService.disconnect();
  }
}
