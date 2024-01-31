

import FrontendServer from "../frontend-server.class";
import InputManager from "../input/input-manager.class";
import { XKeysJoystickValue } from "../input/xkeys/interfaces/xkeys-joystick-value.interface";
import { Logger } from "../utils/logger.class";
import { WebsocketServer } from "../websocket/websocket-server.class";
import { JoystickDirection } from "./josytick-direction.const";
import { Movement } from "./movement.const";
import asyncCall from "../utils/async-call.util";
import axios from "axios";
import { dir } from "console";

export class CompanionAdapterServer {
    private frontendServer: FrontendServer;
    private inputManager: InputManager;
    private websocketServer: WebsocketServer;

    private readonly joystickDeadZone: number;
    private lastDirection: JoystickDirection | null = null;
    private direction: JoystickDirection | null = null;

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
        // console.log(this.joystickDeadZone)
        // console.log(value);
        if ( //Check if the joystick is completely in the deadzone
            Math.abs(value.x) <= this.joystickDeadZone &&
            Math.abs(value.y) <= this.joystickDeadZone
        ) {
            //If the joystick is in the deadzone, cancel the last movement
            this.direction = null;
            await this.cancelMovement(this.lastDirection);
            return;
        }
        //Cache the last direction
        this.lastDirection = this.direction;

        // Treat values within the deadzone as zero (either x or y can still be in the deadzone)
        let x = Math.abs(value.x) > this.joystickDeadZone ? value.x : 0;
        let y = Math.abs(value.y) > this.joystickDeadZone ? value.y : 0;

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

        if(!this.direction)
            return;

        //If the direction did not change, we don't need to do anything
        if (this.direction == this.lastDirection)
            return;

        await this.cancelMovement(this.lastDirection);
        await this.sendDirection();
    }


    private async cancelMovement(JoystickDirection: JoystickDirection | null) {
        if (this.lastDirection === null)
            return;
        const direction = this.lastDirection;
        this.lastDirection = null; //Set to null to prevent infinite loop

        Logger.debug(`Canceling movement ${direction}`);
        // await this.doRequest(direction, Movement.STOP);
    }


    private async sendDirection() {
        if (this.direction === null)
            return;

        Logger.debug(`Sending movement ${this.direction}`);
        // await this.doRequest(this.direction, Movement.START);
    }


    private async doRequest(direction: JoystickDirection, movement: Movement) {
        const request = `http://${process.env.COMPANION_ADDRESS}/set/custom-variable/${direction}?value=${movement}`;

        const { error } = await asyncCall(
            axios(
                request,
                {
                    method: 'GET',
                }
            )
        );

        if (error)
            Logger.error(`Failed to send request to Companion: ${error} \nRequest: ${request}`);
    }
}