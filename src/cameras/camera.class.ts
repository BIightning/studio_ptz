export class Camera {

    constructor(
        public id: string,
        public name: string,
        public model: string,
        public ip: string,
        public port: number,
    ) {}



    static fromJSON(camera: any): Camera {
        return new Camera(
            camera.id,
            camera.name,
            camera.model,
            camera.ip,
            camera.port,
        );
    }
}