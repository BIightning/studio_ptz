import { autoInjectable, singleton } from "tsyringe";
import XKeysConnectionManager from "./xkeys/xkeys-manager.class";
import { Logger } from "../utils/logger.class";
import { XKeysJoystickValue } from "./xkeys/interfaces/xkeys-joystick-value.interface";

type KeyCallback = () => void;
type JoystickCallback = (joystickIndex: number, value: XKeysJoystickValue) => void;

@autoInjectable()
export default class InputManager {

    static _instance: InputManager;

    private xKeysManager: XKeysConnectionManager;

    private xKeysKeyDownCallbacks: Map<number, KeyCallback[]> = new Map();
    private xKeysKeyUpCallbacks: Map<number, KeyCallback[]> = new Map();
    private xKeysJoystickCallbacks: Array<JoystickCallback> = [];
    
    public static get instance(): InputManager {
        return InputManager._instance;
    }

    constructor() {
        if (InputManager._instance)
        return InputManager._instance;
    
        InputManager._instance = this;
        this.xKeysManager = new XKeysConnectionManager();
        Logger.info('InputManager initialized');
    }

    /**
     * Register a callback for a specific key on a XKeys panel.
     * @param keyIndex 
     * @param callback 
     */
    public registerXKeysKeyDownCallback(keyIndex: number, callback: KeyCallback): void {
        if (!this.xKeysKeyDownCallbacks.has(keyIndex))
            this.xKeysKeyDownCallbacks.set(keyIndex, []);

        const callbacks = this.xKeysKeyDownCallbacks.get(keyIndex)!;
        callbacks.push(callback);
    }


    /**
     * Register a callback for a specific key on a XKeys panel.
     * @param keyIndex 
     * @param callback 
     */
    public registerXKeysKeyUpCallback(keyIndex: number, callback: KeyCallback): void {
        if (!this.xKeysKeyUpCallbacks.has(keyIndex))
            this.xKeysKeyUpCallbacks.set(keyIndex, []);

        const callbacks = this.xKeysKeyUpCallbacks.get(keyIndex)!;
        callbacks.push(callback);
    }

    /**
     * Register a callback for all joystick movements on a XKeys panel.
     * @param callback 
     */
    public registerXKeysJoystickCallback(callback: JoystickCallback): void {
        this.xKeysJoystickCallbacks.push(callback);
    }

    /**
     * Unregister a callback for a specific key on a XKeys panel.
     * @param keyIndex 
     */
    public unregisterXKeysKeyCallback(keyIndex: number, callback: KeyCallback): void {
       const callbacks = this.xKeysKeyDownCallbacks.get(keyIndex);
         if (!callbacks)
              return;

        const index = callbacks.indexOf(callback);
        if (index === -1)
            return;

        callbacks.splice(index, 1);
    }

    /**
     * Unregister a callback for all joystick movements on a XKeys panel.
     * @param callback 
     */
    public unregisterXKeysJoystickCallback(callback: JoystickCallback): void {
        this.xKeysJoystickCallbacks = this.xKeysJoystickCallbacks.filter(c => c !== callback);
    }


    /**
     * Call all callbacks for a specific key on a XKeys panel.
     * @param keyIndex
     * @param down
     */
    public onXKeysKeyDown(keyIndex: number): void {
        const callbacks = this.xKeysKeyDownCallbacks.get(keyIndex);
        if (!callbacks)
            return;

        for (const callback of callbacks)
            callback();
    }

    public onXKeysKeyUp(keyIndex: number): void {
        const callbacks = this.xKeysKeyDownCallbacks.get(keyIndex);
        if (!callbacks)
            return;

        for (const callback of callbacks)
            callback();
    }

    /**
     * Call all callbacks for all joystick movements on a XKeys panel.
     * @param joystickIndex
     * @param value
     */
    public onXKeysJoystick(joystickIndex: number, value: XKeysJoystickValue): void {
        for (const callback of this.xKeysJoystickCallbacks)
            callback(joystickIndex, value);
    }

}