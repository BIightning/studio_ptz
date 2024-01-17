import { JoystickValueEmit, XKeys } from "xkeys";
import XKeysConnectionManager from "./xkeys-manager.class";
import { Logger } from "../../utils/logger.class";
import InputManager from "../input-manager.class";
import { DisconnectCallback } from "./interfaces/disconnect-callback.interface";

interface DeviceInfo {
    product: string | undefined;
    productId: number;
    interface: number | null;
}

/**
 * Wrapper class for the XKeys class from the xkeys library.
 * This class is used for local XKeys panels.
 * Signals the InputManager when an input is received.
 */
export default class XKeysPanel {

    private inputManager: InputManager;
    private disconnectCallbacks: DisconnectCallback[] = [];

    constructor(private readonly panel: XKeys) {
        this.inputManager = InputManager.instance;
        this.setup();
    }

    private setup() {
        this.panel.on('disconnected', () => this.disconnectCallbacks.forEach(cb => cb(this)));
        this.panel.on('error', err => console.error(err));

        this.panel.on('down', keyIndex => this.onDown(keyIndex));
        this.panel.on('up', keyIndex => this.onUp(keyIndex));
        this.panel.on('joystick', (joystickIndex, value) => this.onJoystickMove(joystickIndex, value));
    }

    public onDisconnect(callback: DisconnectCallback): void {
        this.disconnectCallbacks.push(callback);
    }

    private onDown(keyIndex: number): void {
        this.inputManager.onXKeysKeyDown(keyIndex);
    }

    private onUp(keyIndex: number): void {
        this.inputManager.onXKeysKeyUp(keyIndex);
    }


    private onJoystickMove(joystickIndex: number, value: JoystickValueEmit): void {
        this.inputManager.onXKeysJoystick(joystickIndex, value);
    }

    public getDeviceInfo(): DeviceInfo {
        return this.panel._getDeviceInfo();
    }
}
    
    