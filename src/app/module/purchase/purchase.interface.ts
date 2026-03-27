import { PurchaseType } from "../../../generated/prisma/enums";

export interface ICreatePurchasePayload {
  type: PurchaseType;
  price: number;
  mediaId: string;
  paymentId?: string;
}

export interface IUpdatePurchasePayload {
  type?: PurchaseType;
  price?: number;
  expiresAt?: Date;
}

export interface IPurchaseFilter {
  userId?: string;
  mediaId?: string;
  type?: PurchaseType;
  expiredOnly?: boolean;
}
