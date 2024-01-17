import { autoInjectable, inject, injectable, singleton } from "tsyringe";
import FrontendServer from "./frontend-server.class";
import InputManager from "./input/input-manager.class";
import { Logger } from "./utils/logger.class";
import { WebsocketServer } from "./websocket/websocket-server.class";
import { CameraManager } from "./cameras/camera-manager.class";

/**
* @author Johannes Franzen
*/
@autoInjectable()
export class PtzServer {
    private frontendServer: FrontendServer;
    private inputManager: InputManager;
    private websocketServer: WebsocketServer;
    private cameraManager: CameraManager;

    constructor() {
        this.inputManager = new InputManager();
        this.websocketServer = new WebsocketServer();
        this.cameraManager = new CameraManager();
        this.frontendServer = new FrontendServer();

        Logger.info('PtzServer started');
    }
}