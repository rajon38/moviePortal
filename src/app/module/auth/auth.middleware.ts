import { NextFunction, Request, Response } from "express";

export const updateProfileMiddleware = (
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

  // Add image from uploaded file if present
  if (files?.image?.[0]) {
    req.body.image = files.image[0].path;
  }

  next();
};
