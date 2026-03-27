import { Prisma, Purchase } from "../../../generated/prisma/client.js";
import { IQueryParams } from "../../interfaces/query.interface.js";
import { IRequestUser } from "../../interfaces/requestUser.interface.js";
import { prisma } from "../../lib/prisma.js";
import { QueryBuilder } from "../../utils/queryBuilder.js";
import { purchaseFilterableFields, purchaseSearchableFields } from "./purchase.constant";
import { ICreatePurchasePayload, IUpdatePurchasePayload } from "./purchase.interface.js";
import AppError from "../../errorHelpers/AppError.js";
import status from "http-status";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { stripe } from "../../config/stripe.config.js";
import { envVars } from "../../config/env.js";

const getAll = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Purchase,
    Prisma.PurchaseWhereInput,
    Prisma.PurchaseInclude
  >(prisma.purchase, query, {
    searchableFields: purchaseSearchableFields,
    filterableFields: purchaseFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .include({
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
    })
    .paginate()
    .sort()
    .fields()
    .execute();

  return result;
};

const getById = async (id: string) => {
  const result = await prisma.purchase.findUniqueOrThrow({
    where: { id },
    include: {
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
          price: true,
        },
      },
      payment: true,
    },
  });
  return result;
};

// 🛒 Create Purchase Flow:
// 1. User creates purchase request
// 2. Service validates media exists and no duplicates
// 3. Service calculates price based on purchase type
// 4. Service creates Payment with PENDING status
// 5. Service creates Purchase linked to Payment
// 6. Client receives paymentId to initiate Stripe checkout
// 7. After Stripe completes → Webhook updates Payment + Purchase
const create = async (user: IRequestUser, payload: ICreatePurchasePayload) => {
  const { mediaId, type } = payload;

  // 1️⃣ Get media with pricing
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
  });

  if (!media) {
    throw new AppError(status.NOT_FOUND, "Media not found");
  }

  // 2️⃣ Prevent duplicate purchases (same user, same media, same type)
  const existingPurchase = await prisma.purchase.findUnique({
    where: {
      userId_mediaId_type: {
        userId: user.userId,
        mediaId,
        type,
      },
    },
  });

  if (existingPurchase) {
    throw new AppError(status.CONFLICT, "You already have this purchase");
  }

  // 3️⃣ Calculate dynamic pricing based on purchase type
  let price = 0;
  let expiresAt: Date | null = null;

  if (type === "BUY") {
    // Full price for permanent access
    price = media.price || 0;
  } else if (type === "RENT") {
    // 30% of base price, expires in 3 days
    price = (media.price || 0) * 0.3;
    expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  } else if (type === "SUBSCRIPTION") {
    // 10% of base price per month, expires in 30 days
    price = (media.price || 0) * 0.1;
    expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  // 4️⃣ Create Payment with PENDING status (before Stripe checkout)
  const payment = await prisma.payment.create({
    data: {
      amount: price,
      status: PaymentStatus.PENDING,
      // Temporary transaction ID, will be updated by Stripe
      transactionId: `temp_${user.userId}_${mediaId}_${Date.now()}`,
      userId: user.userId,
      mediaId: mediaId,
    },
  });

  // 5️⃣ Create Purchase linked to Payment
  const purchase = await prisma.purchase.create({
    data: {
      userId: user.userId,
      mediaId,
      type,
      price,
      expiresAt,
      paymentId: payment.id,
    },
    include: {
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
        },
      },
      payment: true,
    },
  });

// 6️⃣ Return purchase with paymentId for Stripe checkout
  return {
    purchase,
    paymentId: payment.id,
    message: "Purchase created. Proceed to payment",
  };
};

// 💳 PAY NOW: Create purchase + initiate Stripe checkout in one transaction
const createAndCheckout = async (
  user: IRequestUser,
  payload: ICreatePurchasePayload
) => {
  const { mediaId, type } = payload;

  // 1️⃣ Get media with pricing
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
  });

  if (!media) {
    throw new AppError(status.NOT_FOUND, "Media not found");
  }

  // 2️⃣ Prevent duplicate purchases
  const existingPurchase = await prisma.purchase.findUnique({
    where: {
      userId_mediaId_type: {
        userId: user.userId,
        mediaId,
        type,
      },
    },
  });

  if (existingPurchase) {
    throw new AppError(status.CONFLICT, "You already have this purchase");
  }

  // 3️⃣ Calculate dynamic pricing
  let price = 0;
  let expiresAt: Date | null = null;

  if (type === "BUY") {
    price = media.price || 0;
  } else if (type === "RENT") {
    price = (media.price || 0) * 0.3;
    expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  } else if (type === "SUBSCRIPTION") {
    price = (media.price || 0) * 0.1;
    expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  // 4️⃣ Create payment and purchase in transaction, then checkout
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        amount: price,
        status: PaymentStatus.PENDING,
        transactionId: `temp_${user.userId}_${mediaId}_${Date.now()}`,
        userId: user.userId,
        mediaId: mediaId,
      },
    });

    const purchase = await tx.purchase.create({
      data: {
        userId: user.userId,
        mediaId,
        type,
        price,
        expiresAt,
        paymentId: payment.id,
      },
      include: {
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
          },
        },
        payment: true,
      },
    });

    return { purchase, payment };
  });

  // 5️⃣ Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${result.purchase.media.title} - ${type}`,
            description: `${type} access to ${result.purchase.media.title}`,
          },
          unit_amount: Math.round(price * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      purchaseId: result.purchase.id,
      paymentId: result.payment.id,
      userId: user.userId,
    },
    success_url: `${envVars.FRONTEND_URL}/dashboard/purchases/success?purchase_id=${result.purchase.id}&payment_id=${result.payment.id}`,
    cancel_url: `${envVars.FRONTEND_URL}/dashboard/purchases?error=payment_cancelled`,
  });

  // 6️⃣ Return purchase with checkout URL
  return {
    purchase: result.purchase,
    paymentUrl: session.url,
    sessionId: session.id,
    message: "Checkout session created. Redirect to payment",
  };
};

// 💰 PAY LATER: Initiate payment for existing unpaid purchase
const initiatePayment = async (purchaseId: string, user: IRequestUser) => {
  const purchase = await prisma.purchase.findUniqueOrThrow({
    where: {
      id: purchaseId,
    },
    include: {
      media: true,
      payment: true,
      user: true,
    },
  });

  // 1️⃣ Verify ownership
  if (purchase.userId !== user.userId && user.role !== "ADMIN") {
    throw new AppError(status.FORBIDDEN, "You cannot pay for this purchase");
  }

  // 2️⃣ Check if purchase has payment
  if (!purchase.payment) {
    throw new AppError(status.NOT_FOUND, "Payment data not found for this purchase");
  }

  // 3️⃣ Check if already paid
  if (purchase.payment.status === PaymentStatus.SUCCESS) {
    throw new AppError(status.BAD_REQUEST, "Payment already completed for this purchase");
  }

  // 4️⃣ Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${purchase.media.title} - ${purchase.type}`,
            description: `${purchase.type} access to ${purchase.media.title}`,
          },
          unit_amount: Math.round(purchase.price * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      purchaseId: purchase.id,
      paymentId: purchase.payment.id,
      userId: user.userId,
    },
    success_url: `${envVars.FRONTEND_URL}/dashboard/purchases/success?purchase_id=${purchase.id}&payment_id=${purchase.payment.id}`,
    cancel_url: `${envVars.FRONTEND_URL}/dashboard/purchases?error=payment_cancelled`,
  });

  return {
    paymentUrl: session.url,
    sessionId: session.id,
    message: "Payment session created",
  };
};

// ⏰ Auto-cancel unpaid purchases after 30 minutes
const cancelUnpaidPurchases = async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  // Find unpaid purchases older than 30 minutes
  const unpaidPurchases = await prisma.purchase.findMany({
    where: {
      payment: {
        status: PaymentStatus.PENDING,
        createdAt: {
          lte: thirtyMinutesAgo,
        },
      },
    },
    include: {
      payment: true,
    },
  });

  if (unpaidPurchases.length === 0) {
    return { message: "No unpaid purchases to cancel", count: 0 };
  }

  const purchaseIds = unpaidPurchases.map((p) => p.id);
  const paymentIds = unpaidPurchases.map((p) => p.payment!.id);

  // Cancel in transaction
  await prisma.$transaction(async (tx) => {
    // Delete unpaid payments
    await tx.payment.deleteMany({
      where: {
        id: {
          in: paymentIds,
        },
      },
    });

    // Delete purchases (cascade delete if set)
    await tx.purchase.deleteMany({
      where: {
        id: {
          in: purchaseIds,
        },
      },
    });
  });

  return {
    message: `${unpaidPurchases.length} unpaid purchases cancelled`,
    count: unpaidPurchases.length,
  };
};

const updateById = async (
  user: IRequestUser,
  id: string,
  payload: IUpdatePurchasePayload
) => {
  // Check ownership
  const purchase = await prisma.purchase.findUnique({
    where: { id },
  });

  if (!purchase) {
    throw new AppError(status.NOT_FOUND, "Purchase not found");
  }

  if (purchase.userId !== user.userId && user.role !== "ADMIN") {
    throw new AppError(status.FORBIDDEN, "You cannot update this purchase");
  }

  const result = await prisma.purchase.update({
    where: { id },
    data: payload,
    include: {
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
        },
      },
    },
  });

  return result;
};

const deleteById = async (user: IRequestUser, id: string) => {
  // Check ownership
  const purchase = await prisma.purchase.findUnique({
    where: { id },
  });

  if (!purchase) {
    throw new AppError(status.NOT_FOUND, "Purchase not found");
  }

  if (purchase.userId !== user.userId && user.role !== "ADMIN") {
    throw new AppError(status.FORBIDDEN, "You cannot delete this purchase");
  }

  const result = await prisma.purchase.delete({
    where: { id },
  });

  return result;
};

// Check if user has access to media (checks RENT expiry)
const hasAccess = async (userId: string, mediaId: string): Promise<boolean> => {
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId,
      mediaId,
    },
  });

  if (!purchase) {
    return false;
  }

  // Check if RENT has expired
  if (purchase.type === "RENT" && purchase.expiresAt) {
    return new Date() <= purchase.expiresAt;
  }

  return true;
};

// Get user's active purchases
const getUserPurchases = async (userId: string, query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Purchase,
    Prisma.PurchaseWhereInput,
    Prisma.PurchaseInclude
  >(prisma.purchase, query, {
    searchableFields: purchaseSearchableFields,
    filterableFields: purchaseFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({ userId })
    .include({
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
        },
      },
    })
    .paginate()
    .sort()
    .fields()
    .execute();

  return result;
};

export const PurchaseService = {
  getAll,
  getById,
  create, // Pay later flow
  createAndCheckout, // Pay now flow
  initiatePayment, // Initiate checkout for unpaid purchase
  cancelUnpaidPurchases, // Auto-cancel after 30 min
  updateById,
  deleteById,
  hasAccess,
  getUserPurchases,
};
