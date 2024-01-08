import express from 'express';
import path from 'path';
import { Logger } from './utils/logger.class';

/**
 * Simple Express server to serve a SPA frontend
 */
export default class FrontendServer {

    private app: express.Application;

    constructor() {
        this.app = express();
        this.config();
        this.routes();
        this.start();
    }

    /**
     * Serve static files from the dist directory
     */
    private config(): void {
        this.app.use(express.static(path.join(
            process.cwd(), 
            process.env.FRONTEND_DIST_DIR!
        )));
    }

    /**
     * Serve the index.html file for all routes
     */
    private routes(): void {
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(
                process.cwd(), 
                process.env.FRONTEND_DIST_DIR!, 
                'index.html'
            ));
        });
    }

    public start(): void {
        this.app.listen(3000, 
            () => Logger.info(`Frontend server listening on port ${process.env.FRONTEND_SERVER_PORT}`)
        );
    }
}