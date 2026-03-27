import { Request, Response } from "express";
import status from "http-status";
import { IRequestUser } from "../../interfaces/requestUser.interface.js";
import { IQueryParams } from "../../interfaces/query.interface.js";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { PurchaseService } from "./purchase.service.js";

const getAll = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as IQueryParams;
  const result = await PurchaseService.getAll(query);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Purchases retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await PurchaseService.getById(req.params.id as string);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Purchase retrieved successfully",
    data: result,
  });
});

const create = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await PurchaseService.create(user, req.body);
  res.status(status.CREATED).json({
    success: true,
    message: result.message,
    data: result.purchase,
    paymentId: result.paymentId,
  });
});

const createAndCheckout = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await PurchaseService.createAndCheckout(user, req.body);
  res.status(status.CREATED).json({
    success: true,
    message: result.message,
    data: result.purchase,
    paymentUrl: result.paymentUrl,
    sessionId: result.sessionId,
  });
});

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const { purchaseId } = req.params;
  const result = await PurchaseService.initiatePayment(purchaseId as string, user);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: result.message,
    data: result,
  });
});

const cancelUnpaidPurchases = catchAsync(async (req: Request, res: Response) => {
  const result = await PurchaseService.cancelUnpaidPurchases();
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: result.message,
    data: result,
  });
});

const updateById = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await PurchaseService.updateById(
    user,
    req.params.id as string,
    req.body
  );
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Purchase updated successfully",
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const result = await PurchaseService.deleteById(
    user,
    req.params.id as string
  );
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Purchase deleted successfully",
    data: result,
  });
});

const getUserPurchases = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const query = req.query as IQueryParams;
  const result = await PurchaseService.getUserPurchases(user.userId, query);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "User purchases retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const checkAccess = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const mediaId = req.params.mediaId as string;
  const hasAccess = await PurchaseService.hasAccess(user.userId, mediaId);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Access check completed",
    data: { hasAccess },
  });
});

export const PurchaseController = {
  getAll,
  getById,
  create, // Pay later
  createAndCheckout, // Pay now
  initiatePayment, // Start checkout for unpaid
  cancelUnpaidPurchases, // Auto-cancel after 30min
  updateById,
  deleteById,
  getUserPurchases,
  checkAccess,
};
