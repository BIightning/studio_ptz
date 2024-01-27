import { Camera } from "./camera.class";

export class CameraGroup {

    constructor(
        public name: string,
        public cameras: Camera[] = [],
        public id: string,
    ) {}

}