import { nanoid } from "nanoid";
import { Camera } from "./camera.class";

export class CameraGroup {

    private activeCameraIndex: number = 0;

    constructor(
        public name: string,
        public cameras: Camera[] = [],
        public id: string = nanoid(7),
    ) {}

    public getActiveCameraIndex(): number {
        return this.activeCameraIndex;
    }

    public setActiveCameraIndex(index: number): void {
        this.activeCameraIndex = index;
    }

    public addCamera(camera: Camera): void {
        if(this.cameras.length >= +process.env.MAX_CAMERAS_IN_GROUP!)
            throw new Error('MAX_CAMS_IN_GROUP_REACHED');

        this.cameras.push(camera);
    }

    public removeCamera(index: number): void {
        this.cameras.splice(index, 1);
    }



    static fromJSON(group: any): CameraGroup {
        return new CameraGroup(
            group.name,
            group.cameras.map((camera: any) => Camera.fromJSON(camera)),
            group.id,
        );
    }
    
}