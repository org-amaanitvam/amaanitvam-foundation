export class AppError extends Error {
  constructor(message, statusCode, errorCode = 'SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.error = {
      code: errorCode,
      message,
      details: [],
    };

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', errorCode = 'RESOURCE_NOT_FOUND') {
    super(message, 404, errorCode);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', errorCode = 'VALIDATION_ERROR') {
    super(message, 400, errorCode);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', errorCode = 'VALIDATION_ERROR') {
    super(message, 400, errorCode);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', errorCode = 'AUTH_TOKEN_INVALID') {
    super(message, 401, errorCode);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', errorCode = 'USER_UNAUTHORIZED') {
    super(message, 403, errorCode);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'SERVER_ERROR');
  }
}