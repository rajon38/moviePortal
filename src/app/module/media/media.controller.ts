import { Request, Response } from "express";
import status from "http-status";
import { IRequestUser } from "../../interfaces/requestUser.interface.js";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { MediaService } from "./media.service.js";
import { IQueryParams } from "../../interfaces/query.interface.js";

const getAll = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await MediaService.getAll( query as IQueryParams);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Media list retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await MediaService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Media retrieved successfully",
    data: result,
  });
});

const create = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  
  if (!user) {
    return sendResponse(res, {
      success: false,
      httpStatusCode: status.UNAUTHORIZED,
      message: "Unauthorized user",
      data: null,
    });
  }

  const result = await MediaService.create(user, req.body);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.CREATED,
    message: "Media created successfully",
    data: result,
  });
});

const updateById = catchAsync(async (req: Request, res: Response) => {
  const result = await MediaService.updateById( req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Media updated successfully",
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await MediaService.deleteById(req.params.id as string);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Media deleted successfully",
    data: result,
  });
});

export const MediaController = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
