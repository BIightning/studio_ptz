import { XKeys, XKeysWatcher } from "xkeys";
import XKeysPanel from "./xkeys-panel.class";
import { Logger } from "../../utils/logger.class";
import RemoteXKeysPanel from "./remote-xkeys-panel.class";


/**
 * Handles the connection to XKeys panels.
 * Panels can be connected locally or remotely via webhid api in the frontend.
 */
export default class XKeysConnectionManager {
    
    static instance: XKeysConnectionManager;

    private watcher: XKeysWatcher;
    private panels: XKeysPanel[] = [];
    private remotePanels: RemoteXKeysPanel[] = [];

    constructor() {
        if (XKeysConnectionManager.instance)
            return XKeysConnectionManager.instance;

        XKeysConnectionManager.instance = this;

        this.setupWatcher();
    }
    

    private setupWatcher() {
        this.watcher = new XKeysWatcher();
        this.watcher.on('connected', panel => this.onLocalConnected(panel));
        this.watcher.on('error', err => console.error(err));
    }


    private onLocalConnected(panel: XKeys): void {
        Logger.info(`XKeys panel connected: "${panel._getDeviceInfo().product}"`);
        this.panels.push(new XKeysPanel(panel));
    }

    
    public static onRemoteConnected(panel: RemoteXKeysPanel) {
        Logger.info(`Remote XKeys panel connected: "${panel.product}"`);
        panel.disconnectCallbacks.push(() => this.onRemoteDisconnected(panel));
        this.instance.remotePanels.push(panel);
    }


    public static onDisconnected(panel: XKeysPanel) {
        Logger.info(`Local XKeys panel disconnected: "${panel.getDeviceInfo().product}"`);
        this.instance.panels = this.instance.panels.filter(p => p !== panel);
    }


    public static onRemoteDisconnected(panel: RemoteXKeysPanel) {
        Logger.info(`Remote XKeys panel disconnected: "${panel.product}"`);
        this.instance.remotePanels = this.instance.remotePanels.filter(p => p !== panel);
    }
}