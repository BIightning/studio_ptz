import FrontendServer from "./frontend-server.class";
import { Logger } from "./utils/logger.class";
export default class PtzApplication {

    private frontendServer: FrontendServer;
    private logger: Logger;
    constructor() {
        this.logger = new Logger();
        this.frontendServer = new FrontendServer();
        this.frontendServer.start();
    }
}