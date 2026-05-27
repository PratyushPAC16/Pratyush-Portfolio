import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Generic middleware to check express-validator results.
 * If there are validation errors, returns 400 with the error array.
 * Otherwise calls next().
 */
export function validate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
}
