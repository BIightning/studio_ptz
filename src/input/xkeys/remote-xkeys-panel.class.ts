import InputManager from "../input-manager.class";
import { DisconnectCallback } from "./interfaces/disconnect-callback.interface";
import XKeysConnectionManager from "./xkeys-manager.class";


/**
 * Represents a remote XKeys panel.
 * A remote panel is connected via webhid api in the frontend.
 * Events are triggered in the frontend and sent to the backend via websocket.
 * Signals the InputManager when an input is received.
 */
export default class RemoteXKeysPanel {

    private inputManager: InputManager;
    disconnectCallbacks: DisconnectCallback[] = [];

    constructor(public readonly product: string) {
        this.inputManager = InputManager.instance;
        XKeysConnectionManager.onRemoteConnected(this);
    }

    public onDisconnect(callback: DisconnectCallback): void {
        this.disconnectCallbacks.push(callback);
    }

    public triggerDisconnect() {
        this.disconnectCallbacks.forEach((cb: DisconnectCallback) => cb(this));
    }

    public triggerKeyDown(keyIndex: number) {
        this.inputManager.onXKeysKeyDown(keyIndex);
    }

    public triggerKeyUp(keyIndex: number) {
        this.inputManager.onXKeysKeyUp(keyIndex);
    }

    public triggerJoystick(value: { x: number, y: number, z: number, deltaZ: number }) {
        this.inputManager.onXKeysJoystick(value);
    }

}