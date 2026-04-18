import { ZodTypeAny } from "zod";
import { NextFunction, Request, Response } from "express";

export const validateRequest =
  (schema: ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  };
