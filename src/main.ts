import "reflect-metadata";
import dotenv from 'dotenv';
import { PtzServer } from "./ptz-server.class";

dotenv.config();
const ptzServer = new PtzServer();