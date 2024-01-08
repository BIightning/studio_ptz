import express from 'express';
import path from 'path';

export default class FrontendServer {

    private app: express.Application;

    constructor() {
        this.app = express();
        this.config();
        this.routes();
    }

    private config(): void {
        // Serve static files from the Angular app build output directory
        this.app.use(express.static(path.join(process.cwd(), 'ptz-frontend/dist/browser')));
    }

    private routes(): void {
        // We only need to serve index.html from the Angular app for all routes
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(process.cwd(), 'ptz-frontend/dist/browser/index.html'));
        });
    }

    public start(): void {
        this.app.listen(3000, () => {
            console.log('Server is listening on port 3000');
        });
    }
}