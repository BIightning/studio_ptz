import XKeysPanelManager from "./xkeys/panel-manager.class";

export default class InputManager {

    static instance: InputManager;

    private xKeysManager: XKeysPanelManager;
    
    constructor() {
        if (InputManager.instance)
            return InputManager.instance;

        InputManager.instance = this;
        this.xKeysManager = new XKeysPanelManager();
    }

}