import type { ErrorRequestHandler, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import type { ApiError } from '@xperience/shared';
import { isProduction } from '../config/env';
import { AppError } from '../lib/errors';

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && err.code === 11000;
}

// Errors thrown by express.json() carry a `type` field
function bodyParserErrorType(err: unknown): string | null {
  if (typeof err === 'object' && err !== null && 'type' in err && typeof err.type === 'string') {
    return err.type;
  }
  return null;
}

function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({
      path: i.path.map(String).join('.'),
      message: i.message,
    }));
    return new AppError(400, 'VALIDATION_ERROR', 'Invalid request data', details);
  }

  if (err instanceof mongoose.Error.CastError) {
    return new AppError(400, 'INVALID_ID', `Invalid value for ${err.path}`);
  }

  if (isDuplicateKeyError(err)) {
    return new AppError(409, 'CONFLICT', 'Resource already exists');
  }

  const parserType = bodyParserErrorType(err);
  if (parserType === 'entity.parse.failed')
    return new AppError(400, 'INVALID_JSON', 'Malformed JSON body');
  if (parserType === 'entity.too.large')
    return new AppError(413, 'PAYLOAD_TOO_LARGE', 'Request body too large');

  return new AppError(500, 'INTERNAL_ERROR', 'Something went wrong');
}

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, 'ROUTE_NOT_FOUND', `Cannot ${req.method} ${req.path}`));
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const appError = toAppError(err);

  if (appError.status >= 500) req.log.error({ err }, 'Unhandled error');

  const body: ApiError = {
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details !== undefined && { details: appError.details }),
      ...(!isProduction &&
        appError.status >= 500 &&
        err instanceof Error && { details: err.stack }),
    },
  };

  res.status(appError.status).json(body);
};
