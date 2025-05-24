export abstract class DomainException extends Error {
    constructor(public message: string, public metadata?: Record<string, unknown>) {
        super(message);
        this.name = this.constructor.name;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    abstract toResponse(): {
        statusCode: number;
        body: string
    };
}

export abstract class BusinessException extends DomainException {
    abstract readonly code: string;

    toResponse(): { statusCode: number; body: string } {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: this.code,
                message: this.message,
                metadata: this.metadata,
            }),
        };
    }
}

export abstract class TechnicalException extends DomainException {
    toResponse(): { statusCode: number; body: string } {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'INTERNAL_ERROR',
                message: this.message,
                metadata: this.metadata,
            }),
        };
    }
}

export class UnexpectedException extends TechnicalException {
    constructor(message: string, metadata?: Record<string, unknown>) {
        super(message, metadata);
    }
}

export class MisconfigurationException extends TechnicalException {
    constructor(message: string, metadata?: Record<string, unknown>) {
        super(message, metadata);
    }
}