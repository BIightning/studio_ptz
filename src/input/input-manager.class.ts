import XKeysPanelManager from "./xkeys/panel-manager.class";

export default class InputManager {

    static instance: InputManager;

    private xKeysManager: XKeysPanelManager;
    
    private constructor() {
        if (InputManager.instance)
            return InputManager.instance;

        InputManager.instance = this;
    }

}