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

export class TaskNotFoundError extends ApplicationError {
  readonly code = 'TASK_NOT_FOUND';
  readonly statusCode = 404;
  
  constructor(taskId: string) {
    super(`Task with id ${taskId} not found`);
  }
}

export class InvalidTaskStatusError extends ApplicationError {
  readonly code = 'INVALID_TASK_STATUS';
  readonly statusCode = 400;
  
  constructor(status: string) {
    super(`Invalid task status: ${status}`);
  }
}