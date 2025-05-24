import pino from 'pino';
import { Logger } from '../../domain/ports/logger';


export class PinoLogger implements Logger {
    private logger: pino.Logger;

    constructor() {
        this.logger = pino({ level: process.env.LOG_LEVEL || 'info' });
    }

    info(message: string, ...args: unknown[]): void {
        this.logger.info(message, ...args);
    }

    error(message: string, ...args: unknown[]): void {
        this.logger.error(message, ...args);
    }

    warn(message: string, ...args: unknown[]): void {
        this.logger.warn(message, ...args);
    }

    debug(message: string, ...args: unknown[]): void {
        this.logger.debug(message, ...args);
    }
}
