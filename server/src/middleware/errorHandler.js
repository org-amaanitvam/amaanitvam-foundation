import logger from "../shared/logger/index.js";
import { BadRequestError } from "../shared/errors/AppError.js";

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new BadRequestError(message);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new BadRequestError(message);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new BadRequestError(message);
};

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    logger.error(`[Error] ${err.message}`, { stack: err.stack });
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.error?.code || "SERVER_ERROR",
        message: err.message,
        details: err.error?.details || [],
        stack: err.stack,
      },
    });
  } else {
    let error = { ...err };
    error.message = err.message;

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError") error = handleValidationErrorDB(error);

    logger.error(`[Error] ${error.message}`);

    if (error.isOperational) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.error?.code || "SERVER_ERROR",
          message: error.message,
          details: error.error?.details || [],
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Something went very wrong!",
          details: [],
        },
      });
    }
  }
};