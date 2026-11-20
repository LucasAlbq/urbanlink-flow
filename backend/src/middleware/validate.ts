import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

interface RequestSchemas {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

export const validate = (schemas: RequestSchemas): RequestHandler => {
  return (request, _response, next): void => {
    if (schemas.body !== undefined) {
      request.body = schemas.body.parse(request.body);
    }
    if (schemas.params !== undefined) {
      request.params = schemas.params.parse(request.params) as typeof request.params;
    }
    if (schemas.query !== undefined) {
      // Express 5 exposes `request.query` through a getter. Shadowing it on the
      // request instance preserves the parsed/defaulted Zod value for handlers.
      Object.defineProperty(request, 'query', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: schemas.query.parse(request.query),
      });
    }
    next();
  };
};
