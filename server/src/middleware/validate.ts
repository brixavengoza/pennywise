import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// validate request data using Zod schema
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        ...req.body,
        ...req.query,
        ...req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors,
        });
        return;
      }
      next(error);
    }
  };
};
