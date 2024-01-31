import axios from "axios";
import FrontendServer from "../frontend-server.class";
import InputManager from "../input/input-manager.class";
import { XKeysJoystickValue } from "../input/xkeys/interfaces/xkeys-joystick-value.interface";
import { Logger } from "../utils/logger.class";
import { WebsocketServer } from "../websocket/websocket-server.class";
import { JoystickDirection } from "./josytick-direction.const";
import { Movement } from "./movement.const";
import asyncCall from "../utils/async-call.util";

export class CompanionAdapterServer {
    /* Refs to Frontend & Websocket servers to prevent garbage collection */
    private frontendServer: FrontendServer;
    private websocketServer: WebsocketServer;

    private inputManager: InputManager;


    private readonly joystickDeadZone: number;
    lastDirection: JoystickDirection | null = null;
    direction: JoystickDirection | null = null;

    private requestQueue: Promise<any> = Promise.resolve();

    constructor() {
        this.inputManager = new InputManager();
        this.websocketServer = new WebsocketServer();
        this.frontendServer = new FrontendServer();
        this.setup();
        this.joystickDeadZone = +process.env.JOYSTICK_DEAD_ZONE!;
        Logger.info('CompanionPassThroughServer started');
    }

    private async setup() {
        this.inputManager.registerGenericJoystickCallback(
            (value) => this.onJoyStickSignal(value)
        );
    }


    private async onJoyStickSignal(value: { x: number; y: number; }) {

        // Treat values within the deadzone as zero (either x or y can still be in the deadzone)
        let x = Math.abs(value.x) > this.joystickDeadZone ? value.x : 0;
        let y = Math.abs(value.y) > this.joystickDeadZone ? value.y : 0;

        if (x === 0 && y === 0) {
            //If the joystick is in the deadzone, cancel the last movement
            await this.cancelMovement();
            this.lastDirection = null;
            return;
        }

        //Cache the last direction
        this.lastDirection = this.direction;

        if (y < 0) { //Upper half of the joystick
            if (x > 0)
                this.direction = JoystickDirection.UPPER_RIGHT;
            else if (x < 0)
                this.direction = JoystickDirection.UPPER_LEFT;
            else
                this.direction = JoystickDirection.UP;
        }

        else if (y > 0) { //Lower half of the joystick
            if (x > 0)
                this.direction = JoystickDirection.LOWER_RIGHT;
            else if (x < 0)
                this.direction = JoystickDirection.LOWER_LEFT;
            else
                this.direction = JoystickDirection.DOWN;
        }

        else { //Y is 0, so the joystick is either left or right
            if (x > 0)
                this.direction = JoystickDirection.RIGHT;
            else if (x < 0)
                this.direction = JoystickDirection.LEFT;
        }


        //If the direction did not change, we don't need to do anything
        if (this.direction === this.lastDirection)
            return;

        await this.cancelMovement();
        await this.sendDirection();
    }


    private async cancelMovement() {
        if (this.lastDirection === null)
            return;

        Logger.info(`Canceling movement ${this.lastDirection}`);
        this.runRequest(this.lastDirection, Movement.STOP);
    }


    private async sendDirection() {
        if (this.direction === null)
            return;

        Logger.info(`Sending movement ${this.direction}`);
        this.runRequest(this.direction, Movement.START);
    }


    private async runRequest(direction: JoystickDirection, movement: Movement) {
        const request = `http://${process.env.COMPANION_ADDRESS}/set/custom-variable/${direction}/${movement}`;

        this.addToQueue(() => fetch(request));
    }

    private addToQueue(fn: () => Promise<any>) {
        this.requestQueue = this.requestQueue.then(fn)
            .catch((error) => Logger.error(`Failed to send request to Companion: ${error}`));
    }
}