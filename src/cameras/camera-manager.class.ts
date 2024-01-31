import InputManager from "../input/input-manager.class";
import { CameraGroup } from "./camera-group.class";
import * as fs from 'fs';


export class CameraManager {
    private static _instance: CameraManager;

    private inputManager: InputManager;

    private cameraGroups: CameraGroup[] = [];
    private activeGroupIndex: number = 0;
    
    public static get instance(): CameraManager {
        return CameraManager._instance;
    }

    constructor() {
        if (CameraManager._instance)
            return CameraManager._instance;

        CameraManager._instance = this;
        this.inputManager = InputManager.instance;
        this.readCameraGroupsFromDisk();
    }

    public createCameraGroup(name: string): void {
        if (this.cameraGroups.find(group => group.name === name))
            throw new Error('CAM_GROUP_NAME_EXISTS');

        if(this.cameraGroups.length >= +process.env.MAX_CAMERA_GROUPS!) {
            throw new Error('MAX_CAM_GROUPS_REACHED');
        }

        const group = new CameraGroup(name);
        this.cameraGroups.push(group);
        this.writeCameraGroupsToDisk();
    }

    
    public getCameraGroups(): CameraGroup[] {
        return this.cameraGroups;
    }

    public getActiveGroupIndex(): number {
        return  this.activeGroupIndex;
    }
    
    public setActiveGroupIndex(index: number): void {
        this.activeGroupIndex = index;
    }
    
    public saveConfiguration(): void {
        this.writeCameraGroupsToDisk();
    }
    
    
    private readCameraGroupsFromDisk(): void {
        try {
            const list = fs.readFileSync('cameras.json', 'utf-8');
            const data: CameraGroup[] = JSON.parse(list);
            this.cameraGroups = data.map(group => CameraGroup.fromJSON(group));
            
        }   catch (e) { //File does not exist, create it and initialize with empty array
            fs.writeFileSync('cameras.json', '[]');
            this.cameraGroups = [];
        }
    }
    
    private writeCameraGroupsToDisk(): void {
        const data = JSON.stringify(this.cameraGroups);
        fs.writeFileSync('cameras.json', data);
    }
}