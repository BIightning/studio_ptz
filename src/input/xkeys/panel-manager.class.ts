import { XKeys, XKeysWatcher } from "xkeys";
import XKeysPanel from "./xkeys-panel.class";

export default class XKeysPanelManager {
    
    static instance: XKeysPanelManager;

    private watcher: XKeysWatcher;
    private panels: XKeysPanel[] = [];

    private constructor() {
        if (XKeysPanelManager.instance)
            return XKeysPanelManager.instance;

        XKeysPanelManager.instance = this;
        this.watcher = new XKeysWatcher();
    }

    private setup(): void {
        this.watcher.on('connected', panel => this.onConnected(panel));
        this.watcher.on('error', err => console.error(err));
    }

    private onConnected(panel: XKeys): void {
        this.panels.push(new XKeysPanel(panel));
    }

    public static onDisconnected(panel: XKeysPanel) {
        this.instance.panels = this.instance.panels.filter(p => p !== panel);
    }
}