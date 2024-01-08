import fs from 'fs';

export enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug'
}

export class Logger {
    static instance: Logger;
    static logLevel: LogLevel;
    static logToFile: boolean;

    constructor() {
        if (Logger.instance)
            return Logger.instance;

        Logger.instance = this;
        Logger.logLevel = process.env.LOG_LEVEL as LogLevel || LogLevel.INFO;
        Logger.logToFile = process.env.LOG_TO_FILE === 'true';
    }


    static log(message: string, level: LogLevel = LogLevel.INFO): void {
        if (!this.shouldLog(level))
            return;

        const formattedMessage = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}\n`;
        console.log(formattedMessage);

        if (this.logToFile)
            fs.appendFile(
                process.env.LOG_PATH!,
                formattedMessage, 
                err => { if (err) console.error(err); }
            );
    }

    static error(message: string): void {
        this.log(message, LogLevel.ERROR);
    }

    static warn(message: string): void {
        this.log(message, LogLevel.WARN);
    }

    static info(message: string): void {
        this.log(message, LogLevel.INFO);
    }

    static debug(message: string): void {
        this.log(message, LogLevel.DEBUG);
    }

    private static shouldLog(level: LogLevel): boolean {
        return this.logLevel >= level;
    }
}