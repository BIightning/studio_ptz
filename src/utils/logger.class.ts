import fs from 'fs';
import chalk from 'chalk';
import { singleton } from 'tsyringe';

export enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug'
}
/**
 *A simple Logger class for logging to console and file.
 */
@singleton()
export class Logger {

    constructor() {
        console.log(process.env.LOG_LEVEL)

        if (process.env.LOG_TO_FILE === 'true')
            this.removeOldEntries();
    }

    /**
     * Log an error message. This will always be logged.
     * @param message 
     */
    public static error(message: string): void {
        this.log(message, LogLevel.ERROR);
    }

    /**
     * Log a warning message. This will only be logged if the LOG_LEVEL environment variable is set to 'warn', 'info' or 'debug'.
     * @param message 
     */
    public static warn(message: string): void {
        this.log(message, LogLevel.WARN);
    }

    /**
     * Log an info message. This will only be logged if the LOG_LEVEL environment variable is set to 'info' or 'debug'.
     * @param message 
     */
    public static info(message: string): void {
        this.log(message, LogLevel.INFO);
    }

    /**
     * Log a debug message. This will only be logged if the LOG_LEVEL environment variable is set to 'debug'.
     * @param message 
     */
    public static debug(message: string): void {
        this.log(message, LogLevel.DEBUG);
    }

    private static log(message: string, level: LogLevel = LogLevel.INFO): void {
        if (!this.shouldLog(level))
            return;

        this.logToConsole(message, level);

        if (process.env.LOG_TO_FILE === 'true')
            this.logToFile(message, level);
    }

    private static logToConsole(message: string, level: LogLevel): void {
        let coloredLevel;

        switch (level) {
            case LogLevel.ERROR:
                coloredLevel = chalk.red(level.toUpperCase());
                break;
            case LogLevel.WARN:
                coloredLevel = chalk.yellow(level.toUpperCase());
                break;
            case LogLevel.INFO:
                coloredLevel = chalk.blue(level.toUpperCase());
                break;
            case LogLevel.DEBUG:
                coloredLevel = chalk.green(level.toUpperCase());
                break;
        }

        const formattedMessage = `[${new Date().toISOString()}] [${coloredLevel}] ${message}`;
        console.log(formattedMessage);
    }

    private static logToFile(message: string, level: LogLevel): void { 
        fs.appendFile(
            process.env.LOG_PATH!,
            `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`,
            err => { if (err) console.error(err); }
        );
    }

    private static shouldLog(level: LogLevel): boolean {
        const currentLevel = process.env.LOG_LEVEL as LogLevel;
        switch (level) {
            case LogLevel.ERROR:
                return true;
            case LogLevel.WARN:
                return currentLevel === LogLevel.WARN || 
                       currentLevel === LogLevel.INFO || 
                       currentLevel === LogLevel.DEBUG;

            case LogLevel.INFO:
                return currentLevel === LogLevel.INFO || 
                       currentLevel === LogLevel.DEBUG;
            case LogLevel.DEBUG:
                return currentLevel === LogLevel.DEBUG;
        }
    }

    /**
     * Remove log entries older than two weeks.
     * This is to prevent the log file from growing too large.
     * This is blocking, so it should only be called once on startup.
     */
    private removeOldEntries(): void {
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const logPath = process.env.LOG_PATH!;
        const logData = fs.readFileSync(logPath, 'utf-8');
        const logEntries = logData.split('\n');

        const newLogEntries = logEntries.filter(entry => {
            const timestamp = new Date(entry.split('] [')[0].slice(1));
            return timestamp > twoWeeksAgo;
        });

        fs.writeFileSync(logPath, newLogEntries.join('\n'));
    }
}