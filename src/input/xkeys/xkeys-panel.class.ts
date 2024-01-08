import { XKeys } from "xkeys";
import XKeysPanelManager from "./panel-manager.class";


export default class XKeysPanel {

    constructor(private readonly panel: XKeys) {
        this.setup();
    }

    private setup() {
        this.panel.on('disconnected', () => XKeysPanelManager.onDisconnected(this));
        this.panel.on('error', err => console.error(err));
    }
}
    
    