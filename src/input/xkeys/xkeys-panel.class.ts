import { JoystickValueEmit, XKeys } from "xkeys";
import XKeysPanelManager from "./panel-manager.class";
import { Logger } from "../../utils/logger.class";


export default class XKeysPanel {

    constructor(private readonly panel: XKeys) {
        this.setup();
    }

    private setup() {
        this.panel.on('disconnected', () => XKeysPanelManager.onDisconnected(this));
        this.panel.on('error', err => console.error(err));

        this.panel.on('down', keyIndex => this.onDown(keyIndex));
        this.panel.on('up', keyIndex => this.onUp(keyIndex));
        this.panel.on('joystick', (joystickIndex, value) => this.onJoystickMove(joystickIndex, value));
    }
    onUp(keyIndex: number): void {
        Logger.info(`XKeys panel key up: ${keyIndex}`);
    }
    onDown(keyIndex: number): void {
        Logger.info(`XKeys panel key down: ${keyIndex}`);
    }
    onJoystickMove(joystickIndex: number, value: JoystickValueEmit): void {
        Logger.info(`XKeys panel joystick ${joystickIndex} moved: ${JSON.stringify(value)}`);
    }
}
    
    