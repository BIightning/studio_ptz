import { nanoid } from "nanoid";
import { Camera } from "./camera.class";

export class CameraGroup {

    constructor(
        public name: string,
        public cameras: Camera[],
        public id: string = nanoid(7),
    ) {
    }

    static fromJSON(group: any): CameraGroup {
        return new CameraGroup(
            group.name,
            group.cameras.map((camera: any) => Camera.fromJSON(camera)),
            group.id,
        );
    }
    
}