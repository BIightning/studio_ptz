import { Camera } from "../camera.class";

export class PanasonicCamera extends Camera {
    
        
    static override fromJSON(camera: any) {
        return new PanasonicCamera(
            camera.id, 
            camera.name, 
            camera.ip, 
            camera.port
        );
    }
}