import FrontendServer from "./frontend-server.class";

export default class PtzApplication {

    private frontendServer: FrontendServer;

    constructor() {
        this.frontendServer = new FrontendServer();
        this.frontendServer.start();
    }
}