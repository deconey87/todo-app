export abstract class ApplicationError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
}

export class TaskListNotFoundError extends ApplicationError {
  readonly code = 'TASK_LIST_NOT_FOUND';
  readonly statusCode = 404;
  
  constructor(listId: string) {
    super(`Task list with id ${listId} not found`);
  }
}

export class ValidationError extends ApplicationError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
  
  constructor(message: string) {
    super(message);
  }
}

export class DuplicateTaskListNameError extends ApplicationError {
  readonly code = 'DUPLICATE_TASK_LIST_NAME';
  readonly statusCode = 409;
  
  constructor(name: string) {
    super(`Task list with name '${name}' already exists`);
  }
}