import dotenv from 'dotenv';
import { StandalonePtzServer } from "./standalone-ptz/standalone-ptz-server.class";
import { CompanionAdapterServer } from "./companion-adapter/companion-adapter-server.class";

dotenv.config();


//StandAlonePTZ. This is the main entry point for the standalone PTZ server. INCOMPLETE!
// const ptzServer = new StandalonePtzServer();




//CompanionAdapter. This is the main entry point for the companion adapter server
const companionAdapterServer = new CompanionAdapterServer();
