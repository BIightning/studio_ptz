import FrontendServer from "./frontend-server.class";
import InputManager from "./input/input-manager.class";
import { Logger } from "./utils/logger.class";
export default class PtzApplication {

    private logger: Logger;
    private frontendServer: FrontendServer;
    private InputManager: InputManager;
    constructor() {
        this.logger = new Logger();
        this.frontendServer = new FrontendServer();
        this.InputManager = new InputManager();
    }
}