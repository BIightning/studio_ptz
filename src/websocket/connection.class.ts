import { ServerSideSocket } from "../../lib/server-side-socket";
import { WebSocket } from "ws";
import { nanoid } from "nanoid";
import RemoteXKeysPanel from "../input/xkeys/remote-xkeys-panel.class";
import { XKeysJoystickValue } from "../input/xkeys/interfaces/xkeys-joystick-value.interface";



export class Connection {

    private socket: ServerSideSocket;
    panel: RemoteXKeysPanel | null = null;

    get Socket(): ServerSideSocket {
        return this.socket;
    }

    constructor(wsSocket: WebSocket, public readonly id = nanoid(7)) {
        this.socket = new ServerSideSocket(wsSocket, 'server');
        this.setup();
    }

    private setup() {
        
        this.socket.on('socket::close', () => this.onDisconnect());
        

        this.socket.on(
            'client::xkeys-connect', 
            (data: any) => this.onXKeysConnect(data)
        );

        this.socket.on(
            'client::xkeys-disconnect', 
            () => this.onXKeysDisconnect()
        );

        this.socket.on(
            'client::xkeys-keydown', 
            ( { keyIndex }: any) => this.panel?.triggerKeyDown(keyIndex)
        );
        this.socket.on(
            'client::xkeys-keyup', 
            ( { keyIndex }: any) => this.panel?.triggerKeyUp(keyIndex)
        );

        this.socket.on(
            'client::xkeys-joystick', 
            (value: XKeysJoystickValue) => this.panel?.triggerJoystick(value)
        );

        this.socket.on('client::cameragroups-get', () => {
                
        });

        this.socket.on('client::cameragroup-create', (data: any) => { 
            //todo: implement
        });

        this.socket.on('client::cameragroup-update', (data: any) => {

        });

        this.socket.on('client::cameragroup-delete', (data: any) => {

        });

        this.socket.on('client::cameragroup-select', (data: any) => {
            
        });
    }

    public ping(): boolean {
        return this.socket.ping();
    }

    private onDisconnect(): void {
        if (this.panel)
            this.panel.triggerDisconnect();

        this.socket.close();
    }
    
    private onXKeysConnect(data: any): void {
        this.panel = new RemoteXKeysPanel(data);
        this.socket.send('server::xkeys-connect-confirm');
    }

    private onXKeysDisconnect(): void {
        if (!this.panel)
            return;
        this.panel.triggerDisconnect();
        this.panel = null;
    }

}