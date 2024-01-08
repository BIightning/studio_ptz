import { XKeys, XKeysWatcher } from "xkeys";
import XKeysPanel from "./xkeys-panel.class";
import { Logger } from "../../utils/logger.class";

export default class XKeysPanelManager {
    
    static instance: XKeysPanelManager;

    private watcher: XKeysWatcher;
    private panels: XKeysPanel[] = [];

    constructor() {
        if (XKeysPanelManager.instance)
            return XKeysPanelManager.instance;

        XKeysPanelManager.instance = this;
        this.watcher = new XKeysWatcher();
        this.setup();
    }

    private setup(): void {
        this.watcher.on('connected', panel => this.onConnected(panel));
        this.watcher.on('error', err => console.error(err));
    }

    private onConnected(panel: XKeys): void {
        Logger.info(`XKeys panel connected: ${panel._getDeviceInfo().product}`);
        this.panels.push(new XKeysPanel(panel));
    }

    public static onDisconnected(panel: XKeysPanel) {
        this.instance.panels = this.instance.panels.filter(p => p !== panel);
    }
}