import { NextFunction, Request, Response } from "express";

export const updateMediaMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Parse body.data if it exists (for multipart form data with text fields)
  if (req.body.data) {
    try {
      req.body = JSON.parse(req.body.data);
    } catch (e) {
      console.error("Error parsing body.data:", e);
    }
  }

  const files = req.files as { [fieldName: string]: Express.Multer.File[] | undefined };

  // Add imageUrl from uploaded file if present
  if (files?.imageUrl?.[0]) {
    req.body.imageUrl = files.imageUrl[0].path;
  }

  next();
};

export const createMediaMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Parse body.data if it exists (for multipart form data with text fields)
  if (req.body.data) {
    try {
      req.body = JSON.parse(req.body.data);
    } catch (e) {
      console.error("Error parsing body.data:", e);
    }
  }

  const files = req.files as { [fieldName: string]: Express.Multer.File[] | undefined };

  // Add imageUrl from uploaded file if present
  if (files?.imageUrl?.[0]) {
    req.body.imageUrl = files.imageUrl[0].path;
  }

  next();
};
