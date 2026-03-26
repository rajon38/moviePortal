import { Request, Response } from "express";
import status from "http-status";
import { IRequestUser } from "../../interfaces/requestUser.interface.js";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { WatchListService } from "./watchList.service.js";
import { IQueryParams } from "../../interfaces/query.interface.js";

const getAll = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const query = req.query;
  const result = await WatchListService.getAll(user,query as IQueryParams);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "WatchList list retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await WatchListService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "WatchList retrieved successfully",
    data: result,
  });
});

const create = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await WatchListService.create(user, req.body);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.CREATED,
    message: "WatchList created successfully",
    data: result,
  });
});


const deleteById = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await WatchListService.deleteById(user, req.params.id as string);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "WatchList deleted successfully",
    data: result,
  });
});

const deleteAll = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await WatchListService.deleteAll(user);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "All WatchList entries deleted successfully",
    data: result,
  });
});

export const WatchListController = {
  getAll,
  getById,
  create,
  deleteById,
  deleteAll,
};
