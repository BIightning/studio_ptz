import { autoInjectable, singleton } from "tsyringe";
import XKeysConnectionManager from "./xkeys/xkeys-manager.class";
import { Logger } from "../utils/logger.class";
import { XKeysJoystickValue } from "./xkeys/interfaces/xkeys-joystick-value.interface";

type KeyCallback = () => void;
type XkeysJoystickCallback = (value: XKeysJoystickValue) => void;
type GenericJoystickCallback = (value: { x: number; y: number; }) => void;


export default class InputManager {


    static _instance: InputManager;

    private xKeysManager: XKeysConnectionManager;

    private xKeysKeyDownCallbacks: Map<number, KeyCallback[]> = new Map();
    private xKeysKeyUpCallbacks: Map<number, KeyCallback[]> = new Map();


    private xKeysJoystickCallbacks: Array<XkeysJoystickCallback> = [];
    private genericJoystickCallbacks: Array<GenericJoystickCallback> = [];
    
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
    public registerXKeysJoystickCallback(callback: XkeysJoystickCallback): void {
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
    public unregisterXKeysJoystickCallback(callback: XkeysJoystickCallback): void {
        this.xKeysJoystickCallbacks = this.xKeysJoystickCallbacks.filter(c => c !== callback);
    }


    public registerGenericJoystickCallback(callback: GenericJoystickCallback): void {
        this.genericJoystickCallbacks.push(callback);
    }

    public unregisterGenericJoystickCallback(callback: GenericJoystickCallback): void {
        this.genericJoystickCallbacks = this.genericJoystickCallbacks.filter(c => c !== callback);
    }


    /**
     * Call all callbacks for a specific key on a XKeys panel.
     * @param keyIndex
     * @param down
     */
    public onXKeysKeyDown(keyIndex: number): void {
        Logger.debug(`XKeys key ${keyIndex} down`);
        const callbacks = this.xKeysKeyDownCallbacks.get(keyIndex);
        if (!callbacks)
            return;

        for (const callback of callbacks)
            callback();
    }

    public onXKeysKeyUp(keyIndex: number): void {
        Logger.debug(`XKeys key ${keyIndex} up`);
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
    public onXKeysJoystick(value: XKeysJoystickValue): void {
        Logger.debug(`XKeys joystick moved to ${JSON.stringify(value)}`);
        value.x = this.normalize(value.x);
        value.y = this.normalize(value.y);
        for (const callback of this.xKeysJoystickCallbacks)
            callback(value);

        for (const callback of this.genericJoystickCallbacks)
            callback({ x: value.x, y: -value.y });
    }

    public onGamepadJoystick(data: { x: number; y: number; }) {
        Logger.debug(`Gamepad joystick moved to ${JSON.stringify(data)}`);

        for (const callback of this.genericJoystickCallbacks)
            callback(data);
    }

    private normalize(value: number, rangeMin = -127, rangeMax = 127): number {
        // Normalize the value to a range of -1 to 1
        const normalized = 2 * (value - rangeMin) / (rangeMax - rangeMin) - 1;
        // Round to 3 decimals
        return Math.round(normalized * 1000) / 1000;
    }

}