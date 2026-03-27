import { Prisma } from "../../../generated/prisma/client";

// 🔍 Searchable fields
export const purchaseSearchableFields = [
  "media.title",
  "user.name",
  "user.email",
];

// 🏷️ Filterable fields
export const purchaseFilterableFields = [
  "type",
  "createdAt",
  "expiresAt",
];

// 📦 Include config
export const purchaseIncludeConfig: Partial<
  Record<
    keyof Prisma.PurchaseInclude,
    Prisma.PurchaseInclude[keyof Prisma.PurchaseInclude]
  >
> = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  media: {
    select: {
      id: true,
      title: true,
      type: true,
    },
  },
  payment: {
    select: {
      id: true,
      status: true,
      amount: true,
    },
  },
};
