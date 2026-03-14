import { Injectable, Signal, signal } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export default class RoomService {
    private teams: Record<string, any> = signal({"spectators": [], "host": "", "teams": {}})
    public readonly state = signal<'disconnected' | 'connecting' | 'connected'>('disconnected')
    public readonly roomId = signal('')

    // Should be replaced with env vars later
    private readonly apiBase = 'http://127.0.0.1:8080';
    private readonly wsBase = 'ws://127.0.0.1:8080';
    //

    private socket: WebSocket | null = null;

    // This allow to create unique roomIds
    createRoomId(length: number) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        this.roomId.set(result.trim())
    }

    async createRoom(username: string) {
        this.createRoomId(6)

        try {
            // Create room with API call
            const res = await fetch(`${this.apiBase}/rooms/${encodeURIComponent(this.roomId())}`, {
                method: 'POST',
            });

            // Handle only success for now
            if(res.status == 201){
                this.joinRoom(this.roomId(), username)
            }
        } catch (err) {
            console.log("Error", err)
        }
    }

    joinRoom(room: string, username: string): void {
        if (!room) return;

        this.disconnect();

        const roomId = room.trim();
        this.roomId.set(roomId);

        const url = `${this.wsBase}/ws/${encodeURIComponent(roomId)}`;
        this.socket = new WebSocket(url);
        this.state.set('connecting');

        this.socket.onopen = () => {
            this.state.set('connected');

            // Send message to be joined officially to room
            this.sendMessage(`ACT JOIN ${username}`)
        };

        this.socket.onmessage = (event) => {
            console.log(String(event.data));

            // Messages will be defined as this "[COMMAND] [**SUBCOMMAND] [**DATA] which is terrible but it works"
            let message = String(event.data).split(" ")

            switch (message[0]) {
                case "ACT":
                    switch (message[1]) {
                        case "JOIN":
                            this.teams["spectators"].push(message[2])
                    }
            }
        };

        this.socket.onerror = (err) => {
            console.log(err)
            this.state.set('disconnected')
            this.roomId.set('')
        };

        this.socket.onclose = () => {
            this.state.set('disconnected');
        };
    }

    sendMessage(msg: string): void {
        if (!msg || !this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        this.socket.send(msg);
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }

        this.state.set('disconnected');
        this.roomId.set('');
    }

    getState(): string {
        return this.state()
    }
}