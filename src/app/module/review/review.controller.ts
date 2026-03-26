import { Request, Response } from "express";
import status from "http-status";
import { IRequestUser } from "../../interfaces/requestUser.interface.js";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { ReviewService } from "./review.service.js";
import { IQueryParams } from "../../interfaces/query.interface.js";
import { ReviewStatus } from "../../../generated/prisma/browser.js";

const getAll = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await ReviewService.getAll(query as IQueryParams);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Review list retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Review retrieved successfully",
    data: result,
  });
});

const create = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await ReviewService.create(user, req.body);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.CREATED,
    message: "Review created successfully",
    data: result,
  });
});

const updateById = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await ReviewService.updateById(user, req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Review updated successfully",
    data: result,
  });
});

const updateReviewStatusById = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  if (user.role !== "ADMIN") {
    return sendResponse(res, {
      success: false,
      httpStatusCode: status.FORBIDDEN,
      message: "Forbidden: Only admins can update review status",
      data: null,
    });
  }

  const data = req.body as { status: ReviewStatus };
  const result = await ReviewService.updateStatusById(req.params.id as string, data.status);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Review status updated successfully",
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.deleteById(req.params.id as string);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Review deleted successfully",
    data: result,
  });
});

const toggleLike = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await ReviewService.toggleLike(user, req.params.id as string);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: result.liked ? "Review liked successfully" : "Review unliked successfully",
    data: result,
  });
});

const createComment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await ReviewService.createComment(user, req.body);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.CREATED,
    message: "Comment created successfully",
    data: result,
  });
});

const updateComment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await ReviewService.updateComment(user, req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Comment updated successfully",
    data: result,
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await ReviewService.deleteComment(user, req.params.id as string);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Comment deleted successfully",
    data: result,
  });
});

export const ReviewController = {
  getAll,
  getById,
  create,
  updateById,
  updateReviewStatusById,
  deleteById,
  toggleLike,
  createComment,
  updateComment,
  deleteComment,
};
