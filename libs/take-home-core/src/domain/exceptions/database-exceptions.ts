import { TechnicalException } from './base';

export abstract class DatabaseException extends TechnicalException {
    abstract readonly code: string;
}

export class InsertOperationFailed<T> extends DatabaseException {
    readonly code = 'INSERT_OPERATION_FAILED';

    constructor(entity: T | T[]) {
        super('An error occurred while inserting in the database.', { entity });
    }
}

export class UpdateOperationFailed<T> extends DatabaseException {
    readonly code = 'UPDATE_OPERATION_FAILED';

    constructor(entity: T) {
        super('An error occurred while updating in the database.', { entity });
    }
}

export class DeleteOperationFailed extends DatabaseException {
    readonly code = 'DELETE_OPERATION_FAILED';

    constructor() {
        super('An error occurred while deleting in the database.');
    }
}

export class GetOperationFailed extends DatabaseException {
    readonly code = 'GET_OPERATION_FAILED';

    constructor() {
        super('An error occurred while retrieving from the database.');
    }
}

export class ItemNotFoundException extends DatabaseException {
    readonly code = 'ITEM_NOT_FOUND';

    constructor(message: string) {
        super(message);
    }
}