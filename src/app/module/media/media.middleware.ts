import { NextFunction, Request, Response } from "express";
import { IUpdateMediaPayload } from "./media.interface.js";

export const updateMediaMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body.data) {
    req.body = JSON.parse(req.body.data);
  }

  const payload: IUpdateMediaPayload = req.body;
  const files = req.files as { [fieldName: string]: Express.Multer.File[] | undefined };

  if (files?.imageUrl?.[0]) {
    if (!payload) req.body = {};
    req.body.imageUrl = files.imageUrl[0].path;
  }

  req.body = payload;
  next();
};
