import { BusinessException, TechnicalException } from './base';

export class BadRequestException extends BusinessException {
    readonly code = 'BAD_REQUEST';

    constructor(message: string, private statusCode: number) {
        super(message);
    }

    toResponse(): { statusCode: number; body: string; } {
        return {
            statusCode: this.statusCode,
            body: JSON.stringify({
                error: this.code,
                message: this.message,
                metadata: this.metadata,
            }),
        };
    }
}

export class UnauthorizedException extends BusinessException {
    readonly code = 'UNAUTHORIZED';
    
    constructor(message: string, private statusCode: number) {
        super(message);
    }

    toResponse(): { statusCode: number; body: string; } {
        return {
            statusCode: this.statusCode,
            body: JSON.stringify({
                error: this.code,
                message: this.message,
                metadata: this.metadata,
            }),
        };
    }
}

export class ServerException extends TechnicalException {
    constructor(message: string) {
        super(message);
    }
}
