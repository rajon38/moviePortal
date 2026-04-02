var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import express from "express";

// src/app/routes/index.ts
import { Router as Router7 } from "express";

// src/app/module/auth/auth.route.ts
import { Router } from "express";

// src/app/shared/catchAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// src/app/module/auth/auth.service.ts
import status3 from "http-status";

// src/generated/prisma/enums.ts
var Role = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  USER: "USER"
};
var UserStatus = {
  ACTIVE: "ACTIVE",
  BLOCKED: "BLOCKED",
  DELETED: "DELETED"
};
var PurchaseType = {
  BUY: "BUY",
  RENT: "RENT",
  SUBSCRIPTION: "SUBSCRIPTION"
};
var PaymentStatus = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  CANCELED: "CANCELED",
  REFUNDED: "REFUNDED"
};

// src/app/errorHelpers/AppError.ts
var AppError = class extends Error {
  statusCode;
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var AppError_default = AppError;

// src/app/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";

// src/app/config/env.ts
import dotenv from "dotenv";
import status from "http-status";
dotenv.config();
var loadEnvVariables = () => {
  const requiredEnvVars = [
    "PORT",
    "NODE_ENV",
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRES_IN",
    "REFRESH_TOKEN_EXPIRES_IN",
    "BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN",
    "BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE",
    "EMAIL_SENDER_SMTP_HOST",
    "EMAIL_SENDER_SMTP_PORT",
    "EMAIL_SENDER_SMTP_USER",
    "EMAIL_SENDER_SMTP_PASS",
    "EMAIL_SENDER_SMTP_FROM",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CALLBACK_URL",
    "FRONTEND_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD"
  ];
  requiredEnvVars.forEach((variable) => {
    if (!process.env[variable]) {
      throw new AppError_default(status.INTERNAL_SERVER_ERROR, `Environment variable ${variable} is required but not set in .env file.`);
    }
  });
  return {
    PORT: process.env.PORT || "8001",
    NODE_ENV: process.env.NODE_ENV || "production",
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
    BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: process.env.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN,
    BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE,
    EMAIL_SENDER: {
      SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST,
      SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT,
      SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER,
      SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS,
      SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM
    },
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    FRONTEND_URL: process.env.FRONTEND_URL,
    CLOUDINARY: {
      CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      API_KEY: process.env.CLOUDINARY_API_KEY,
      API_SECRET: process.env.CLOUDINARY_API_SECRET
    },
    STRIPE: {
      SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
    },
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
  };
};
var envVars = loadEnvVariables();

// src/app/utils/email.ts
import ejs from "ejs";
import status2 from "http-status";
import nodemailer from "nodemailer";
import path from "path";
var transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  secure: true,
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS
  },
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT)
});
var sendEmail = async ({ subject, templateData, templateName, to, attachments }) => {
  try {
    const templatePath = path.resolve(process.cwd(), `src/app/templates/${templateName}.ejs`);
    const html = await ejs.renderFile(templatePath, templateData);
    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to,
      subject,
      html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType
      }))
    });
    console.log(`Email sent to ${to} : ${info.messageId}`);
  } catch (error) {
    console.log("Email Sending Error", error.message);
    throw new AppError_default(status2.INTERNAL_SERVER_ERROR, "Failed to send email");
  }
};

// src/app/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// src/generated/prisma/client.ts
import * as path2 from "path";
import { fileURLToPath } from "url";

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.5.0",
  "engineVersion": "280c870be64f457428992c43c1f6d557fab6e29e",
  "activeProvider": "postgresql",
  "inlineSchema": 'model User {\n  id                 String     @id\n  name               String\n  email              String\n  emailVerified      Boolean    @default(false)\n  role               Role       @default(USER)\n  status             UserStatus @default(ACTIVE)\n  needPasswordChange Boolean    @default(false)\n  isDeleted          Boolean    @default(false)\n  deletedAt          DateTime?\n  image              String?\n  createdAt          DateTime   @default(now())\n  updatedAt          DateTime   @updatedAt\n  sessions           Session[]\n  accounts           Account[]\n\n  reviews   Review[]\n  comments  Comment[]\n  likes     Like[]\n  watchlist Watchlist[]\n  purchases Purchase[]\n  payments  Payment[]\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Comment {\n  id      String @id @default(uuid())\n  content String\n\n  userId   String\n  reviewId String\n  parentId String?\n\n  createdAt DateTime @default(now())\n\n  user   User   @relation(fields: [userId], references: [id])\n  review Review @relation(fields: [reviewId], references: [id])\n\n  parent  Comment?  @relation("CommentToComment", fields: [parentId], references: [id])\n  replies Comment[] @relation("CommentToComment")\n}\n\nenum Role {\n  SUPER_ADMIN\n  ADMIN\n  USER\n}\n\nenum UserStatus {\n  ACTIVE\n  BLOCKED\n  DELETED\n}\n\nenum MediaType {\n  MOVIE\n  SERIES\n}\n\nenum PricingType {\n  FREE\n  PREMIUM\n}\n\nenum ReviewStatus {\n  PENDING\n  APPROVED\n  REJECTED\n}\n\nenum PurchaseType {\n  BUY\n  RENT\n  SUBSCRIPTION\n}\n\nenum PaymentStatus {\n  PENDING\n  SUCCESS\n  FAILED\n  CANCELED\n  REFUNDED\n}\n\nmodel Like {\n  id String @id @default(uuid())\n\n  userId   String\n  reviewId String\n\n  createdAt DateTime @default(now())\n\n  user   User   @relation(fields: [userId], references: [id])\n  review Review @relation(fields: [reviewId], references: [id])\n\n  @@unique([userId, reviewId]) // one like per user per review\n}\n\nmodel Media {\n  id          String      @id @default(uuid())\n  title       String\n  imageUrl    String?\n  description String\n  type        MediaType\n  releaseYear Int\n  director    String\n  cast        String[]\n  genres      String[]\n  platform    String[]\n  pricing     PricingType @default(FREE)\n  price       Float?\n  youtubeLink String?\n  isDeleted   Boolean     @default(false)\n  deletedAt   DateTime?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  reviews   Review[]\n  watchlist Watchlist[]\n  purchases Purchase[]\n  payment   Payment[]\n}\n\nmodel Payment {\n  id       String @id @default(uuid())\n  amount   Float\n  currency String @default("usd")\n\n  transactionId         String  @unique\n  stripePaymentIntentId String? @unique\n  stripeSessionId       String? @unique\n  stripeEventId         String? @unique\n\n  status        PaymentStatus @default(PENDING)\n  paymentMethod String?\n\n  invoiceUrl         String?\n  paymentGatewayData Json?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // Relations\n  userId  String\n  mediaId String?\n\n  user  User   @relation(fields: [userId], references: [id])\n  media Media? @relation(fields: [mediaId], references: [id])\n\n  // \u2705 Back relation (NO foreign key here)\n  purchase Purchase?\n\n  @@index([userId])\n  @@index([mediaId])\n  @@map("payments")\n}\n\nmodel Purchase {\n  id    String       @id @default(uuid())\n  type  PurchaseType\n  price Float\n\n  userId  String\n  mediaId String\n\n  createdAt DateTime  @default(now())\n  expiresAt DateTime?\n\n  paymentId String?  @unique\n  payment   Payment? @relation(fields: [paymentId], references: [id])\n\n  user  User  @relation(fields: [userId], references: [id])\n  media Media @relation(fields: [mediaId], references: [id])\n\n  @@unique([userId, mediaId, type])\n  @@index([userId])\n  @@index([mediaId])\n}\n\nmodel Review {\n  id      String       @id @default(uuid())\n  rating  Int // 1-5\n  content String\n  tags    String[]\n  spoiler Boolean      @default(false)\n  status  ReviewStatus @default(PENDING)\n\n  userId  String\n  mediaId String\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  user     User      @relation(fields: [userId], references: [id])\n  media    Media     @relation(fields: [mediaId], references: [id])\n  comments Comment[]\n  likes    Like[]\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel Watchlist {\n  id String @id @default(uuid())\n\n  userId  String\n  mediaId String\n\n  createdAt DateTime @default(now())\n\n  user  User  @relation(fields: [userId], references: [id])\n  media Media @relation(fields: [mediaId], references: [id])\n\n  @@unique([userId, mediaId])\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"role","kind":"enum","type":"Role"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"needPasswordChange","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"},{"name":"comments","kind":"object","type":"Comment","relationName":"CommentToUser"},{"name":"likes","kind":"object","type":"Like","relationName":"LikeToUser"},{"name":"watchlist","kind":"object","type":"Watchlist","relationName":"UserToWatchlist"},{"name":"purchases","kind":"object","type":"Purchase","relationName":"PurchaseToUser"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Comment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"content","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"reviewId","kind":"scalar","type":"String"},{"name":"parentId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"CommentToUser"},{"name":"review","kind":"object","type":"Review","relationName":"CommentToReview"},{"name":"parent","kind":"object","type":"Comment","relationName":"CommentToComment"},{"name":"replies","kind":"object","type":"Comment","relationName":"CommentToComment"}],"dbName":null},"Like":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"reviewId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"LikeToUser"},{"name":"review","kind":"object","type":"Review","relationName":"LikeToReview"}],"dbName":null},"Media":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"type","kind":"enum","type":"MediaType"},{"name":"releaseYear","kind":"scalar","type":"Int"},{"name":"director","kind":"scalar","type":"String"},{"name":"cast","kind":"scalar","type":"String"},{"name":"genres","kind":"scalar","type":"String"},{"name":"platform","kind":"scalar","type":"String"},{"name":"pricing","kind":"enum","type":"PricingType"},{"name":"price","kind":"scalar","type":"Float"},{"name":"youtubeLink","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"reviews","kind":"object","type":"Review","relationName":"MediaToReview"},{"name":"watchlist","kind":"object","type":"Watchlist","relationName":"MediaToWatchlist"},{"name":"purchases","kind":"object","type":"Purchase","relationName":"MediaToPurchase"},{"name":"payment","kind":"object","type":"Payment","relationName":"MediaToPayment"}],"dbName":null},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"currency","kind":"scalar","type":"String"},{"name":"transactionId","kind":"scalar","type":"String"},{"name":"stripePaymentIntentId","kind":"scalar","type":"String"},{"name":"stripeSessionId","kind":"scalar","type":"String"},{"name":"stripeEventId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"paymentMethod","kind":"scalar","type":"String"},{"name":"invoiceUrl","kind":"scalar","type":"String"},{"name":"paymentGatewayData","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"mediaId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"PaymentToUser"},{"name":"media","kind":"object","type":"Media","relationName":"MediaToPayment"},{"name":"purchase","kind":"object","type":"Purchase","relationName":"PaymentToPurchase"}],"dbName":"payments"},"Purchase":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"type","kind":"enum","type":"PurchaseType"},{"name":"price","kind":"scalar","type":"Float"},{"name":"userId","kind":"scalar","type":"String"},{"name":"mediaId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"paymentId","kind":"scalar","type":"String"},{"name":"payment","kind":"object","type":"Payment","relationName":"PaymentToPurchase"},{"name":"user","kind":"object","type":"User","relationName":"PurchaseToUser"},{"name":"media","kind":"object","type":"Media","relationName":"MediaToPurchase"}],"dbName":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"content","kind":"scalar","type":"String"},{"name":"tags","kind":"scalar","type":"String"},{"name":"spoiler","kind":"scalar","type":"Boolean"},{"name":"status","kind":"enum","type":"ReviewStatus"},{"name":"userId","kind":"scalar","type":"String"},{"name":"mediaId","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"media","kind":"object","type":"Media","relationName":"MediaToReview"},{"name":"comments","kind":"object","type":"Comment","relationName":"CommentToReview"},{"name":"likes","kind":"object","type":"Like","relationName":"LikeToReview"}],"dbName":null},"Watchlist":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"mediaId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"UserToWatchlist"},{"name":"media","kind":"object","type":"Media","relationName":"MediaToWatchlist"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","reviews","media","watchlist","purchase","payment","purchases","_count","review","parent","replies","comments","likes","payments","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Comment.findUnique","Comment.findUniqueOrThrow","Comment.findFirst","Comment.findFirstOrThrow","Comment.findMany","Comment.createOne","Comment.createMany","Comment.createManyAndReturn","Comment.updateOne","Comment.updateMany","Comment.updateManyAndReturn","Comment.upsertOne","Comment.deleteOne","Comment.deleteMany","Comment.groupBy","Comment.aggregate","Like.findUnique","Like.findUniqueOrThrow","Like.findFirst","Like.findFirstOrThrow","Like.findMany","Like.createOne","Like.createMany","Like.createManyAndReturn","Like.updateOne","Like.updateMany","Like.updateManyAndReturn","Like.upsertOne","Like.deleteOne","Like.deleteMany","Like.groupBy","Like.aggregate","Media.findUnique","Media.findUniqueOrThrow","Media.findFirst","Media.findFirstOrThrow","Media.findMany","Media.createOne","Media.createMany","Media.createManyAndReturn","Media.updateOne","Media.updateMany","Media.updateManyAndReturn","Media.upsertOne","Media.deleteOne","Media.deleteMany","_avg","_sum","Media.groupBy","Media.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","Purchase.findUnique","Purchase.findUniqueOrThrow","Purchase.findFirst","Purchase.findFirstOrThrow","Purchase.findMany","Purchase.createOne","Purchase.createMany","Purchase.createManyAndReturn","Purchase.updateOne","Purchase.updateMany","Purchase.updateManyAndReturn","Purchase.upsertOne","Purchase.deleteOne","Purchase.deleteMany","Purchase.groupBy","Purchase.aggregate","Review.findUnique","Review.findUniqueOrThrow","Review.findFirst","Review.findFirstOrThrow","Review.findMany","Review.createOne","Review.createMany","Review.createManyAndReturn","Review.updateOne","Review.updateMany","Review.updateManyAndReturn","Review.upsertOne","Review.deleteOne","Review.deleteMany","Review.groupBy","Review.aggregate","Watchlist.findUnique","Watchlist.findUniqueOrThrow","Watchlist.findFirst","Watchlist.findFirstOrThrow","Watchlist.findMany","Watchlist.createOne","Watchlist.createMany","Watchlist.createManyAndReturn","Watchlist.updateOne","Watchlist.updateMany","Watchlist.updateManyAndReturn","Watchlist.upsertOne","Watchlist.deleteOne","Watchlist.deleteMany","Watchlist.groupBy","Watchlist.aggregate","AND","OR","NOT","id","userId","mediaId","createdAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","rating","content","tags","spoiler","ReviewStatus","status","isDeleted","deletedAt","updatedAt","has","hasEvery","hasSome","PurchaseType","type","price","expiresAt","paymentId","amount","currency","transactionId","stripePaymentIntentId","stripeSessionId","stripeEventId","PaymentStatus","paymentMethod","invoiceUrl","paymentGatewayData","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","title","imageUrl","description","MediaType","releaseYear","director","cast","genres","platform","PricingType","pricing","youtubeLink","every","some","none","reviewId","parentId","identifier","value","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","name","email","emailVerified","Role","role","UserStatus","needPasswordChange","image","userId_reviewId","userId_mediaId_type","userId_mediaId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide","push"]'),
  graph: "tgZlsAEXBAAAigMAIAUAAIsDACAGAAD2AgAgCAAA9wIAIAsAAPgCACAQAACMAwAgEQAAjQMAIBIAAPkCACDLAQAAhwMAMMwBAAA_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_UBIuUBQAD1AgAh7gEIAJUDACHvAQEA7QIAIfABAQDtAgAh8QEBAO4CACHyAQEA7gIAIfMBAQDuAgAh9QEBAO4CACH2AQEA7gIAIfcBAACXAwAgAQAAABgAIBgGAAD2AgAgCAAA9wIAIAoAAPkCACALAAD4AgAgywEAAOwCADDMAQAAGgAQzQEAAOwCADDOAQEA7QIAIdEBQAD1AgAh4wEgAPMCACHkAUAA9AIAIeUBQAD1AgAh6gEAAO8CggIi6wEIAPICACH-AQEA7QIAIf8BAQDuAgAhgAIBAO0CACGCAgIA8AIAIYMCAQDtAgAhhAIAAMYCACCFAgAAxgIAIIYCAADGAgAgiAIAAPECiAIiiQIBAO4CACEBAAAAGgAgAQAAABQAIAoDAADSBQAgBwAA1QUAIAkAANYFACDQAQAArgMAIPEBAACuAwAg8gEAAK4DACDzAQAArgMAIPUBAACuAwAg9gEAAK4DACD3AQAArgMAIBUDAACQAwAgBwAAmAMAIAkAAJkDACDLAQAAlAMAMMwBAAAYABDNAQAAlAMAMM4BAQAAAAHPAQEA7QIAIdABAQDuAgAh0QFAAPUCACHiAQAAlgP1ASLlAUAA9QIAIe4BCACVAwAh7wEBAO0CACHwAQEAAAAB8QEBAAAAAfIBAQAAAAHzAQEAAAAB9QEBAO4CACH2AQEA7gIAIfcBAACXAwAgAwAAABgAIAEAAB0AMAIAAB4AIAEAAAALACABAAAAEAAgAQAAABQAIAEAAAAYACANAwAAkAMAIA0AAJEDACAOAACTAwAgDwAAjAMAIMsBAACSAwAwzAEAACQAEM0BAACSAwAwzgEBAO0CACHPAQEA7QIAIdEBQAD1AgAh3gEBAO0CACGNAgEA7QIAIY4CAQDuAgAhBQMAANIFACANAADTBQAgDgAA1AUAIA8AANAFACCOAgAArgMAIA0DAACQAwAgDQAAkQMAIA4AAJMDACAPAACMAwAgywEAAJIDADDMAQAAJAAQzQEAAJIDADDOAQEAAAABzwEBAO0CACHRAUAA9QIAId4BAQDtAgAhjQIBAO0CACGOAgEA7gIAIQMAAAAkACABAAAlADACAAAmACABAAAAJAAgAwAAACQAIAEAACUAMAIAACYAIAEAAAAkACAJAwAAkAMAIA0AAJEDACDLAQAAjwMAMMwBAAArABDNAQAAjwMAMM4BAQDtAgAhzwEBAO0CACHRAUAA9QIAIY0CAQDtAgAhAgMAANIFACANAADTBQAgCgMAAJADACANAACRAwAgywEAAI8DADDMAQAAKwAQzQEAAI8DADDOAQEAAAABzwEBAO0CACHRAUAA9QIAIY0CAQDtAgAhpQIAAI4DACADAAAAKwAgAQAALAAwAgAALQAgAQAAACQAIAEAAAArACADAAAAJAAgAQAAJQAwAgAAJgAgAwAAACsAIAEAACwAMAIAAC0AIAMAAAAQACABAAARADACAAASACADAAAAFAAgAQAAFQAwAgAAFgAgAwAAABgAIAEAAB0AMAIAAB4AIAEAAAADACABAAAABwAgAQAAAAsAIAEAAAAkACABAAAAKwAgAQAAABAAIAEAAAAUACABAAAAGAAgAQAAAAEAIBcEAACKAwAgBQAAiwMAIAYAAPYCACAIAAD3AgAgCwAA-AIAIBAAAIwDACARAACNAwAgEgAA-QIAIMsBAACHAwAwzAEAAD8AEM0BAACHAwAwzgEBAO0CACHRAUAA9QIAIeIBAACJA6MCIuMBIADzAgAh5AFAAPQCACHlAUAA9QIAIZ0CAQDtAgAhngIBAO0CACGfAiAA8wIAIaECAACIA6ECIqMCIADzAgAhpAIBAO4CACEKBAAAzgUAIAUAAM8FACAGAADSBAAgCAAA0wQAIAsAANQEACAQAADQBQAgEQAA0QUAIBIAANUEACDkAQAArgMAIKQCAACuAwAgAwAAAD8AIAEAAEAAMAIAAAEAIAMAAAA_ACABAABAADACAAABACADAAAAPwAgAQAAQAAwAgAAAQAgFAQAAMYFACAFAADHBQAgBgAAyAUAIAgAAMsFACALAADMBQAgEAAAyQUAIBEAAMoFACASAADNBQAgzgEBAAAAAdEBQAAAAAHiAQAAAKMCAuMBIAAAAAHkAUAAAAAB5QFAAAAAAZ0CAQAAAAGeAgEAAAABnwIgAAAAAaECAAAAoQICowIgAAAAAaQCAQAAAAEBGAAARAAgDM4BAQAAAAHRAUAAAAAB4gEAAACjAgLjASAAAAAB5AFAAAAAAeUBQAAAAAGdAgEAAAABngIBAAAAAZ8CIAAAAAGhAgAAAKECAqMCIAAAAAGkAgEAAAABARgAAEYAMAEYAABGADAUBAAA8AQAIAUAAPEEACAGAADyBAAgCAAA9QQAIAsAAPYEACAQAADzBAAgEQAA9AQAIBIAAPcEACDOAQEAqAMAIdEBQACpAwAh4gEAAO8EowIi4wEgALYDACHkAUAAuAMAIeUBQACpAwAhnQIBAKgDACGeAgEAqAMAIZ8CIAC2AwAhoQIAAO4EoQIiowIgALYDACGkAgEA1QMAIQIAAAABACAYAABJACAMzgEBAKgDACHRAUAAqQMAIeIBAADvBKMCIuMBIAC2AwAh5AFAALgDACHlAUAAqQMAIZ0CAQCoAwAhngIBAKgDACGfAiAAtgMAIaECAADuBKECIqMCIAC2AwAhpAIBANUDACECAAAAPwAgGAAASwAgAgAAAD8AIBgAAEsAIAMAAAABACAfAABEACAgAABJACABAAAAAQAgAQAAAD8AIAUMAADrBAAgJQAA7QQAICYAAOwEACDkAQAArgMAIKQCAACuAwAgD8sBAACAAwAwzAEAAFIAEM0BAACAAwAwzgEBAL0CACHRAUAAvgIAIeIBAACCA6MCIuMBIADHAgAh5AFAAMkCACHlAUAAvgIAIZ0CAQC9AgAhngIBAL0CACGfAiAAxwIAIaECAACBA6ECIqMCIADHAgAhpAIBANYCACEDAAAAPwAgAQAAUQAwJAAAUgAgAwAAAD8AIAEAAEAAMAIAAAEAIAEAAAAFACABAAAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgCQMAAOoEACDOAQEAAAABzwEBAAAAAdEBQAAAAAHlAUAAAAAB7AFAAAAAAZoCAQAAAAGbAgEAAAABnAIBAAAAAQEYAABaACAIzgEBAAAAAc8BAQAAAAHRAUAAAAAB5QFAAAAAAewBQAAAAAGaAgEAAAABmwIBAAAAAZwCAQAAAAEBGAAAXAAwARgAAFwAMAkDAADpBAAgzgEBAKgDACHPAQEAqAMAIdEBQACpAwAh5QFAAKkDACHsAUAAqQMAIZoCAQCoAwAhmwIBANUDACGcAgEA1QMAIQIAAAAFACAYAABfACAIzgEBAKgDACHPAQEAqAMAIdEBQACpAwAh5QFAAKkDACHsAUAAqQMAIZoCAQCoAwAhmwIBANUDACGcAgEA1QMAIQIAAAADACAYAABhACACAAAAAwAgGAAAYQAgAwAAAAUAIB8AAFoAICAAAF8AIAEAAAAFACABAAAAAwAgBQwAAOYEACAlAADoBAAgJgAA5wQAIJsCAACuAwAgnAIAAK4DACALywEAAP8CADDMAQAAaAAQzQEAAP8CADDOAQEAvQIAIc8BAQC9AgAh0QFAAL4CACHlAUAAvgIAIewBQAC-AgAhmgIBAL0CACGbAgEA1gIAIZwCAQDWAgAhAwAAAAMAIAEAAGcAMCQAAGgAIAMAAAADACABAAAEADACAAAFACABAAAACQAgAQAAAAkAIAMAAAAHACABAAAIADACAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIA4DAADlBAAgzgEBAAAAAc8BAQAAAAHRAUAAAAAB5QFAAAAAAZECAQAAAAGSAgEAAAABkwIBAAAAAZQCAQAAAAGVAgEAAAABlgJAAAAAAZcCQAAAAAGYAgEAAAABmQIBAAAAAQEYAABwACANzgEBAAAAAc8BAQAAAAHRAUAAAAAB5QFAAAAAAZECAQAAAAGSAgEAAAABkwIBAAAAAZQCAQAAAAGVAgEAAAABlgJAAAAAAZcCQAAAAAGYAgEAAAABmQIBAAAAAQEYAAByADABGAAAcgAwDgMAAOQEACDOAQEAqAMAIc8BAQCoAwAh0QFAAKkDACHlAUAAqQMAIZECAQCoAwAhkgIBAKgDACGTAgEA1QMAIZQCAQDVAwAhlQIBANUDACGWAkAAuAMAIZcCQAC4AwAhmAIBANUDACGZAgEA1QMAIQIAAAAJACAYAAB1ACANzgEBAKgDACHPAQEAqAMAIdEBQACpAwAh5QFAAKkDACGRAgEAqAMAIZICAQCoAwAhkwIBANUDACGUAgEA1QMAIZUCAQDVAwAhlgJAALgDACGXAkAAuAMAIZgCAQDVAwAhmQIBANUDACECAAAABwAgGAAAdwAgAgAAAAcAIBgAAHcAIAMAAAAJACAfAABwACAgAAB1ACABAAAACQAgAQAAAAcAIAoMAADhBAAgJQAA4wQAICYAAOIEACCTAgAArgMAIJQCAACuAwAglQIAAK4DACCWAgAArgMAIJcCAACuAwAgmAIAAK4DACCZAgAArgMAIBDLAQAA_gIAMMwBAAB-ABDNAQAA_gIAMM4BAQC9AgAhzwEBAL0CACHRAUAAvgIAIeUBQAC-AgAhkQIBAL0CACGSAgEAvQIAIZMCAQDWAgAhlAIBANYCACGVAgEA1gIAIZYCQADJAgAhlwJAAMkCACGYAgEA1gIAIZkCAQDWAgAhAwAAAAcAIAEAAH0AMCQAAH4AIAMAAAAHACABAAAIADACAAAJACAJywEAAP0CADDMAQAAhAEAEM0BAAD9AgAwzgEBAAAAAdEBQAD1AgAh5QFAAPUCACHsAUAA9QIAIY8CAQDtAgAhkAIBAO0CACEBAAAAgQEAIAEAAACBAQAgCcsBAAD9AgAwzAEAAIQBABDNAQAA_QIAMM4BAQDtAgAh0QFAAPUCACHlAUAA9QIAIewBQAD1AgAhjwIBAO0CACGQAgEA7QIAIQADAAAAhAEAIAEAAIUBADACAACBAQAgAwAAAIQBACABAACFAQAwAgAAgQEAIAMAAACEAQAgAQAAhQEAMAIAAIEBACAGzgEBAAAAAdEBQAAAAAHlAUAAAAAB7AFAAAAAAY8CAQAAAAGQAgEAAAABARgAAIkBACAGzgEBAAAAAdEBQAAAAAHlAUAAAAAB7AFAAAAAAY8CAQAAAAGQAgEAAAABARgAAIsBADABGAAAiwEAMAbOAQEAqAMAIdEBQACpAwAh5QFAAKkDACHsAUAAqQMAIY8CAQCoAwAhkAIBAKgDACECAAAAgQEAIBgAAI4BACAGzgEBAKgDACHRAUAAqQMAIeUBQACpAwAh7AFAAKkDACGPAgEAqAMAIZACAQCoAwAhAgAAAIQBACAYAACQAQAgAgAAAIQBACAYAACQAQAgAwAAAIEBACAfAACJAQAgIAAAjgEAIAEAAACBAQAgAQAAAIQBACADDAAA3gQAICUAAOAEACAmAADfBAAgCcsBAAD8AgAwzAEAAJcBABDNAQAA_AIAMM4BAQC9AgAh0QFAAL4CACHlAUAAvgIAIewBQAC-AgAhjwIBAL0CACGQAgEAvQIAIQMAAACEAQAgAQAAlgEAMCQAAJcBACADAAAAhAEAIAEAAIUBADACAACBAQAgAQAAACYAIAEAAAAmACADAAAAJAAgAQAAJQAwAgAAJgAgAwAAACQAIAEAACUAMAIAACYAIAMAAAAkACABAAAlADACAAAmACAKAwAA5AMAIA0AAOUDACAOAADoAwAgDwAA5gMAIM4BAQAAAAHPAQEAAAAB0QFAAAAAAd4BAQAAAAGNAgEAAAABjgIBAAAAAQEYAACfAQAgBs4BAQAAAAHPAQEAAAAB0QFAAAAAAd4BAQAAAAGNAgEAAAABjgIBAAAAAQEYAAChAQAwARgAAKEBADABAAAAJAAgCgMAANcDACANAADiAwAgDgAA2AMAIA8AANkDACDOAQEAqAMAIc8BAQCoAwAh0QFAAKkDACHeAQEAqAMAIY0CAQCoAwAhjgIBANUDACECAAAAJgAgGAAApQEAIAbOAQEAqAMAIc8BAQCoAwAh0QFAAKkDACHeAQEAqAMAIY0CAQCoAwAhjgIBANUDACECAAAAJAAgGAAApwEAIAIAAAAkACAYAACnAQAgAQAAACQAIAMAAAAmACAfAACfAQAgIAAApQEAIAEAAAAmACABAAAAJAAgBAwAANsEACAlAADdBAAgJgAA3AQAII4CAACuAwAgCcsBAAD7AgAwzAEAAK8BABDNAQAA-wIAMM4BAQC9AgAhzwEBAL0CACHRAUAAvgIAId4BAQC9AgAhjQIBAL0CACGOAgEA1gIAIQMAAAAkACABAACuAQAwJAAArwEAIAMAAAAkACABAAAlADACAAAmACABAAAALQAgAQAAAC0AIAMAAAArACABAAAsADACAAAtACADAAAAKwAgAQAALAAwAgAALQAgAwAAACsAIAEAACwAMAIAAC0AIAYDAADKAwAgDQAA2gQAIM4BAQAAAAHPAQEAAAAB0QFAAAAAAY0CAQAAAAEBGAAAtwEAIATOAQEAAAABzwEBAAAAAdEBQAAAAAGNAgEAAAABARgAALkBADABGAAAuQEAMAYDAADIAwAgDQAA2QQAIM4BAQCoAwAhzwEBAKgDACHRAUAAqQMAIY0CAQCoAwAhAgAAAC0AIBgAALwBACAEzgEBAKgDACHPAQEAqAMAIdEBQACpAwAhjQIBAKgDACECAAAAKwAgGAAAvgEAIAIAAAArACAYAAC-AQAgAwAAAC0AIB8AALcBACAgAAC8AQAgAQAAAC0AIAEAAAArACADDAAA1gQAICUAANgEACAmAADXBAAgB8sBAAD6AgAwzAEAAMUBABDNAQAA-gIAMM4BAQC9AgAhzwEBAL0CACHRAUAAvgIAIY0CAQC9AgAhAwAAACsAIAEAAMQBADAkAADFAQAgAwAAACsAIAEAACwAMAIAAC0AIBgGAAD2AgAgCAAA9wIAIAoAAPkCACALAAD4AgAgywEAAOwCADDMAQAAGgAQzQEAAOwCADDOAQEAAAAB0QFAAPUCACHjASAA8wIAIeQBQAD0AgAh5QFAAPUCACHqAQAA7wKCAiLrAQgA8gIAIf4BAQDtAgAh_wEBAO4CACGAAgEA7QIAIYICAgDwAgAhgwIBAO0CACGEAgAAxgIAIIUCAADGAgAghgIAAMYCACCIAgAA8QKIAiKJAgEA7gIAIQEAAADIAQAgAQAAAMgBACAIBgAA0gQAIAgAANMEACAKAADVBAAgCwAA1AQAIOQBAACuAwAg6wEAAK4DACD_AQAArgMAIIkCAACuAwAgAwAAABoAIAEAAMsBADACAADIAQAgAwAAABoAIAEAAMsBADACAADIAQAgAwAAABoAIAEAAMsBADACAADIAQAgFQYAAM4EACAIAADPBAAgCgAA0QQAIAsAANAEACDOAQEAAAAB0QFAAAAAAeMBIAAAAAHkAUAAAAAB5QFAAAAAAeoBAAAAggIC6wEIAAAAAf4BAQAAAAH_AQEAAAABgAIBAAAAAYICAgAAAAGDAgEAAAABhAIAAMsEACCFAgAAzAQAIIYCAADNBAAgiAIAAACIAgKJAgEAAAABARgAAM8BACARzgEBAAAAAdEBQAAAAAHjASAAAAAB5AFAAAAAAeUBQAAAAAHqAQAAAIICAusBCAAAAAH-AQEAAAAB_wEBAAAAAYACAQAAAAGCAgIAAAABgwIBAAAAAYQCAADLBAAghQIAAMwEACCGAgAAzQQAIIgCAAAAiAICiQIBAAAAAQEYAADRAQAwARgAANEBADAVBgAAlwQAIAgAAJgEACAKAACaBAAgCwAAmQQAIM4BAQCoAwAh0QFAAKkDACHjASAAtgMAIeQBQAC4AwAh5QFAAKkDACHqAQAAkQSCAiLrAQgAlgQAIf4BAQCoAwAh_wEBANUDACGAAgEAqAMAIYICAgC0AwAhgwIBAKgDACGEAgAAkgQAIIUCAACTBAAghgIAAJQEACCIAgAAlQSIAiKJAgEA1QMAIQIAAADIAQAgGAAA1AEAIBHOAQEAqAMAIdEBQACpAwAh4wEgALYDACHkAUAAuAMAIeUBQACpAwAh6gEAAJEEggIi6wEIAJYEACH-AQEAqAMAIf8BAQDVAwAhgAIBAKgDACGCAgIAtAMAIYMCAQCoAwAhhAIAAJIEACCFAgAAkwQAIIYCAACUBAAgiAIAAJUEiAIiiQIBANUDACECAAAAGgAgGAAA1gEAIAIAAAAaACAYAADWAQAgAwAAAMgBACAfAADPAQAgIAAA1AEAIAEAAADIAQAgAQAAABoAIAkMAACMBAAgJQAAjwQAICYAAI4EACCHAQAAjQQAIIgBAACQBAAg5AEAAK4DACDrAQAArgMAIP8BAACuAwAgiQIAAK4DACAUywEAAOICADDMAQAA3QEAEM0BAADiAgAwzgEBAL0CACHRAUAAvgIAIeMBIADHAgAh5AFAAMkCACHlAUAAvgIAIeoBAADjAoICIusBCADlAgAh_gEBAL0CACH_AQEA1gIAIYACAQC9AgAhggICAMUCACGDAgEAvQIAIYQCAADGAgAghQIAAMYCACCGAgAAxgIAIIgCAADkAogCIokCAQDWAgAhAwAAABoAIAEAANwBADAkAADdAQAgAwAAABoAIAEAAMsBADACAADIAQAgAQAAAB4AIAEAAAAeACADAAAAGAAgAQAAHQAwAgAAHgAgAwAAABgAIAEAAB0AMAIAAB4AIAMAAAAYACABAAAdADACAAAeACASAwAAiQQAIAcAAIoEACAJAACLBAAgzgEBAAAAAc8BAQAAAAHQAQEAAAAB0QFAAAAAAeIBAAAA9QEC5QFAAAAAAe4BCAAAAAHvAQEAAAAB8AEBAAAAAfEBAQAAAAHyAQEAAAAB8wEBAAAAAfUBAQAAAAH2AQEAAAAB9wGAAAAAAQEYAADlAQAgD84BAQAAAAHPAQEAAAAB0AEBAAAAAdEBQAAAAAHiAQAAAPUBAuUBQAAAAAHuAQgAAAAB7wEBAAAAAfABAQAAAAHxAQEAAAAB8gEBAAAAAfMBAQAAAAH1AQEAAAAB9gEBAAAAAfcBgAAAAAEBGAAA5wEAMAEYAADnAQAwAQAAABoAIBIDAACBBAAgBwAAggQAIAkAAIMEACDOAQEAqAMAIc8BAQCoAwAh0AEBANUDACHRAUAAqQMAIeIBAACABPUBIuUBQACpAwAh7gEIAPQDACHvAQEAqAMAIfABAQCoAwAh8QEBANUDACHyAQEA1QMAIfMBAQDVAwAh9QEBANUDACH2AQEA1QMAIfcBgAAAAAECAAAAHgAgGAAA6wEAIA_OAQEAqAMAIc8BAQCoAwAh0AEBANUDACHRAUAAqQMAIeIBAACABPUBIuUBQACpAwAh7gEIAPQDACHvAQEAqAMAIfABAQCoAwAh8QEBANUDACHyAQEA1QMAIfMBAQDVAwAh9QEBANUDACH2AQEA1QMAIfcBgAAAAAECAAAAGAAgGAAA7QEAIAIAAAAYACAYAADtAQAgAQAAABoAIAMAAAAeACAfAADlAQAgIAAA6wEAIAEAAAAeACABAAAAGAAgDAwAAPsDACAlAAD-AwAgJgAA_QMAIIcBAAD8AwAgiAEAAP8DACDQAQAArgMAIPEBAACuAwAg8gEAAK4DACDzAQAArgMAIPUBAACuAwAg9gEAAK4DACD3AQAArgMAIBLLAQAA3AIAMMwBAAD1AQAQzQEAANwCADDOAQEAvQIAIc8BAQC9AgAh0AEBANYCACHRAUAAvgIAIeIBAADdAvUBIuUBQAC-AgAh7gEIANUCACHvAQEAvQIAIfABAQC9AgAh8QEBANYCACHyAQEA1gIAIfMBAQDWAgAh9QEBANYCACH2AQEA1gIAIfcBAADeAgAgAwAAABgAIAEAAPQBADAkAAD1AQAgAwAAABgAIAEAAB0AMAIAAB4AIAEAAAAWACABAAAAFgAgAwAAABQAIAEAABUAMAIAABYAIAMAAAAUACABAAAVADACAAAWACADAAAAFAAgAQAAFQAwAgAAFgAgCwMAAPkDACAHAAD6AwAgCgAA-AMAIM4BAQAAAAHPAQEAAAAB0AEBAAAAAdEBQAAAAAHqAQAAAOoBAusBCAAAAAHsAUAAAAAB7QEBAAAAAQEYAAD9AQAgCM4BAQAAAAHPAQEAAAAB0AEBAAAAAdEBQAAAAAHqAQAAAOoBAusBCAAAAAHsAUAAAAAB7QEBAAAAAQEYAAD_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-AEBAAAAAfkBAQAAAAH6AQEAAAAB-wGAAAAAAfwBgAAAAAH9AYAAAAABDNIBgAAAAAHVAYAAAAAB1gGAAAAAAdcBgAAAAAHYAYAAAAAB2QGAAAAAAfgBAQAAAAH5AQEAAAAB-gEBAAAAAfsBgAAAAAH8AYAAAAAB_QGAAAAAAQcMAADAAgAgJQAA4QIAICYAAOECACDSAQAAAPUBAtMBAAAA9QEI1AEAAAD1AQjZAQAA4AL1ASIE0gEAAAD1AQLTAQAAAPUBCNQBAAAA9QEI2QEAAOEC9QEiFMsBAADiAgAwzAEAAN0BABDNAQAA4gIAMM4BAQC9AgAh0QFAAL4CACHjASAAxwIAIeQBQADJAgAh5QFAAL4CACHqAQAA4wKCAiLrAQgA5QIAIf4BAQC9AgAh_wEBANYCACGAAgEAvQIAIYICAgDFAgAhgwIBAL0CACGEAgAAxgIAIIUCAADGAgAghgIAAMYCACCIAgAA5AKIAiKJAgEA1gIAIQcMAADAAgAgJQAA6wIAICYAAOsCACDSAQAAAIICAtMBAAAAggII1AEAAACCAgjZAQAA6gKCAiIHDAAAwAIAICUAAOkCACAmAADpAgAg0gEAAACIAgLTAQAAAIgCCNQBAAAAiAII2QEAAOgCiAIiDQwAAMsCACAlAADnAgAgJgAA5wIAIIcBAADnAgAgiAEAAOcCACDSAQgAAAAB0wEIAAAABdQBCAAAAAXVAQgAAAAB1gEIAAAAAdcBCAAAAAHYAQgAAAAB2QEIAOYCACENDAAAywIAICUAAOcCACAmAADnAgAghwEAAOcCACCIAQAA5wIAINIBCAAAAAHTAQgAAAAF1AEIAAAABdUBCAAAAAHWAQgAAAAB1wEIAAAAAdgBCAAAAAHZAQgA5gIAIQjSAQgAAAAB0wEIAAAABdQBCAAAAAXVAQgAAAAB1gEIAAAAAdcBCAAAAAHYAQgAAAAB2QEIAOcCACEHDAAAwAIAICUAAOkCACAmAADpAgAg0gEAAACIAgLTAQAAAIgCCNQBAAAAiAII2QEAAOgCiAIiBNIBAAAAiAIC0wEAAACIAgjUAQAAAIgCCNkBAADpAogCIgcMAADAAgAgJQAA6wIAICYAAOsCACDSAQAAAIICAtMBAAAAggII1AEAAACCAgjZAQAA6gKCAiIE0gEAAACCAgLTAQAAAIICCNQBAAAAggII2QEAAOsCggIiGAYAAPYCACAIAAD3AgAgCgAA-QIAIAsAAPgCACDLAQAA7AIAMMwBAAAaABDNAQAA7AIAMM4BAQDtAgAh0QFAAPUCACHjASAA8wIAIeQBQAD0AgAh5QFAAPUCACHqAQAA7wKCAiLrAQgA8gIAIf4BAQDtAgAh_wEBAO4CACGAAgEA7QIAIYICAgDwAgAhgwIBAO0CACGEAgAAxgIAIIUCAADGAgAghgIAAMYCACCIAgAA8QKIAiKJAgEA7gIAIQvSAQEAAAAB0wEBAAAABNQBAQAAAATVAQEAAAAB1gEBAAAAAdcBAQAAAAHYAQEAAAAB2QEBAMMCACHaAQEAAAAB2wEBAAAAAdwBAQAAAAEL0gEBAAAAAdMBAQAAAAXUAQEAAAAF1QEBAAAAAdYBAQAAAAHXAQEAAAAB2AEBAAAAAdkBAQDYAgAh2gEBAAAAAdsBAQAAAAHcAQEAAAABBNIBAAAAggIC0wEAAACCAgjUAQAAAIICCNkBAADrAoICIgjSAQIAAAAB0wECAAAABNQBAgAAAATVAQIAAAAB1gECAAAAAdcBAgAAAAHYAQIAAAAB2QECAMACACEE0gEAAACIAgLTAQAAAIgCCNQBAAAAiAII2QEAAOkCiAIiCNIBCAAAAAHTAQgAAAAF1AEIAAAABdUBCAAAAAHWAQgAAAAB1wEIAAAAAdgBCAAAAAHZAQgA5wIAIQLSASAAAAAB2QEgANACACEI0gFAAAAAAdMBQAAAAAXUAUAAAAAF1QFAAAAAAdYBQAAAAAHXAUAAAAAB2AFAAAAAAdkBQADMAgAhCNIBQAAAAAHTAUAAAAAE1AFAAAAABNUBQAAAAAHWAUAAAAAB1wFAAAAAAdgBQAAAAAHZAUAAwQIAIQOKAgAACwAgiwIAAAsAIIwCAAALACADigIAABAAIIsCAAAQACCMAgAAEAAgA4oCAAAUACCLAgAAFAAgjAIAABQAIAOKAgAAGAAgiwIAABgAIIwCAAAYACAHywEAAPoCADDMAQAAxQEAEM0BAAD6AgAwzgEBAL0CACHPAQEAvQIAIdEBQAC-AgAhjQIBAL0CACEJywEAAPsCADDMAQAArwEAEM0BAAD7AgAwzgEBAL0CACHPAQEAvQIAIdEBQAC-AgAh3gEBAL0CACGNAgEAvQIAIY4CAQDWAgAhCcsBAAD8AgAwzAEAAJcBABDNAQAA_AIAMM4BAQC9AgAh0QFAAL4CACHlAUAAvgIAIewBQAC-AgAhjwIBAL0CACGQAgEAvQIAIQnLAQAA_QIAMMwBAACEAQAQzQEAAP0CADDOAQEA7QIAIdEBQAD1AgAh5QFAAPUCACHsAUAA9QIAIY8CAQDtAgAhkAIBAO0CACEQywEAAP4CADDMAQAAfgAQzQEAAP4CADDOAQEAvQIAIc8BAQC9AgAh0QFAAL4CACHlAUAAvgIAIZECAQC9AgAhkgIBAL0CACGTAgEA1gIAIZQCAQDWAgAhlQIBANYCACGWAkAAyQIAIZcCQADJAgAhmAIBANYCACGZAgEA1gIAIQvLAQAA_wIAMMwBAABoABDNAQAA_wIAMM4BAQC9AgAhzwEBAL0CACHRAUAAvgIAIeUBQAC-AgAh7AFAAL4CACGaAgEAvQIAIZsCAQDWAgAhnAIBANYCACEPywEAAIADADDMAQAAUgAQzQEAAIADADDOAQEAvQIAIdEBQAC-AgAh4gEAAIIDowIi4wEgAMcCACHkAUAAyQIAIeUBQAC-AgAhnQIBAL0CACGeAgEAvQIAIZ8CIADHAgAhoQIAAIEDoQIiowIgAMcCACGkAgEA1gIAIQcMAADAAgAgJQAAhgMAICYAAIYDACDSAQAAAKECAtMBAAAAoQII1AEAAAChAgjZAQAAhQOhAiIHDAAAwAIAICUAAIQDACAmAACEAwAg0gEAAACjAgLTAQAAAKMCCNQBAAAAowII2QEAAIMDowIiBwwAAMACACAlAACEAwAgJgAAhAMAINIBAAAAowIC0wEAAACjAgjUAQAAAKMCCNkBAACDA6MCIgTSAQAAAKMCAtMBAAAAowII1AEAAACjAgjZAQAAhAOjAiIHDAAAwAIAICUAAIYDACAmAACGAwAg0gEAAAChAgLTAQAAAKECCNQBAAAAoQII2QEAAIUDoQIiBNIBAAAAoQIC0wEAAAChAgjUAQAAAKECCNkBAACGA6ECIhcEAACKAwAgBQAAiwMAIAYAAPYCACAIAAD3AgAgCwAA-AIAIBAAAIwDACARAACNAwAgEgAA-QIAIMsBAACHAwAwzAEAAD8AEM0BAACHAwAwzgEBAO0CACHRAUAA9QIAIeIBAACJA6MCIuMBIADzAgAh5AFAAPQCACHlAUAA9QIAIZ0CAQDtAgAhngIBAO0CACGfAiAA8wIAIaECAACIA6ECIqMCIADzAgAhpAIBAO4CACEE0gEAAAChAgLTAQAAAKECCNQBAAAAoQII2QEAAIYDoQIiBNIBAAAAowIC0wEAAACjAgjUAQAAAKMCCNkBAACEA6MCIgOKAgAAAwAgiwIAAAMAIIwCAAADACADigIAAAcAIIsCAAAHACCMAgAABwAgA4oCAAAkACCLAgAAJAAgjAIAACQAIAOKAgAAKwAgiwIAACsAIIwCAAArACACzwEBAAAAAY0CAQAAAAEJAwAAkAMAIA0AAJEDACDLAQAAjwMAMMwBAAArABDNAQAAjwMAMM4BAQDtAgAhzwEBAO0CACHRAUAA9QIAIY0CAQDtAgAhGQQAAIoDACAFAACLAwAgBgAA9gIAIAgAAPcCACALAAD4AgAgEAAAjAMAIBEAAI0DACASAAD5AgAgywEAAIcDADDMAQAAPwAQzQEAAIcDADDOAQEA7QIAIdEBQAD1AgAh4gEAAIkDowIi4wEgAPMCACHkAUAA9AIAIeUBQAD1AgAhnQIBAO0CACGeAgEA7QIAIZ8CIADzAgAhoQIAAIgDoQIiowIgAPMCACGkAgEA7gIAIagCAAA_ACCpAgAAPwAgFQMAAJADACAHAACeAwAgEAAAjAMAIBEAAI0DACDLAQAAoQMAMMwBAAALABDNAQAAoQMAMM4BAQDtAgAhzwEBAO0CACHQAQEA7QIAIdEBQAD1AgAh3QECAPACACHeAQEA7QIAId8BAADGAgAg4AEgAPMCACHiAQAAogPiASLjASAA8wIAIeQBQAD0AgAh5QFAAPUCACGoAgAACwAgqQIAAAsAIA0DAACQAwAgDQAAkQMAIA4AAJMDACAPAACMAwAgywEAAJIDADDMAQAAJAAQzQEAAJIDADDOAQEA7QIAIc8BAQDtAgAh0QFAAPUCACHeAQEA7QIAIY0CAQDtAgAhjgIBAO4CACEPAwAAkAMAIA0AAJEDACAOAACTAwAgDwAAjAMAIMsBAACSAwAwzAEAACQAEM0BAACSAwAwzgEBAO0CACHPAQEA7QIAIdEBQAD1AgAh3gEBAO0CACGNAgEA7QIAIY4CAQDuAgAhqAIAACQAIKkCAAAkACAVAwAAkAMAIAcAAJgDACAJAACZAwAgywEAAJQDADDMAQAAGAAQzQEAAJQDADDOAQEA7QIAIc8BAQDtAgAh0AEBAO4CACHRAUAA9QIAIeIBAACWA_UBIuUBQAD1AgAh7gEIAJUDACHvAQEA7QIAIfABAQDtAgAh8QEBAO4CACHyAQEA7gIAIfMBAQDuAgAh9QEBAO4CACH2AQEA7gIAIfcBAACXAwAgCNIBCAAAAAHTAQgAAAAE1AEIAAAABNUBCAAAAAHWAQgAAAAB1wEIAAAAAdgBCAAAAAHZAQgA0gIAIQTSAQAAAPUBAtMBAAAA9QEI1AEAAAD1AQjZAQAA4QL1ASIM0gGAAAAAAdUBgAAAAAHWAYAAAAAB1wGAAAAAAdgBgAAAAAHZAYAAAAAB-AEBAAAAAfkBAQAAAAH6AQEAAAAB-wGAAAAAAfwBgAAAAAH9AYAAAAABGgYAAPYCACAIAAD3AgAgCgAA-QIAIAsAAPgCACDLAQAA7AIAMMwBAAAaABDNAQAA7AIAMM4BAQDtAgAh0QFAAPUCACHjASAA8wIAIeQBQAD0AgAh5QFAAPUCACHqAQAA7wKCAiLrAQgA8gIAIf4BAQDtAgAh_wEBAO4CACGAAgEA7QIAIYICAgDwAgAhgwIBAO0CACGEAgAAxgIAIIUCAADGAgAghgIAAMYCACCIAgAA8QKIAiKJAgEA7gIAIagCAAAaACCpAgAAGgAgEAMAAJADACAHAACeAwAgCgAAnQMAIMsBAACbAwAwzAEAABQAEM0BAACbAwAwzgEBAO0CACHPAQEA7QIAIdABAQDtAgAh0QFAAPUCACHqAQAAnAPqASLrAQgAlQMAIewBQAD0AgAh7QEBAO4CACGoAgAAFAAgqQIAABQAIAPPAQEAAAAB0AEBAAAAAeoBAAAA6gECDgMAAJADACAHAACeAwAgCgAAnQMAIMsBAACbAwAwzAEAABQAEM0BAACbAwAwzgEBAO0CACHPAQEA7QIAIdABAQDtAgAh0QFAAPUCACHqAQAAnAPqASLrAQgAlQMAIewBQAD0AgAh7QEBAO4CACEE0gEAAADqAQLTAQAAAOoBCNQBAAAA6gEI2QEAANsC6gEiFwMAAJADACAHAACYAwAgCQAAmQMAIMsBAACUAwAwzAEAABgAEM0BAACUAwAwzgEBAO0CACHPAQEA7QIAIdABAQDuAgAh0QFAAPUCACHiAQAAlgP1ASLlAUAA9QIAIe4BCACVAwAh7wEBAO0CACHwAQEA7QIAIfEBAQDuAgAh8gEBAO4CACHzAQEA7gIAIfUBAQDuAgAh9gEBAO4CACH3AQAAlwMAIKgCAAAYACCpAgAAGAAgGgYAAPYCACAIAAD3AgAgCgAA-QIAIAsAAPgCACDLAQAA7AIAMMwBAAAaABDNAQAA7AIAMM4BAQDtAgAh0QFAAPUCACHjASAA8wIAIeQBQAD0AgAh5QFAAPUCACHqAQAA7wKCAiLrAQgA8gIAIf4BAQDtAgAh_wEBAO4CACGAAgEA7QIAIYICAgDwAgAhgwIBAO0CACGEAgAAxgIAIIUCAADGAgAghgIAAMYCACCIAgAA8QKIAiKJAgEA7gIAIagCAAAaACCpAgAAGgAgAs8BAQAAAAHQAQEAAAABCQMAAJADACAHAACeAwAgywEAAKADADDMAQAAEAAQzQEAAKADADDOAQEA7QIAIc8BAQDtAgAh0AEBAO0CACHRAUAA9QIAIRMDAACQAwAgBwAAngMAIBAAAIwDACARAACNAwAgywEAAKEDADDMAQAACwAQzQEAAKEDADDOAQEA7QIAIc8BAQDtAgAh0AEBAO0CACHRAUAA9QIAId0BAgDwAgAh3gEBAO0CACHfAQAAxgIAIOABIADzAgAh4gEAAKID4gEi4wEgAPMCACHkAUAA9AIAIeUBQAD1AgAhBNIBAAAA4gEC0wEAAADiAQjUAQAAAOIBCNkBAADOAuIBIhEDAACQAwAgywEAAKMDADDMAQAABwAQzQEAAKMDADDOAQEA7QIAIc8BAQDtAgAh0QFAAPUCACHlAUAA9QIAIZECAQDtAgAhkgIBAO0CACGTAgEA7gIAIZQCAQDuAgAhlQIBAO4CACGWAkAA9AIAIZcCQAD0AgAhmAIBAO4CACGZAgEA7gIAIQwDAACQAwAgywEAAKQDADDMAQAAAwAQzQEAAKQDADDOAQEA7QIAIc8BAQDtAgAh0QFAAPUCACHlAUAA9QIAIewBQAD1AgAhmgIBAO0CACGbAgEA7gIAIZwCAQDuAgAhAAAAAa0CAQAAAAEBrQJAAAAAAQUfAACvBgAgIAAAtQYAIKoCAACwBgAgqwIAALQGACCwAgAAAQAgBR8AAK0GACAgAACyBgAgqgIAAK4GACCrAgAAsQYAILACAADIAQAgAx8AAK8GACCqAgAAsAYAILACAAABACADHwAArQYAIKoCAACuBgAgsAIAAMgBACAAAAAAAAAFrQICAAAAAbMCAgAAAAG0AgIAAAABtQICAAAAAbYCAgAAAAECrQIBAAAABLcCAQAAAAUBrQIgAAAAAQGtAgAAAOIBAgGtAkAAAAABBR8AAI4GACAgAACrBgAgqgIAAI8GACCrAgAAqgYAILACAAABACAFHwAAjAYAICAAAKgGACCqAgAAjQYAIKsCAACnBgAgsAIAAMgBACALHwAAywMAMCAAANADADCqAgAAzAMAMKsCAADNAwAwrAIAAM4DACCtAgAAzwMAMK4CAADPAwAwrwIAAM8DADCwAgAAzwMAMLECAADRAwAwsgIAANIDADALHwAAvQMAMCAAAMIDADCqAgAAvgMAMKsCAAC_AwAwrAIAAMADACCtAgAAwQMAMK4CAADBAwAwrwIAAMEDADCwAgAAwQMAMLECAADDAwAwsgIAAMQDADAEAwAAygMAIM4BAQAAAAHPAQEAAAAB0QFAAAAAAQIAAAAtACAfAADJAwAgAwAAAC0AIB8AAMkDACAgAADHAwAgARgAAKYGADAKAwAAkAMAIA0AAJEDACDLAQAAjwMAMMwBAAArABDNAQAAjwMAMM4BAQAAAAHPAQEA7QIAIdEBQAD1AgAhjQIBAO0CACGlAgAAjgMAIAIAAAAtACAYAADHAwAgAgAAAMUDACAYAADGAwAgB8sBAADEAwAwzAEAAMUDABDNAQAAxAMAMM4BAQDtAgAhzwEBAO0CACHRAUAA9QIAIY0CAQDtAgAhB8sBAADEAwAwzAEAAMUDABDNAQAAxAMAMM4BAQDtAgAhzwEBAO0CACHRAUAA9QIAIY0CAQDtAgAhA84BAQCoAwAhzwEBAKgDACHRAUAAqQMAIQQDAADIAwAgzgEBAKgDACHPAQEAqAMAIdEBQACpAwAhBR8AAKEGACAgAACkBgAgqgIAAKIGACCrAgAAowYAILACAAABACAEAwAAygMAIM4BAQAAAAHPAQEAAAAB0QFAAAAAAQMfAAChBgAgqgIAAKIGACCwAgAAAQAgCAMAAOQDACAOAADoAwAgDwAA5gMAIM4BAQAAAAHPAQEAAAAB0QFAAAAAAd4BAQAAAAGOAgEAAAABAgAAACYAIB8AAOcDACADAAAAJgAgHwAA5wMAICAAANYDACABGAAAoAYAMA0DAACQAwAgDQAAkQMAIA4AAJMDACAPAACMAwAgywEAAJIDADDMAQAAJAAQzQEAAJIDADDOAQEAAAABzwEBAO0CACHRAUAA9QIAId4BAQDtAgAhjQIBAO0CACGOAgEA7gIAIQIAAAAmACAYAADWAwAgAgAAANMDACAYAADUAwAgCcsBAADSAwAwzAEAANMDABDNAQAA0gMAMM4BAQDtAgAhzwEBAO0CACHRAUAA9QIAId4BAQDtAgAhjQIBAO0CACGOAgEA7gIAIQnLAQAA0gMAMMwBAADTAwAQzQEAANIDADDOAQEA7QIAIc8BAQDtAgAh0QFAAPUCACHeAQEA7QIAIY0CAQDtAgAhjgIBAO4CACEFzgEBAKgDACHPAQEAqAMAIdEBQACpAwAh3gEBAKgDACGOAgEA1QMAIQGtAgEAAAABCAMAANcDACAOAADYAwAgDwAA2QMAIM4BAQCoAwAhzwEBAKgDACHRAUAAqQMAId4BAQCoAwAhjgIBANUDACEFHwAAlAYAICAAAJ4GACCqAgAAlQYAIKsCAACdBgAgsAIAAAEAIAcfAACQBgAgIAAAmwYAIKoCAACRBgAgqwIAAJoGACCuAgAAJAAgrwIAACQAILACAAAmACALHwAA2gMAMCAAAN4DADCqAgAA2wMAMKsCAADcAwAwrAIAAN0DACCtAgAAzwMAMK4CAADPAwAwrwIAAM8DADCwAgAAzwMAMLECAADfAwAwsgIAANIDADAIAwAA5AMAIA0AAOUDACAPAADmAwAgzgEBAAAAAc8BAQAAAAHRAUAAAAAB3gEBAAAAAY0CAQAAAAECAAAAJgAgHwAA4wMAIAMAAAAmACAfAADjAwAgIAAA4QMAIAEYAACZBgAwAgAAACYAIBgAAOEDACACAAAA0wMAIBgAAOADACAFzgEBAKgDACHPAQEAqAMAIdEBQACpAwAh3gEBAKgDACGNAgEAqAMAIQgDAADXAwAgDQAA4gMAIA8AANkDACDOAQEAqAMAIc8BAQCoAwAh0QFAAKkDACHeAQEAqAMAIY0CAQCoAwAhBR8AAJIGACAgAACXBgAgqgIAAJMGACCrAgAAlgYAILACAAANACAIAwAA5AMAIA0AAOUDACAPAADmAwAgzgEBAAAAAc8BAQAAAAHRAUAAAAAB3gEBAAAAAY0CAQAAAAEDHwAAlAYAIKoCAACVBgAgsAIAAAEAIAMfAACSBgAgqgIAAJMGACCwAgAADQAgBB8AANoDADCqAgAA2wMAMKwCAADdAwAgsAIAAM8DADAIAwAA5AMAIA4AAOgDACAPAADmAwAgzgEBAAAAAc8BAQAAAAHRAUAAAAAB3gEBAAAAAY4CAQAAAAEDHwAAkAYAIKoCAACRBgAgsAIAACYAIAGtAgEAAAAEAx8AAI4GACCqAgAAjwYAILACAAABACADHwAAjAYAIKoCAACNBgAgsAIAAMgBACAEHwAAywMAMKoCAADMAwAwrAIAAM4DACCwAgAAzwMAMAQfAAC9AwAwqgIAAL4DADCsAgAAwAMAILACAADBAwAwAAAAAAABrQIAAADqAQIFrQIIAAAAAbMCCAAAAAG0AggAAAABtQIIAAAAAbYCCAAAAAEHHwAAgQYAICAAAIoGACCqAgAAggYAIKsCAACJBgAgrgIAABgAIK8CAAAYACCwAgAAHgAgBR8AAP8FACAgAACHBgAgqgIAAIAGACCrAgAAhgYAILACAAABACAFHwAA_QUAICAAAIQGACCqAgAA_gUAIKsCAACDBgAgsAIAAMgBACADHwAAgQYAIKoCAACCBgAgsAIAAB4AIAMfAAD_BQAgqgIAAIAGACCwAgAAAQAgAx8AAP0FACCqAgAA_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_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_LAQAAxgQAMMwBAADHBAAQzQEAAMYEADDOAQEA7QIAIc8BAQDtAgAh0AEBAO0CACHRAUAA9QIAId0BAgDwAgAh3gEBAO0CACHfAQAAxgIAIOABIADzAgAh4gEAAKID4gEi4wEgAPMCACHkAUAA9AIAIeUBQAD1AgAhD8sBAADGBAAwzAEAAMcEABDNAQAAxgQAMM4BAQDtAgAhzwEBAO0CACHQAQEA7QIAIdEBQAD1AgAh3QECAPACACHeAQEA7QIAId8BAADGAgAg4AEgAPMCACHiAQAAogPiASLjASAA8wIAIeQBQAD0AgAh5QFAAPUCACELzgEBAKgDACHPAQEAqAMAIdEBQACpAwAh3QECALQDACHeAQEAqAMAId8BAAC1AwAg4AEgALYDACHiAQAAtwPiASLjASAAtgMAIeQBQAC4AwAh5QFAAKkDACEOAwAAuQMAIBAAALsDACARAAC8AwAgzgEBAKgDACHPAQEAqAMAIdEBQACpAwAh3QECALQDACHeAQEAqAMAId8BAAC1AwAg4AEgALYDACHiAQAAtwPiASLjASAAtgMAIeQBQAC4AwAh5QFAAKkDACEOAwAA6gMAIBAAAOwDACARAADtAwAgzgEBAAAAAc8BAQAAAAHRAUAAAAAB3QECAAAAAd4BAQAAAAHfAQAA6QMAIOABIAAAAAHiAQAAAOIBAuMBIAAAAAHkAUAAAAAB5QFAAAAAAQGtAgEAAAAEAa0CAQAAAAQBrQIBAAAABAQfAAC_BAAwqgIAAMAEADCsAgAAwgQAILACAADDBAAwBB8AALMEADCqAgAAtAQAMKwCAAC2BAAgsAIAALcEADAEHwAApwQAMKoCAACoBAAwrAIAAKoEACCwAgAAqwQAMAQfAACbBAAwqgIAAJwEADCsAgAAngQAILACAACfBAAwAAAAAAAAAAUfAADqBQAgIAAA7QUAIKoCAADrBQAgqwIAAOwFACCwAgAADQAgAx8AAOoFACCqAgAA6wUAILACAAANACAAAAAAAAAAAAAFHwAA5QUAICAAAOgFACCqAgAA5gUAIKsCAADnBQAgsAIAAAEAIAMfAADlBQAgqgIAAOYFACCwAgAAAQAgAAAABR8AAOAFACAgAADjBQAgqgIAAOEFACCrAgAA4gUAILACAAABACADHwAA4AUAIKoCAADhBQAgsAIAAAEAIAAAAAGtAgAAAKECAgGtAgAAAKMCAgsfAAC6BQAwIAAAvwUAMKoCAAC7BQAwqwIAALwFADCsAgAAvQUAIK0CAAC-BQAwrgIAAL4FADCvAgAAvgUAMLACAAC-BQAwsQIAAMAFADCyAgAAwQUAMAsfAACuBQAwIAAAswUAMKoCAACvBQAwqwIAALAFADCsAgAAsQUAIK0CAACyBQAwrgIAALIFADCvAgAAsgUAMLACAACyBQAwsQIAALQFADCyAgAAtQUAMAsfAAClBQAwIAAAqQUAMKoCAACmBQAwqwIAAKcFADCsAgAAqAUAIK0CAADDBAAwrgIAAMMEADCvAgAAwwQAMLACAADDBAAwsQIAAKoFADCyAgAAxgQAMAsfAACcBQAwIAAAoAUAMKoCAACdBQAwqwIAAJ4FADCsAgAAnwUAIK0CAADPAwAwrgIAAM8DADCvAgAAzwMAMLACAADPAwAwsQIAAKEFADCyAgAA0gMAMAsfAACTBQAwIAAAlwUAMKoCAACUBQAwqwIAAJUFADCsAgAAlgUAIK0CAADBAwAwrgIAAMEDADCvAgAAwQMAMLACAADBAwAwsQIAAJgFADCyAgAAxAMAMAsfAACKBQAwIAAAjgUAMKoCAACLBQAwqwIAAIwFADCsAgAAjQUAIK0CAAC3BAAwrgIAALcEADCvAgAAtwQAMLACAAC3BAAwsQIAAI8FADCyAgAAugQAMAsfAACBBQAwIAAAhQUAMKoCAACCBQAwqwIAAIMFADCsAgAAhAUAIK0CAACrBAAwrgIAAKsEADCvAgAAqwQAMLACAACrBAAwsQIAAIYFADCyAgAArgQAMAsfAAD4BAAwIAAA_AQAMKoCAAD5BAAwqwIAAPoEADCsAgAA-wQAIK0CAACfBAAwrgIAAJ8EADCvAgAAnwQAMLACAACfBAAwsQIAAP0EADCyAgAAogQAMBAHAACKBAAgCQAAiwQAIM4BAQAAAAHQAQEAAAAB0QFAAAAAAeIBAAAA9QEC5QFAAAAAAe4BCAAAAAHvAQEAAAAB8AEBAAAAAfEBAQAAAAHyAQEAAAAB8wEBAAAAAfUBAQAAAAH2AQEAAAAB9wGAAAAAAQIAAAAeACAfAACABQAgAwAAAB4AIB8AAIAFACAgAAD_BAAgARgAAN8FADACAAAAHgAgGAAA_wQAIAIAAACjBAAgGAAA_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_AQAArgMAIIkCAACuAwAgBQMAANIFACAHAADVBQAgCgAA1wUAIOwBAACuAwAg7QEAAK4DACAKAwAA0gUAIAcAANUFACAJAADWBQAg0AEAAK4DACDxAQAArgMAIPIBAACuAwAg8wEAAK4DACD1AQAArgMAIPYBAACuAwAg9wEAAK4DACAHzgEBAAAAAdEBQAAAAAHlAUAAAAAB7AFAAAAAAZoCAQAAAAGbAgEAAAABnAIBAAAAAQzOAQEAAAAB0QFAAAAAAeUBQAAAAAGRAgEAAAABkgIBAAAAAZMCAQAAAAGUAgEAAAABlQIBAAAAAZYCQAAAAAGXAkAAAAABmAIBAAAAAZkCAQAAAAELzgEBAAAAAdABAQAAAAHRAUAAAAAB3QECAAAAAd4BAQAAAAHfAQAA6QMAIOABIAAAAAHiAQAAAOIBAuMBIAAAAAHkAUAAAAAB5QFAAAAAAQXOAQEAAAAB0QFAAAAAAd4BAQAAAAGNAgEAAAABjgIBAAAAAQPOAQEAAAAB0QFAAAAAAY0CAQAAAAEDzgEBAAAAAdABAQAAAAHRAUAAAAABB84BAQAAAAHQAQEAAAAB0QFAAAAAAeoBAAAA6gEC6wEIAAAAAewBQAAAAAHtAQEAAAABDs4BAQAAAAHQAQEAAAAB0QFAAAAAAeIBAAAA9QEC5QFAAAAAAe4BCAAAAAHvAQEAAAAB8AEBAAAAAfEBAQAAAAHyAQEAAAAB8wEBAAAAAfUBAQAAAAH2AQEAAAAB9wGAAAAAARMFAADHBQAgBgAAyAUAIAgAAMsFACALAADMBQAgEAAAyQUAIBEAAMoFACASAADNBQAgzgEBAAAAAdEBQAAAAAHiAQAAAKMCAuMBIAAAAAHkAUAAAAAB5QFAAAAAAZ0CAQAAAAGeAgEAAAABnwIgAAAAAaECAAAAoQICowIgAAAAAaQCAQAAAAECAAAAAQAgHwAA4AUAIAMAAAA_ACAfAADgBQAgIAAA5AUAIBUAAAA_ACAFAADxBAAgBgAA8gQAIAgAAPUEACALAAD2BAAgEAAA8wQAIBEAAPQEACASAAD3BAAgGAAA5AUAIM4BAQCoAwAh0QFAAKkDACHiAQAA7wSjAiLjASAAtgMAIeQBQAC4AwAh5QFAAKkDACGdAgEAqAMAIZ4CAQCoAwAhnwIgALYDACGhAgAA7gShAiKjAiAAtgMAIaQCAQDVAwAhEwUAAPEEACAGAADyBAAgCAAA9QQAIAsAAPYEACAQAADzBAAgEQAA9AQAIBIAAPcEACDOAQEAqAMAIdEBQACpAwAh4gEAAO8EowIi4wEgALYDACHkAUAAuAMAIeUBQACpAwAhnQIBAKgDACGeAgEAqAMAIZ8CIAC2AwAhoQIAAO4EoQIiowIgALYDACGkAgEA1QMAIRMEAADGBQAgBgAAyAUAIAgAAMsFACALAADMBQAgEAAAyQUAIBEAAMoFACASAADNBQAgzgEBAAAAAdEBQAAAAAHiAQAAAKMCAuMBIAAAAAHkAUAAAAAB5QFAAAAAAZ0CAQAAAAGeAgEAAAABnwIgAAAAAaECAAAAoQICowIgAAAAAaQCAQAAAAECAAAAAQAgHwAA5QUAIAMAAAA_ACAfAADlBQAgIAAA6QUAIBUAAAA_ACAEAADwBAAgBgAA8gQAIAgAAPUEACALAAD2BAAgEAAA8wQAIBEAAPQEACASAAD3BAAgGAAA6QUAIM4BAQCoAwAh0QFAAKkDACHiAQAA7wSjAiLjASAAtgMAIeQBQAC4AwAh5QFAAKkDACGdAgEAqAMAIZ4CAQCoAwAhnwIgALYDACGhAgAA7gShAiKjAiAAtgMAIaQCAQDVAwAhEwQAAPAEACAGAADyBAAgCAAA9QQAIAsAAPYEACAQAADzBAAgEQAA9AQAIBIAAPcEACDOAQEAqAMAIdEBQACpAwAh4gEAAO8EowIi4wEgALYDACHkAUAAuAMAIeUBQACpAwAhnQIBAKgDACGeAgEAqAMAIZ8CIAC2AwAhoQIAAO4EoQIiowIgALYDACGkAgEA1QMAIQ8DAADqAwAgBwAA6wMAIBAAAOwDACDOAQEAAAABzwEBAAAAAdABAQAAAAHRAUAAAAAB3QECAAAAAd4BAQAAAAHfAQAA6QMAIOABIAAAAAHiAQAAAOIBAuMBIAAAAAHkAUAAAAAB5QFAAAAAAQIAAAANACAfAADqBQAgAwAAAAsAIB8AAOoFACAgAADuBQAgEQAAAAsAIAMAALkDACAHAAC6AwAgEAAAuwMAIBgAAO4FACDOAQEAqAMAIc8BAQCoAwAh0AEBAKgDACHRAUAAqQMAId0BAgC0AwAh3gEBAKgDACHfAQAAtQMAIOABIAC2AwAh4gEAALcD4gEi4wEgALYDACHkAUAAuAMAIeUBQACpAwAhDwMAALkDACAHAAC6AwAgEAAAuwMAIM4BAQCoAwAhzwEBAKgDACHQAQEAqAMAIdEBQACpAwAh3QECALQDACHeAQEAqAMAId8BAAC1AwAg4AEgALYDACHiAQAAtwPiASLjASAAtgMAIeQBQAC4AwAh5QFAAKkDACELzgEBAAAAAc8BAQAAAAHRAUAAAAAB3QECAAAAAd4BAQAAAAHfAQAA6QMAIOABIAAAAAHiAQAAAOIBAuMBIAAAAAHkAUAAAAAB5QFAAAAAAQPOAQEAAAABzwEBAAAAAdEBQAAAAAEHzgEBAAAAAc8BAQAAAAHRAUAAAAAB6gEAAADqAQLrAQgAAAAB7AFAAAAAAe0BAQAAAAEOzgEBAAAAAc8BAQAAAAHRAUAAAAAB4gEAAAD1AQLlAUAAAAAB7gEIAAAAAe8BAQAAAAHwAQEAAAAB8QEBAAAAAfIBAQAAAAHzAQEAAAAB9QEBAAAAAfYBAQAAAAH3AYAAAAABFAYAAM4EACAIAADPBAAgCwAA0AQAIM4BAQAAAAHRAUAAAAAB4wEgAAAAAeQBQAAAAAHlAUAAAAAB6gEAAACCAgLrAQgAAAAB_gEBAAAAAf8BAQAAAAGAAgEAAAABggICAAAAAYMCAQAAAAGEAgAAywQAIIUCAADMBAAghgIAAM0EACCIAgAAAIgCAokCAQAAAAECAAAAyAEAIB8AAPMFACATBAAAxgUAIAUAAMcFACAGAADIBQAgCAAAywUAIAsAAMwFACAQAADJBQAgEQAAygUAIM4BAQAAAAHRAUAAAAAB4gEAAACjAgLjASAAAAAB5AFAAAAAAeUBQAAAAAGdAgEAAAABngIBAAAAAZ8CIAAAAAGhAgAAAKECAqMCIAAAAAGkAgEAAAABAgAAAAEAIB8AAPUFACADAAAAGgAgHwAA8wUAICAAAPkFACAWAAAAGgAgBgAAlwQAIAgAAJgEACALAACZBAAgGAAA-QUAIM4BAQCoAwAh0QFAAKkDACHjASAAtgMAIeQBQAC4AwAh5QFAAKkDACHqAQAAkQSCAiLrAQgAlgQAIf4BAQCoAwAh_wEBANUDACGAAgEAqAMAIYICAgC0AwAhgwIBAKgDACGEAgAAkgQAIIUCAACTBAAghgIAAJQEACCIAgAAlQSIAiKJAgEA1QMAIRQGAACXBAAgCAAAmAQAIAsAAJkEACDOAQEAqAMAIdEBQACpAwAh4wEgALYDACHkAUAAuAMAIeUBQACpAwAh6gEAAJEEggIi6wEIAJYEACH-AQEAqAMAIf8BAQDVAwAhgAIBAKgDACGCAgIAtAMAIYMCAQCoAwAhhAIAAJIEACCFAgAAkwQAIIYCAACUBAAgiAIAAJUEiAIiiQIBANUDACEDAAAAPwAgHwAA9QUAICAAAPwFACAVAAAAPwAgBAAA8AQAIAUAAPEEACAGAADyBAAgCAAA9QQAIAsAAPYEACAQAADzBAAgEQAA9AQAIBgAAPwFACDOAQEAqAMAIdEBQACpAwAh4gEAAO8EowIi4wEgALYDACHkAUAAuAMAIeUBQACpAwAhnQIBAKgDACGeAgEAqAMAIZ8CIAC2AwAhoQIAAO4EoQIiowIgALYDACGkAgEA1QMAIRMEAADwBAAgBQAA8QQAIAYAAPIEACAIAAD1BAAgCwAA9gQAIBAAAPMEACARAAD0BAAgzgEBAKgDACHRAUAAqQMAIeIBAADvBKMCIuMBIAC2AwAh5AFAALgDACHlAUAAqQMAIZ0CAQCoAwAhngIBAKgDACGfAiAAtgMAIaECAADuBKECIqMCIAC2AwAhpAIBANUDACEUBgAAzgQAIAgAAM8EACAKAADRBAAgzgEBAAAAAdEBQAAAAAHjASAAAAAB5AFAAAAAAeUBQAAAAAHqAQAAAIICAusBCAAAAAH-AQEAAAAB_wEBAAAAAYACAQAAAAGCAgIAAAABgwIBAAAAAYQCAADLBAAghQIAAMwEACCGAgAAzQQAIIgCAAAAiAICiQIBAAAAAQIAAADIAQAgHwAA_QUAIBMEAADGBQAgBQAAxwUAIAYAAMgFACAIAADLBQAgEAAAyQUAIBEAAMoFACASAADNBQAgzgEBAAAAAdEBQAAAAAHiAQAAAKMCAuMBIAAAAAHkAUAAAAAB5QFAAAAAAZ0CAQAAAAGeAgEAAAABnwIgAAAAAaECAAAAoQICowIgAAAAAaQCAQAAAAECAAAAAQAgHwAA_wUAIBEDAACJBAAgBwAAigQAIM4BAQAAAAHPAQEAAAAB0AEBAAAAAdEBQAAAAAHiAQAAAPUBAuUBQAAAAAHuAQgAAAAB7wEBAAAAAfABAQAAAAHxAQEAAAAB8gEBAAAAAfMBAQAAAAH1AQEAAAAB9gEBAAAAAfcBgAAAAAECAAAAHgAgHwAAgQYAIAMAAAAaACAfAAD9BQAgIAAAhQYAIBYAAAAaACAGAACXBAAgCAAAmAQAIAoAAJoEACAYAACFBgAgzgEBAKgDACHRAUAAqQMAIeMBIAC2AwAh5AFAALgDACHlAUAAqQMAIeoBAACRBIICIusBCACWBAAh_gEBAKgDACH_AQEA1QMAIYACAQCoAwAhggICALQDACGDAgEAqAMAIYQCAACSBAAghQIAAJMEACCGAgAAlAQAIIgCAACVBIgCIokCAQDVAwAhFAYAAJcEACAIAACYBAAgCgAAmgQAIM4BAQCoAwAh0QFAAKkDACHjASAAtgMAIeQBQAC4AwAh5QFAAKkDACHqAQAAkQSCAiLrAQgAlgQAIf4BAQCoAwAh_wEBANUDACGAAgEAqAMAIYICAgC0AwAhgwIBAKgDACGEAgAAkgQAIIUCAACTBAAghgIAAJQEACCIAgAAlQSIAiKJAgEA1QMAIQMAAAA_ACAfAAD_BQAgIAAAiAYAIBUAAAA_ACAEAADwBAAgBQAA8QQAIAYAAPIEACAIAAD1BAAgEAAA8wQAIBEAAPQEACASAAD3BAAgGAAAiAYAIM4BAQCoAwAh0QFAAKkDACHiAQAA7wSjAiLjASAAtgMAIeQBQAC4AwAh5QFAAKkDACGdAgEAqAMAIZ4CAQCoAwAhnwIgALYDACGhAgAA7gShAiKjAiAAtgMAIaQCAQDVAwAhEwQAAPAEACAFAADxBAAgBgAA8gQAIAgAAPUEACAQAADzBAAgEQAA9AQAIBIAAPcEACDOAQEAqAMAIdEBQACpAwAh4gEAAO8EowIi4wEgALYDACHkAUAAuAMAIeUBQACpAwAhnQIBAKgDACGeAgEAqAMAIZ8CIAC2AwAhoQIAAO4EoQIiowIgALYDACGkAgEA1QMAIQMAAAAYACAfAACBBgAgIAAAiwYAIBMAAAAYACADAACBBAAgBwAAggQAIBgAAIsGACDOAQEAqAMAIc8BAQCoAwAh0AEBANUDACHRAUAAqQMAIeIBAACABPUBIuUBQACpAwAh7gEIAPQDACHvAQEAqAMAIfABAQCoAwAh8QEBANUDACHyAQEA1QMAIfMBAQDVAwAh9QEBANUDACH2AQEA1QMAIfcBgAAAAAERAwAAgQQAIAcAAIIEACDOAQEAqAMAIc8BAQCoAwAh0AEBANUDACHRAUAAqQMAIeIBAACABPUBIuUBQACpAwAh7gEIAPQDACHvAQEAqAMAIfABAQCoAwAh8QEBANUDACHyAQEA1QMAIfMBAQDVAwAh9QEBANUDACH2AQEA1QMAIfcBgAAAAAEUCAAAzwQAIAoAANEEACALAADQBAAgzgEBAAAAAdEBQAAAAAHjASAAAAAB5AFAAAAAAeUBQAAAAAHqAQAAAIICAusBCAAAAAH-AQEAAAAB_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_gEBAKgDACH_AQEA1QMAIYACAQCoAwAhggICALQDACGDAgEAqAMAIYQCAACSBAAghQIAAJMEACCGAgAAlAQAIIgCAACVBIgCIokCAQDVAwAhAwAAAD8AIB8AAI4GACAgAACsBgAgFQAAAD8AIAQAAPAEACAFAADxBAAgCAAA9QQAIAsAAPYEACAQAADzBAAgEQAA9AQAIBIAAPcEACAYAACsBgAgzgEBAKgDACHRAUAAqQMAIeIBAADvBKMCIuMBIAC2AwAh5AFAALgDACHlAUAAqQMAIZ0CAQCoAwAhngIBAKgDACGfAiAAtgMAIaECAADuBKECIqMCIAC2AwAhpAIBANUDACETBAAA8AQAIAUAAPEEACAIAAD1BAAgCwAA9gQAIBAAAPMEACARAAD0BAAgEgAA9wQAIM4BAQCoAwAh0QFAAKkDACHiAQAA7wSjAiLjASAAtgMAIeQBQAC4AwAh5QFAAKkDACGdAgEAqAMAIZ4CAQCoAwAhnwIgALYDACGhAgAA7gShAiKjAiAAtgMAIaQCAQDVAwAhFAYAAM4EACAKAADRBAAgCwAA0AQAIM4BAQAAAAHRAUAAAAAB4wEgAAAAAeQBQAAAAAHlAUAAAAAB6gEAAACCAgLrAQgAAAAB_gEBAAAAAf8BAQAAAAGAAgEAAAABggICAAAAAYMCAQAAAAGEAgAAywQAIIUCAADMBAAghgIAAM0EACCIAgAAAIgCAokCAQAAAAECAAAAyAEAIB8AAK0GACATBAAAxgUAIAUAAMcFACAGAADIBQAgCwAAzAUAIBAAAMkFACARAADKBQAgEgAAzQUAIM4BAQAAAAHRAUAAAAAB4gEAAACjAgLjASAAAAAB5AFAAAAAAeUBQAAAAAGdAgEAAAABngIBAAAAAZ8CIAAAAAGhAgAAAKECAqMCIAAAAAGkAgEAAAABAgAAAAEAIB8AAK8GACADAAAAGgAgHwAArQYAICAAALMGACAWAAAAGgAgBgAAlwQAIAoAAJoEACALAACZBAAgGAAAswYAIM4BAQCoAwAh0QFAAKkDACHjASAAtgMAIeQBQAC4AwAh5QFAAKkDACHqAQAAkQSCAiLrAQgAlgQAIf4BAQCoAwAh_wEBANUDACGAAgEAqAMAIYICAgC0AwAhgwIBAKgDACGEAgAAkgQAIIUCAACTBAAghgIAAJQEACCIAgAAlQSIAiKJAgEA1QMAIRQGAACXBAAgCgAAmgQAIAsAAJkEACDOAQEAqAMAIdEBQACpAwAh4wEgALYDACHkAUAAuAMAIeUBQACpAwAh6gEAAJEEggIi6wEIAJYEACH-AQEAqAMAIf8BAQDVAwAhgAIBAKgDACGCAgIAtAMAIYMCAQCoAwAhhAIAAJIEACCFAgAAkwQAIIYCAACUBAAgiAIAAJUEiAIiiQIBANUDACEDAAAAPwAgHwAArwYAICAAALYGACAVAAAAPwAgBAAA8AQAIAUAAPEEACAGAADyBAAgCwAA9gQAIBAAAPMEACARAAD0BAAgEgAA9wQAIBgAALYGACDOAQEAqAMAIdEBQACpAwAh4gEAAO8EowIi4wEgALYDACHkAUAAuAMAIeUBQACpAwAhnQIBAKgDACGeAgEAqAMAIZ8CIAC2AwAhoQIAAO4EoQIiowIgALYDACGkAgEA1QMAIRMEAADwBAAgBQAA8QQAIAYAAPIEACALAAD2BAAgEAAA8wQAIBEAAPQEACASAAD3BAAgzgEBAKgDACHRAUAAqQMAIeIBAADvBKMCIuMBIAC2AwAh5AFAALgDACHlAUAAqQMAIZ0CAQCoAwAhngIBAKgDACGfAiAAtgMAIaECAADuBKECIqMCIAC2AwAhpAIBANUDACEJBAYCBQoDBg4ECDMGCzQHDAAOEDEKETIMEjUIAQMAAQEDAAEFAwABBwAFDAANECcKES4MBQYPBAgTBgofCAsXBwwACQIDAAEHAAUDAwABBwAFChkIAwMAAQcbBQkcBwQGIAAIIQAKIwALIgAFAwABDAALDQAEDigKDykKAQ8qAAIDAAENAAQCEC8AETAACAQ2AAU3AAY4AAg7AAs8ABA5ABE6ABI9AAAAAAMMABMlABQmABUAAAADDAATJQAUJgAVAQMAAQEDAAEDDAAaJQAbJgAcAAAAAwwAGiUAGyYAHAEDAAEBAwABAwwAISUAIiYAIwAAAAMMACElACImACMAAAADDAApJQAqJgArAAAAAwwAKSUAKiYAKwMDAAENAAQOpAEKAwMAAQ0ABA6qAQoDDAAwJQAxJgAyAAAAAwwAMCUAMSYAMgIDAAENAAQCAwABDQAEAwwANyUAOCYAOQAAAAMMADclADgmADkAAAUMAD4lAEEmAEKHAQA_iAEAQAAAAAAABQwAPiUAQSYAQocBAD-IAQBAAgMAAQfqAQUCAwABB_ABBQUMAEclAEomAEuHAQBIiAEASQAAAAAABQwARyUASiYAS4cBAEiIAQBJAwMAAQcABQqCAggDAwABBwAFCogCCAUMAFAlAFMmAFSHAQBRiAEAUgAAAAAABQwAUCUAUyYAVIcBAFGIAQBSAgMAAQcABQIDAAEHAAUFDABZJQBcJgBdhwEAWogBAFsAAAAAAAUMAFklAFwmAF2HAQBaiAEAWwIDAAEHAAUCAwABBwAFAwwAYiUAYyYAZAAAAAMMAGIlAGMmAGQTAgEUPgEVQQEWQgEXQwEZRQEaRw8bSBAcSgEdTA8eTREhTgEiTwEjUA8nUxIoVBYpVQIqVgIrVwIsWAItWQIuWwIvXQ8wXhcxYAIyYg8zYxg0ZAI1ZQI2Zg83aRk4ah05awM6bAM7bQM8bgM9bwM-cQM_cw9AdB5BdgNCeA9DeR9EegNFewNGfA9HfyBIgAEkSYIBJUqDASVLhgElTIcBJU2IASVOigElT4wBD1CNASZRjwElUpEBD1OSASdUkwElVZQBJVaVAQ9XmAEoWJkBLFmaAQpamwEKW5wBClydAQpdngEKXqABCl-iAQ9gowEtYaYBCmKoAQ9jqQEuZKsBCmWsAQpmrQEPZ7ABL2ixATNpsgEMarMBDGu0AQxstQEMbbYBDG64AQxvugEPcLsBNHG9AQxyvwEPc8ABNXTBAQx1wgEMdsMBD3fGATZ4xwE6eckBBXrKAQV7zAEFfM0BBX3OAQV-0AEFf9IBD4AB0wE7gQHVAQWCAdcBD4MB2AE8hAHZAQWFAdoBBYYB2wEPiQHeAT2KAd8BQ4sB4AEIjAHhAQiNAeIBCI4B4wEIjwHkAQiQAeYBCJEB6AEPkgHpAUSTAewBCJQB7gEPlQHvAUWWAfEBCJcB8gEImAHzAQ-ZAfYBRpoB9wFMmwH4AQecAfkBB50B-gEHngH7AQefAfwBB6AB_gEHoQGAAg-iAYECTaMBhAIHpAGGAg-lAYcCTqYBiQIHpwGKAgeoAYsCD6kBjgJPqgGPAlWrAZACBKwBkQIErQGSAgSuAZMCBK8BlAIEsAGWAgSxAZgCD7IBmQJWswGbAgS0AZ0CD7UBngJXtgGfAgS3AaACBLgBoQIPuQGkAli6AaUCXrsBpgIGvAGnAga9AagCBr4BqQIGvwGqAgbAAawCBsEBrgIPwgGvAl_DAbECBsQBswIPxQG0AmDGAbUCBscBtgIGyAG3Ag_JAboCYcoBuwJl"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AnyNull: () => AnyNull2,
  CommentScalarFieldEnum: () => CommentScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  JsonNullValueFilter: () => JsonNullValueFilter,
  LikeScalarFieldEnum: () => LikeScalarFieldEnum,
  MediaScalarFieldEnum: () => MediaScalarFieldEnum,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullableJsonNullValueInput: () => NullableJsonNullValueInput,
  NullsOrder: () => NullsOrder,
  PaymentScalarFieldEnum: () => PaymentScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  PurchaseScalarFieldEnum: () => PurchaseScalarFieldEnum,
  QueryMode: () => QueryMode,
  ReviewScalarFieldEnum: () => ReviewScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  WatchlistScalarFieldEnum: () => WatchlistScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.5.0",
  engine: "280c870be64f457428992c43c1f6d557fab6e29e"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  Comment: "Comment",
  Like: "Like",
  Media: "Media",
  Payment: "Payment",
  Purchase: "Purchase",
  Review: "Review",
  Watchlist: "Watchlist"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  emailVerified: "emailVerified",
  role: "role",
  status: "status",
  needPasswordChange: "needPasswordChange",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  image: "image",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var CommentScalarFieldEnum = {
  id: "id",
  content: "content",
  userId: "userId",
  reviewId: "reviewId",
  parentId: "parentId",
  createdAt: "createdAt"
};
var LikeScalarFieldEnum = {
  id: "id",
  userId: "userId",
  reviewId: "reviewId",
  createdAt: "createdAt"
};
var MediaScalarFieldEnum = {
  id: "id",
  title: "title",
  imageUrl: "imageUrl",
  description: "description",
  type: "type",
  releaseYear: "releaseYear",
  director: "director",
  cast: "cast",
  genres: "genres",
  platform: "platform",
  pricing: "pricing",
  price: "price",
  youtubeLink: "youtubeLink",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var PaymentScalarFieldEnum = {
  id: "id",
  amount: "amount",
  currency: "currency",
  transactionId: "transactionId",
  stripePaymentIntentId: "stripePaymentIntentId",
  stripeSessionId: "stripeSessionId",
  stripeEventId: "stripeEventId",
  status: "status",
  paymentMethod: "paymentMethod",
  invoiceUrl: "invoiceUrl",
  paymentGatewayData: "paymentGatewayData",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  userId: "userId",
  mediaId: "mediaId"
};
var PurchaseScalarFieldEnum = {
  id: "id",
  type: "type",
  price: "price",
  userId: "userId",
  mediaId: "mediaId",
  createdAt: "createdAt",
  expiresAt: "expiresAt",
  paymentId: "paymentId"
};
var ReviewScalarFieldEnum = {
  id: "id",
  rating: "rating",
  content: "content",
  tags: "tags",
  spoiler: "spoiler",
  status: "status",
  userId: "userId",
  mediaId: "mediaId",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var WatchlistScalarFieldEnum = {
  id: "id",
  userId: "userId",
  mediaId: "mediaId",
  createdAt: "createdAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var NullableJsonNullValueInput = {
  DbNull: DbNull2,
  JsonNull: JsonNull2
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var JsonNullValueFilter = {
  DbNull: DbNull2,
  JsonNull: JsonNull2,
  AnyNull: AnyNull2
};
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/client.ts
globalThis["__dirname"] = path2.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/app/lib/prisma.ts
var connectionString = envVars.DATABASE_URL;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/app/lib/auth.ts
var auth = betterAuth({
  baseURL: envVars.BETTER_AUTH_URL,
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql"
    // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },
  socialProviders: {
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      // callbackUrl: envVars.GOOGLE_CALLBACK_URL,
      mapProfileToUser: () => {
        return {
          role: Role.USER,
          status: UserStatus.ACTIVE,
          needPasswordChange: false,
          emailVerified: true,
          isDeleted: false,
          deletedAt: null
        };
      }
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.USER
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE
      },
      needPasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null
      }
    }
  },
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          const user = await prisma.user.findUnique({
            where: {
              email
            }
          });
          if (!user) {
            console.error(`User with email ${email} not found. Cannot send verification OTP.`);
            return;
          }
          if (user && user.role === Role.SUPER_ADMIN) {
            console.log(`User with email ${email} is a super admin. Skipping sending verification OTP.`);
            return;
          }
          if (user && !user.emailVerified) {
            sendEmail({
              to: email,
              subject: "Verify your email",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp
              }
            });
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({
            where: {
              email
            }
          });
          if (user) {
            sendEmail({
              to: email,
              subject: "Password Reset OTP",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp
              }
            });
          }
        }
      },
      expiresIn: 2 * 60,
      // 2 minutes in seconds
      otpLength: 6
    })
  ],
  session: {
    expiresIn: 60 * 60 * 60 * 24,
    // 1 day in seconds
    updateAge: 60 * 60 * 60 * 24,
    // 1 day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24
      // 1 day in seconds
    }
  },
  redirectURLs: {
    signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:8000", envVars.FRONTEND_URL],
  advanced: {
    // disableCSRFCheck: true,
    useSecureCookies: false,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      }
    }
  }
});

// src/app/utils/cookie.ts
var setCookie = (res, key, value, options) => {
  res.cookie(key, value, options);
};
var getCookie = (req, key) => {
  return req.cookies[key];
};
var clearCookie = (res, key, options) => {
  res.clearCookie(key, options);
};
var CookieUtils = {
  setCookie,
  getCookie,
  clearCookie
};

// src/app/utils/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, { expiresIn }) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const data = jwt.verify(token, secret);
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error
    };
  }
};
var decodeToken = (token) => {
  const decoded = jwt.decode(token);
  return decoded;
};
var jwtUtils = {
  createToken,
  verifyToken,
  decodeToken
};

// src/app/utils/token.ts
var getAccessToken = (payload) => {
  const accessToken = jwtUtils.createToken(
    payload,
    envVars.ACCESS_TOKEN_SECRET,
    { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN }
  );
  return accessToken;
};
var getRefreshToken = (payload) => {
  const refreshToken = jwtUtils.createToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET,
    { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN }
  );
  return refreshToken;
};
var setAccessTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //1 day
    maxAge: 60 * 60 * 24 * 1e3
  });
};
var setRefreshTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //7d
    maxAge: 60 * 60 * 24 * 1e3 * 7
  });
};
var setBetterAuthSessionCookie = (res, token) => {
  CookieUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //1 day
    maxAge: 60 * 60 * 24 * 1e3
  });
};
var tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie
};

// src/app/module/auth/auth.service.ts
var register = async (payload) => {
  const { name, email, password } = payload;
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });
  if (existingUser) {
    throw new AppError_default(status3.CONFLICT, "Email already registered");
  }
  try {
    const authResponse = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password
      }
    });
    if (!authResponse || !authResponse.user) {
      console.error("Better Auth signup failed:", authResponse);
      throw new AppError_default(status3.BAD_REQUEST, "Failed to register user with auth provider");
    }
    const user = await prisma.$transaction(async (tx) => {
      const existingDbUser = await tx.user.findUnique({
        where: { id: authResponse.user.id }
      });
      if (existingDbUser) {
        return existingDbUser;
      }
      return await tx.user.create({
        data: {
          id: authResponse.user.id,
          name: authResponse.user.name,
          email: authResponse.user.email,
          role: authResponse.user.role,
          status: authResponse.user.status,
          emailVerified: authResponse.user.emailVerified || false,
          isDeleted: authResponse.user.isDeleted || false
        }
      });
    });
    const accessToken = tokenUtils.getAccessToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      status: user.status,
      isDeleted: user.isDeleted,
      emailVerified: user.emailVerified
    });
    const refreshToken = tokenUtils.getRefreshToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      status: user.status,
      isDeleted: user.isDeleted,
      emailVerified: user.emailVerified
    });
    return {
      user,
      accessToken,
      refreshToken,
      token: authResponse.token || null
    };
  } catch (error) {
    if (error instanceof AppError_default) {
      throw error;
    }
    try {
      const createdUser = await prisma.user.findUnique({
        where: { email }
      });
      if (createdUser) {
        await prisma.user.delete({
          where: { id: createdUser.id }
        });
      }
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
    }
    console.error("Error during registration:", error);
    const errorMessage = error instanceof Error ? error.message : "Registration failed";
    throw new AppError_default(status3.INTERNAL_SERVER_ERROR, errorMessage);
  }
};
var login = async (payload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password
    }
  });
  if (!data.user) {
    throw new AppError_default(status3.BAD_REQUEST, "Invalid email or password");
  }
  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError_default(status3.FORBIDDEN, "Your account has been blocked. Please contact support.");
  }
  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError_default(status3.NOT_FOUND, "Your account has been deleted. Please contact support.");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  return {
    accessToken,
    refreshToken,
    ...data
  };
};
var getMe = async (user) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  return isUserExists;
};
var getNewToken = async (refreshToken, sessionToken) => {
  const isSessionTokenExists = await prisma.session.findUnique({
    where: {
      token: sessionToken
    },
    include: {
      user: true
    }
  });
  if (!isSessionTokenExists) {
    throw new AppError_default(status3.UNAUTHORIZED, "Invalid session token");
  }
  const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET);
  if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
    throw new AppError_default(status3.UNAUTHORIZED, "Invalid refresh token");
  }
  const data = verifiedRefreshToken.data;
  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified
  });
  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified
  });
  const { token } = await prisma.session.update({
    where: {
      token: sessionToken
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1e3),
      updatedAt: /* @__PURE__ */ new Date()
    }
  });
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: token
  };
};
var changePassword = async (payload, sessionToken) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  if (!session) {
    throw new AppError_default(status3.UNAUTHORIZED, "Invalid session token");
  }
  const { currentPassword, newPassword } = payload;
  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  if (session.user.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        needPasswordChange: false
      }
    });
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified
  });
  return {
    ...result,
    accessToken,
    refreshToken
  };
};
var logoutUser = async (sessionToken) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  return result;
};
var verifyEmail = async (email, otp) => {
  const result = await auth.api.verifyEmailOTP({
    body: {
      email,
      otp
    }
  });
  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: {
        email
      },
      data: {
        emailVerified: true
      }
    });
  }
};
var forgetPassword = async (email) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!isUserExist) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  if (!isUserExist.emailVerified) {
    throw new AppError_default(status3.BAD_REQUEST, "Email not verified");
  }
  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  await auth.api.requestPasswordResetEmailOTP({
    body: {
      email
    }
  });
};
var resetPassword = async (email, otp, newPassword) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!isUserExist) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  if (!isUserExist.emailVerified) {
    throw new AppError_default(status3.BAD_REQUEST, "Email not verified");
  }
  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword
    }
  });
  if (isUserExist.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: isUserExist.id
      },
      data: {
        needPasswordChange: false
      }
    });
  }
  await prisma.session.deleteMany({
    where: {
      userId: isUserExist.id
    }
  });
};
var googleLoginSuccess = async (session) => {
  const isExists = await prisma.user.findUnique({
    where: {
      id: session.user.id
    }
  });
  if (!isExists) {
    await prisma.user.create({
      data: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email
      }
    });
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name
  });
  return {
    accessToken,
    refreshToken
  };
};
var updateProfile = async (user, payload) => {
  const { name, image } = payload;
  const result = await prisma.user.update({
    where: {
      id: user.userId
    },
    data: {
      name,
      image
    }
  });
  return result;
};
var AuthService = {
  register,
  login,
  getMe,
  getNewToken,
  changePassword,
  logoutUser,
  verifyEmail,
  forgetPassword,
  resetPassword,
  googleLoginSuccess,
  updateProfile
};

// src/app/shared/sendResponse.ts
var sendResponse = (res, responseData) => {
  const { httpStatusCode, success, message, data, meta } = responseData;
  res.status(httpStatusCode).json({
    success,
    message,
    data,
    meta
  });
};

// src/app/module/auth/auth.controller.ts
import status4 from "http-status";
var register2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AuthService.register(payload);
  const { accessToken, refreshToken, token, ...rest } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    httpStatusCode: status4.CREATED,
    success: true,
    message: "Patient registered successfully",
    data: {
      accessToken,
      refreshToken,
      token,
      ...rest
    }
  });
});
var login2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AuthService.login(payload);
  const { accessToken, refreshToken, token, ...rest } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    httpStatusCode: status4.OK,
    success: true,
    message: "Login successful",
    data: {
      accessToken,
      refreshToken,
      token,
      ...rest
    }
  });
});
var getMe2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const result = await AuthService.getMe(user);
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "User profile fetched successfully",
      data: result
    });
  }
);
var getNewToken2 = catchAsync(
  async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    if (!refreshToken) {
      throw new AppError_default(status4.UNAUTHORIZED, "Refresh token is missing");
    }
    const result = await AuthService.getNewToken(refreshToken, betterAuthSessionToken);
    const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, sessionToken);
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "New tokens generated successfully",
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        sessionToken
      }
    });
  }
);
var changePassword2 = catchAsync(
  async (req, res) => {
    const payload = req.body;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    const result = await AuthService.changePassword(payload, betterAuthSessionToken);
    const { accessToken, refreshToken, token } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "Password changed successfully",
      data: result
    });
  }
);
var logoutUser2 = catchAsync(
  async (req, res) => {
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    const result = await AuthService.logoutUser(betterAuthSessionToken);
    CookieUtils.clearCookie(res, "accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    CookieUtils.clearCookie(res, "refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    CookieUtils.clearCookie(res, "better-auth.session_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "User logged out successfully",
      data: result
    });
  }
);
var verifyEmail2 = catchAsync(
  async (req, res) => {
    const { email, otp } = req.body;
    await AuthService.verifyEmail(email, otp);
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "Email verified successfully"
    });
  }
);
var forgetPassword2 = catchAsync(
  async (req, res) => {
    const { email } = req.body;
    await AuthService.forgetPassword(email);
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "Password reset OTP sent to email successfully"
    });
  }
);
var resetPassword2 = catchAsync(
  async (req, res) => {
    const { email, otp, newPassword } = req.body;
    await AuthService.resetPassword(email, otp, newPassword);
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "Password reset successfully"
    });
  }
);
var googleLogin = catchAsync((req, res) => {
  const redirectPath = req.query.redirect || "/dashboard";
  const encodedRedirectPath = encodeURIComponent(redirectPath);
  const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;
  res.render("googleRedirect", {
    callbackURL,
    betterAuthUrl: envVars.BETTER_AUTH_URL
  });
});
var googleLoginSuccess2 = catchAsync(async (req, res) => {
  const redirectPath = req.query.redirect || "/dashboard";
  const sessionToken = req.cookies["better-auth.session_token"];
  if (!sessionToken) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
  }
  const session = await auth.api.getSession({
    headers: {
      "Cookie": `better-auth.session_token=${sessionToken}`
    }
  });
  if (!session) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`);
  }
  if (session && !session.user) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`);
  }
  const result = await AuthService.googleLoginSuccess(session);
  const { accessToken, refreshToken } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
  const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";
  res.redirect(`${envVars.FRONTEND_URL}${finalRedirectPath}`);
});
var handleOAuthError = catchAsync((req, res) => {
  const error = req.query.error || "oauth_failed";
  res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
});
var updateProfile2 = catchAsync(async (req, res) => {
  const user = req.user;
  const payload = req.body;
  const result = await AuthService.updateProfile(user, payload);
  sendResponse(res, {
    httpStatusCode: status4.OK,
    success: true,
    message: "Profile updated successfully",
    data: result
  });
});
var AuthController = {
  register: register2,
  login: login2,
  getMe: getMe2,
  getNewToken: getNewToken2,
  changePassword: changePassword2,
  logoutUser: logoutUser2,
  verifyEmail: verifyEmail2,
  forgetPassword: forgetPassword2,
  resetPassword: resetPassword2,
  googleLogin,
  googleLoginSuccess: googleLoginSuccess2,
  handleOAuthError,
  updateProfile: updateProfile2
};

// src/app/middleware/checkAuth.ts
import status5 from "http-status";
var checkAuth = (...authRoles) => async (req, res, next) => {
  try {
    const sessionToken = CookieUtils.getCookie(req, "better-auth.session_token");
    if (!sessionToken) {
      throw new Error("Unauthorized access! No session token provided.");
    }
    if (sessionToken) {
      const sessionExists = await prisma.session.findFirst({
        where: {
          token: sessionToken,
          expiresAt: {
            gt: /* @__PURE__ */ new Date()
          }
        },
        include: {
          user: true
        }
      });
      if (sessionExists && sessionExists.user) {
        const user = sessionExists.user;
        const now = /* @__PURE__ */ new Date();
        const expiresAt = new Date(sessionExists.expiresAt);
        const createdAt = new Date(sessionExists.createdAt);
        const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
        const timeRemaining = expiresAt.getTime() - now.getTime();
        const percentRemaining = timeRemaining / sessionLifeTime * 100;
        if (percentRemaining < 20) {
          res.setHeader("X-Session-Refresh", "true");
          res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
          res.setHeader("X-Time-Remaining", timeRemaining.toString());
          console.log("Session Expiring Soon!!");
        }
        if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED) {
          throw new AppError_default(status5.UNAUTHORIZED, "Unauthorized access! User is not active.");
        }
        if (user.isDeleted) {
          throw new AppError_default(status5.UNAUTHORIZED, "Unauthorized access! User is deleted.");
        }
        if (authRoles.length > 0 && !authRoles.includes(user.role)) {
          throw new AppError_default(status5.FORBIDDEN, "Forbidden access! You do not have permission to access this resource.");
        }
        req.user = {
          userId: user.id,
          role: user.role,
          email: user.email
        };
      }
      const accessToken2 = CookieUtils.getCookie(req, "accessToken");
      if (!accessToken2) {
        throw new AppError_default(status5.UNAUTHORIZED, "Unauthorized access! No access token provided.");
      }
    }
    const accessToken = CookieUtils.getCookie(req, "accessToken");
    if (!accessToken) {
      throw new AppError_default(status5.UNAUTHORIZED, "Unauthorized access! No access token provided.");
    }
    const verifiedToken = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);
    if (!verifiedToken.success) {
      throw new AppError_default(status5.UNAUTHORIZED, "Unauthorized access! Invalid access token.");
    }
    if (authRoles.length > 0 && !authRoles.includes(verifiedToken.data.role)) {
      throw new AppError_default(status5.FORBIDDEN, "Forbidden access! You do not have permission to access this resource.");
    }
    next();
  } catch (error) {
    next(error);
  }
};

// src/app/middleware/validateRequest.ts
var validateRequest = (zodSchema) => {
  return (req, res, next) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    const parsedResult = zodSchema.safeParse(req.body);
    if (!parsedResult.success) {
      next(parsedResult.error);
    }
    req.body = parsedResult.data;
    next();
  };
};

// src/app/module/auth/auth.validation.ts
import z from "zod";
var registerZodSchema = z.object({
  name: z.string("Name must be a string").min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.email("Email is required and must be a valid email address"),
  password: z.string("Password must be a string").min(6, "Password must be at least 6 characters").max(128, "Password must be less than 128 characters")
});
var loginZodSchema = z.object({
  email: z.email("Email is required and must be a valid email address"),
  password: z.string("Password must be a string").min(1, "Password is required")
});
var changePasswordZodSchema = z.object({
  currentPassword: z.string("Current password must be a string").min(1, "Current password is required"),
  newPassword: z.string("New password must be a string").min(6, "New password must be at least 6 characters").max(128, "Password must be less than 128 characters")
});
var verifyEmailZodSchema = z.object({
  email: z.email("Email is required and must be a valid email address"),
  otp: z.string("OTP must be a string").min(1, "OTP is required")
});
var forgetPasswordZodSchema = z.object({
  email: z.email("Email is required and must be a valid email address")
});
var resetPasswordZodSchema = z.object({
  email: z.email("Email is required and must be a valid email address"),
  otp: z.string("OTP must be a string").min(1, "OTP is required"),
  newPassword: z.string("New password must be a string").min(6, "New password must be at least 6 characters").max(128, "Password must be less than 128 characters")
});
var AuthValidation = {
  registerZodSchema,
  loginZodSchema,
  changePasswordZodSchema,
  verifyEmailZodSchema,
  forgetPasswordZodSchema,
  resetPasswordZodSchema
};

// src/app/config/multer.config.ts
import { CloudinaryStorage } from "multer-storage-cloudinary";

// src/app/config/cloudinary.config.ts
import { v2 as cloudinary } from "cloudinary";
import status6 from "http-status";
cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUD_NAME,
  api_key: envVars.CLOUDINARY.API_KEY,
  api_secret: envVars.CLOUDINARY.API_SECRET
});
var uploadFileToCloudinary = async (buffer, fileName) => {
  if (!buffer || !fileName) {
    throw new AppError_default(status6.BAD_REQUEST, "File buffer and file name are required for upload.");
  }
  const extension = fileName.split(".").pop()?.toLowerCase();
  const fileNameWithoutExtension = fileName.split(".").slice(0, -1).join(".").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const uniqueName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileNameWithoutExtension;
  const folder = extension === "pdf" ? "pdfs" : "images";
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        public_id: `PH-medicare/${folder}/${uniqueName}`,
        folder: `PH-medicare/${folder}`
      },
      (error, result) => {
        if (error) {
          return reject(new AppError_default(status6.INTERNAL_SERVER_ERROR, "Failed to upload file to Cloudinary"));
        }
        resolve(result);
      }
    ).end(buffer);
  });
};
var cloudinaryDelete = async (url) => {
  try {
    const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;
    const match = url.match(regex);
    if (match && match[1]) {
      const publicId = match[1];
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      console.log(`file ${publicId} deleted successfully from Cloudinary.`);
    }
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw new AppError_default(status6.INTERNAL_SERVER_ERROR, "Failed to delete file from Cloudinary");
  }
};
var cloudinaryUpload = cloudinary;

// src/app/config/multer.config.ts
import multer from "multer";
var storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: async (req, file) => {
    const originalName = file.originalname;
    const extension = originalName.split(".").pop()?.toLowerCase();
    const fileNameWithoutExtension = originalName.split(".").slice(0, -1).join(".").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const uniqueName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileNameWithoutExtension;
    const folder = extension === "pdf" ? "pdfs" : "images";
    return {
      folder: `Movies/${folder}`,
      public_id: uniqueName,
      resource_type: "auto"
    };
  }
});
var multerUpload = multer({ storage });

// src/app/module/auth/auth.middleware.ts
var updateProfileMiddleware = (req, res, next) => {
  if (req.body.data) {
    try {
      req.body = JSON.parse(req.body.data);
    } catch (e) {
      console.error("Error parsing body.data:", e);
    }
  }
  const files = req.files;
  if (files?.image?.[0]) {
    req.body.image = files.image[0].path;
  }
  next();
};

// src/app/module/auth/auth.route.ts
var router = Router();
router.post("/register", validateRequest(AuthValidation.registerZodSchema), AuthController.register);
router.post("/login", validateRequest(AuthValidation.loginZodSchema), AuthController.login);
router.get("/me", checkAuth(Role.ADMIN, Role.USER), AuthController.getMe);
router.post("/refresh-token", AuthController.getNewToken);
router.post(
  "/change-password",
  checkAuth(Role.ADMIN, Role.USER),
  validateRequest(AuthValidation.changePasswordZodSchema),
  AuthController.changePassword
);
router.post(
  "/logout",
  checkAuth(Role.ADMIN, Role.USER),
  AuthController.logoutUser
);
router.post("/verify-email", validateRequest(AuthValidation.verifyEmailZodSchema), AuthController.verifyEmail);
router.post("/forget-password", validateRequest(AuthValidation.forgetPasswordZodSchema), AuthController.forgetPassword);
router.post("/reset-password", validateRequest(AuthValidation.resetPasswordZodSchema), AuthController.resetPassword);
router.get("/login/google", AuthController.googleLogin);
router.get("/google/success", AuthController.googleLoginSuccess);
router.get("/oauth/error", AuthController.handleOAuthError);
router.patch(
  "/updateProfile",
  checkAuth(Role.ADMIN, Role.USER),
  multerUpload.fields([{ name: "image", maxCount: 1 }]),
  updateProfileMiddleware,
  AuthController.updateProfile
);
var AuthRoutes = router;

// src/app/module/media/media.route.ts
import { Router as Router2 } from "express";

// src/app/module/media/media.controller.ts
import status7 from "http-status";

// src/app/utils/queryBuilder.ts
var QueryBuilder = class {
  constructor(model, queryParams, config2 = {}) {
    this.model = model;
    this.queryParams = queryParams;
    this.config = config2;
    this.query = {
      where: {},
      include: {},
      orderBy: {},
      skip: 0,
      take: 10
    };
    this.countQuery = {
      where: {}
    };
  }
  query;
  countQuery;
  page = 1;
  limit = 10;
  skip = 0;
  sortBy = "createdAt";
  sortOrder = "desc";
  selectFields;
  search() {
    const { searchTerm } = this.queryParams;
    const { searchableFields } = this.config;
    if (searchTerm && searchableFields && searchableFields.length > 0) {
      const searchConditions = searchableFields.map(
        (field) => {
          if (field.includes(".")) {
            const parts = field.split(".");
            if (parts.length === 2) {
              const [relation, nestedField] = parts;
              const stringFilter2 = {
                contains: searchTerm,
                mode: "insensitive"
              };
              return {
                [relation]: {
                  [nestedField]: stringFilter2
                }
              };
            } else if (parts.length === 3) {
              const [relation, nestedRelation, nestedField] = parts;
              const stringFilter2 = {
                contains: searchTerm,
                mode: "insensitive"
              };
              return {
                [relation]: {
                  some: {
                    [nestedRelation]: {
                      [nestedField]: stringFilter2
                    }
                  }
                }
              };
            }
          }
          const isArrayField = ["cast", "genres", "platform"].includes(field);
          if (isArrayField) {
            return {
              [field]: {
                hasSome: [searchTerm]
              }
            };
          }
          const stringFilter = {
            contains: searchTerm,
            mode: "insensitive"
          };
          return {
            [field]: stringFilter
          };
        }
      );
      const whereConditions = this.query.where;
      whereConditions.OR = searchConditions;
      const countWhereConditions = this.countQuery.where;
      countWhereConditions.OR = searchConditions;
    }
    return this;
  }
  // /doctors?searchTerm=john&page=1&sortBy=name&specialty=cardiology&appointmentFee[lt]=100 => {}
  // { specialty: 'cardiology', appointmentFee: { lt: '100' } }
  filter() {
    const { filterableFields } = this.config;
    const excludedField = ["searchTerm", "page", "limit", "sortBy", "sortOrder", "fields", "include"];
    const filterParams = {};
    Object.keys(this.queryParams).forEach((key) => {
      if (!excludedField.includes(key)) {
        filterParams[key] = this.queryParams[key];
      }
    });
    const queryWhere = this.query.where;
    const countQueryWhere = this.countQuery.where;
    Object.keys(filterParams).forEach((key) => {
      const value = filterParams[key];
      if (value === void 0 || value === "") {
        return;
      }
      const isAllowedField = !filterableFields || filterableFields.length === 0 || filterableFields.includes(key);
      if (key.includes(".")) {
        const parts = key.split(".");
        if (filterableFields && !filterableFields.includes(key)) {
          return;
        }
        if (parts.length === 2) {
          const [relation, nestedField] = parts;
          if (!queryWhere[relation]) {
            queryWhere[relation] = {};
            countQueryWhere[relation] = {};
          }
          const queryRelation = queryWhere[relation];
          const countRelation = countQueryWhere[relation];
          queryRelation[nestedField] = this.parseFilterValue(value);
          countRelation[nestedField] = this.parseFilterValue(value);
          return;
        } else if (parts.length === 3) {
          const [relation, nestedRelation, nestedField] = parts;
          if (!queryWhere[relation]) {
            queryWhere[relation] = {
              some: {}
            };
            countQueryWhere[relation] = {
              some: {}
            };
          }
          const queryRelation = queryWhere[relation];
          const countRelation = countQueryWhere[relation];
          if (!queryRelation.some) {
            queryRelation.some = {};
          }
          if (!countRelation.some) {
            countRelation.some = {};
          }
          const querySome = queryRelation.some;
          const countSome = countRelation.some;
          if (!querySome[nestedRelation]) {
            querySome[nestedRelation] = {};
          }
          if (!countSome[nestedRelation]) {
            countSome[nestedRelation] = {};
          }
          const queryNestedRelation = querySome[nestedRelation];
          const countNestedRelation = countSome[nestedRelation];
          queryNestedRelation[nestedField] = this.parseFilterValue(value);
          countNestedRelation[nestedField] = this.parseFilterValue(value);
          return;
        }
      }
      if (!isAllowedField) {
        return;
      }
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        queryWhere[key] = this.parseRangeFilter(value);
        countQueryWhere[key] = this.parseRangeFilter(value);
        return;
      }
      queryWhere[key] = this.parseFilterValue(value);
      countQueryWhere[key] = this.parseFilterValue(value);
    });
    return this;
  }
  paginate() {
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 10;
    this.page = page;
    this.limit = limit;
    this.skip = (page - 1) * limit;
    this.query.skip = this.skip;
    this.query.take = this.limit;
    return this;
  }
  sort() {
    const sortBy = this.queryParams.sortBy || "createdAt";
    const sortOrder = this.queryParams.sortOrder === "asc" ? "asc" : "desc";
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    if (sortBy.includes(".")) {
      const parts = sortBy.split(".");
      if (parts.length === 2) {
        const [relation, nestedField] = parts;
        this.query.orderBy = {
          [relation]: {
            [nestedField]: sortOrder
          }
        };
      } else if (parts.length === 3) {
        const [relation, nestedRelation, nestedField] = parts;
        this.query.orderBy = {
          [relation]: {
            [nestedRelation]: {
              [nestedField]: sortOrder
            }
          }
        };
      } else {
        this.query.orderBy = {
          [sortBy]: sortOrder
        };
      }
    } else {
      this.query.orderBy = {
        [sortBy]: sortOrder
      };
    }
    return this;
  }
  fields() {
    const fieldsParam = this.queryParams.fields;
    if (fieldsParam && typeof fieldsParam === "string") {
      const fieldsArray = fieldsParam?.split(",").map((field) => field.trim());
      this.selectFields = {};
      fieldsArray?.forEach((field) => {
        if (this.selectFields) {
          this.selectFields[field] = true;
        }
      });
      this.query.select = this.selectFields;
      delete this.query.include;
    }
    return this;
  }
  include(relation) {
    if (this.selectFields) {
      return this;
    }
    this.query.include = { ...this.query.include, ...relation };
    return this;
  }
  dynamicInclude(includeConfig, defaultInclude) {
    if (this.selectFields) {
      return this;
    }
    const result = {};
    defaultInclude?.forEach((field) => {
      if (includeConfig[field]) {
        result[field] = includeConfig[field];
      }
    });
    const includeParam = this.queryParams.include;
    if (includeParam && typeof includeParam === "string") {
      const requestedRelations = includeParam.split(",").map((relation) => relation.trim());
      requestedRelations.forEach((relation) => {
        if (includeConfig[relation]) {
          result[relation] = includeConfig[relation];
        }
      });
    }
    this.query.include = { ...this.query.include, ...result };
    return this;
  }
  where(condition) {
    this.query.where = this.deepMerge(this.query.where, condition);
    this.countQuery.where = this.deepMerge(this.countQuery.where, condition);
    return this;
  }
  async execute() {
    const [total, data] = await Promise.all([
      this.model.count(this.countQuery),
      this.model.findMany(this.query)
    ]);
    const totalPages = Math.ceil(total / this.limit);
    return {
      data,
      meta: {
        page: this.page,
        limit: this.limit,
        total,
        totalPages
      }
    };
  }
  async count() {
    return await this.model.count(this.countQuery);
  }
  getQuery() {
    return this.query;
  }
  deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        if (result[key] && typeof result[key] === "object" && !Array.isArray(result[key])) {
          result[key] = this.deepMerge(result[key], source[key]);
        } else {
          result[key] = source[key];
        }
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
  parseFilterValue(value) {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    if (typeof value === "string" && !isNaN(Number(value)) && value != "") {
      return Number(value);
    }
    if (Array.isArray(value)) {
      return { in: value.map((item) => this.parseFilterValue(item)) };
    }
    return value;
  }
  parseRangeFilter(value) {
    const rangeQuery = {};
    Object.keys(value).forEach((operator) => {
      const operatorValue = value[operator];
      const parsedValue = typeof operatorValue === "string" && !isNaN(Number(operatorValue)) ? Number(operatorValue) : operatorValue;
      switch (operator) {
        case "lt":
        case "lte":
        case "gt":
        case "gte":
        case "equals":
        case "not":
        case "contains":
        case "startsWith":
        case "endsWith":
          rangeQuery[operator] = parsedValue;
          break;
        case "in":
        case "notIn":
          if (Array.isArray(operatorValue)) {
            rangeQuery[operator] = operatorValue;
          } else {
            rangeQuery[operator] = [parsedValue];
          }
          break;
        default:
          break;
      }
    });
    return Object.keys(rangeQuery).length > 0 ? rangeQuery : value;
  }
};

// src/app/module/media/media.constant.ts
var mediaSearchableFields = [
  "title",
  "description",
  "director",
  "cast",
  "genres",
  "platform"
];
var mediaFilterableFields = [
  "type",
  "releaseYear",
  "genres",
  "platform",
  "price",
  "createdAt"
];
var mediaIncludeConfig = {
  reviews: {
    include: {
      user: true
    }
  },
  purchases: {
    include: {
      user: true
    }
  },
  watchlist: {
    include: {
      user: true
    }
  }
};

// src/app/module/media/media.service.ts
var getAll = async (query) => {
  const queryBuilder = new QueryBuilder(prisma.media, query, {
    searchableFields: mediaSearchableFields,
    filterableFields: mediaFilterableFields
  });
  const result = await queryBuilder.search().filter().where({
    isDeleted: false
  }).include({
    // basic include (lightweight)
    reviews: {
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        comments: {
          where: {
            parentId: null
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    }
  }).dynamicInclude(mediaIncludeConfig).paginate().sort().fields().execute();
  const dataWithAvgRating = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result.data.map(async (media) => {
      const avgRating = await prisma.review.aggregate({
        where: {
          mediaId: media.id,
          isDeleted: false
        },
        _avg: {
          rating: true
        }
      });
      return {
        ...media,
        avgRating: avgRating._avg.rating ? parseFloat(avgRating._avg.rating.toFixed(2)) : null
      };
    })
  );
  return {
    ...result,
    data: dataWithAvgRating
  };
};
var getById = async (id) => {
  const result = await prisma.media.findUniqueOrThrow({
    where: { id, isDeleted: false },
    include: {
      reviews: {
        include: {
          user: true
        }
      }
    }
  });
  const avgRating = await prisma.review.aggregate({
    where: {
      mediaId: id,
      isDeleted: false
    },
    _avg: {
      rating: true
    }
  });
  return {
    ...result,
    avgRating: avgRating._avg.rating ? parseFloat(avgRating._avg.rating.toFixed(2)) : null
  };
};
var create = async (user, payload) => {
  const result = await prisma.media.create({
    data: {
      ...payload
    }
  });
  return result;
};
var updateById = async (id, payload) => {
  await prisma.media.findUniqueOrThrow({ where: { id } });
  const result = await prisma.$transaction(async (tx) => {
    return await tx.media.update({
      where: { id },
      data: { ...payload }
    });
  });
  return result;
};
var deleteById = async (id) => {
  await prisma.media.findUniqueOrThrow({
    where: { id, isDeleted: false }
  });
  const result = await prisma.$transaction(async (tx) => {
    return await tx.media.update({
      where: { id },
      data: { isDeleted: true, deletedAt: /* @__PURE__ */ new Date() }
    });
  });
  return result;
};
var MediaService = {
  getAll,
  getById,
  create,
  updateById,
  deleteById
};

// src/app/module/media/media.controller.ts
var getAll2 = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await MediaService.getAll(query);
  sendResponse(res, {
    success: true,
    httpStatusCode: status7.OK,
    message: "Media list retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var getById2 = catchAsync(async (req, res) => {
  const result = await MediaService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    httpStatusCode: status7.OK,
    message: "Media retrieved successfully",
    data: result
  });
});
var create2 = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user) {
    return sendResponse(res, {
      success: false,
      httpStatusCode: status7.UNAUTHORIZED,
      message: "Unauthorized user",
      data: null
    });
  }
  const result = await MediaService.create(user, req.body);
  sendResponse(res, {
    success: true,
    httpStatusCode: status7.CREATED,
    message: "Media created successfully",
    data: result
  });
});
var updateById2 = catchAsync(async (req, res) => {
  const result = await MediaService.updateById(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    httpStatusCode: status7.OK,
    message: "Media updated successfully",
    data: result
  });
});
var deleteById2 = catchAsync(async (req, res) => {
  const result = await MediaService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    httpStatusCode: status7.OK,
    message: "Media deleted successfully",
    data: result
  });
});
var MediaController = {
  getAll: getAll2,
  getById: getById2,
  create: create2,
  updateById: updateById2,
  deleteById: deleteById2
};

// src/app/module/media/media.middleware.ts
var updateMediaMiddleware = (req, res, next) => {
  if (req.body.data) {
    try {
      req.body = JSON.parse(req.body.data);
    } catch (e) {
      console.error("Error parsing body.data:", e);
    }
  }
  const files = req.files;
  if (files?.imageUrl?.[0]) {
    req.body.imageUrl = files.imageUrl[0].path;
  }
  next();
};
var createMediaMiddleware = (req, res, next) => {
  if (req.body.data) {
    try {
      req.body = JSON.parse(req.body.data);
    } catch (e) {
      console.error("Error parsing body.data:", e);
    }
  }
  const files = req.files;
  if (files?.imageUrl?.[0]) {
    req.body.imageUrl = files.imageUrl[0].path;
  }
  next();
};

// src/app/module/media/media.validation.ts
import z2 from "zod";
var createMediaZodSchema = z2.object({
  title: z2.string("Title must be a string").min(1, "Title cannot be empty").max(100, "Title must be less than 100 characters"),
  description: z2.string("Description must be a string").min(1, "Description cannot be empty"),
  type: z2.enum(["MOVIE", "SERIES"], "Type must be either MOVIE or SERIES"),
  releaseYear: z2.number("Release year must be a number").int("Release year must be an integer").min(1888, "Release year must be after 1888").max((/* @__PURE__ */ new Date()).getFullYear(), "Release year cannot be in the future"),
  director: z2.string("Director must be a string").min(1, "Director cannot be empty").max(100, "Director must be less than 100 characters"),
  cast: z2.array(
    z2.string("Cast member must be a string").min(1, "Cast member cannot be empty").max(100, "Cast member must be less than 100 characters")
  ).min(1, "At least one cast member is required"),
  genres: z2.array(
    z2.string("Genre must be a string").min(1, "Genre cannot be empty").max(50, "Genre must be less than 50 characters")
  ).min(1, "At least one genre is required"),
  platform: z2.array(
    z2.string("Platform must be a string").min(1, "Platform cannot be empty").max(50, "Platform must be less than 50 characters")
  ).min(1, "At least one platform is required"),
  pricing: z2.enum(["FREE", "PREMIUM"], "Pricing must be either FREE or PREMIUM"),
  price: z2.number("Price must be a number").optional(),
  youtubeLink: z2.string("YouTube link must be a string").url("YouTube link must be a valid URL").optional(),
  imageUrl: z2.string("Image URL must be a string").optional()
});
var updateMediaZodSchema = z2.object({
  title: z2.string("Title must be a string").min(1, "Title cannot be empty").max(100, "Title must be less than 100 characters").optional(),
  description: z2.string("Description must be a string").min(1, "Description cannot be empty").optional(),
  type: z2.enum(["MOVIE", "TV_SHOW"], "Type must be either MOVIE or TV_SHOW").optional(),
  releaseYear: z2.number("Release year must be a number").int("Release year must be an integer").min(1888, "Release year must be after 1888").max((/* @__PURE__ */ new Date()).getFullYear(), "Release year cannot be in the future").optional(),
  director: z2.string("Director must be a string").min(1, "Director cannot be empty").max(100, "Director must be less than 100 characters").optional(),
  cast: z2.array(
    z2.string("Cast member must be a string").min(1, "Cast member cannot be empty").max(100, "Cast member must be less than 100 characters")
  ).min(1, "At least one cast member is required").optional(),
  genres: z2.array(
    z2.string("Genre must be a string").min(1, "Genre cannot be empty").max(50, "Genre must be less than 50 characters")
  ).min(1, "At least one genre is required").optional(),
  platform: z2.array(
    z2.string("Platform must be a string").min(1, "Platform cannot be empty").max(50, "Platform must be less than 50 characters")
  ).min(1, "At least one platform is required").optional(),
  pricing: z2.enum(["FREE", "PAID"], "Pricing must be either FREE or PAID").optional(),
  price: z2.number("Price must be a number").optional(),
  youtubeLink: z2.string("YouTube link must be a string").url("YouTube link must be a valid URL").optional(),
  imageUrl: z2.string("Image URL must be a string").optional()
});
var MediaValidation = {
  createMediaZodSchema,
  updateMediaZodSchema
};

// src/app/module/media/media.route.ts
var router2 = Router2();
router2.get(
  "/",
  MediaController.getAll
);
router2.get("/:id", MediaController.getById);
router2.post(
  "/",
  checkAuth(Role.ADMIN),
  multerUpload.fields([{ name: "imageUrl", maxCount: 1 }]),
  createMediaMiddleware,
  validateRequest(MediaValidation.createMediaZodSchema),
  MediaController.create
);
router2.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  multerUpload.fields([{ name: "imageUrl", maxCount: 1 }]),
  updateMediaMiddleware,
  validateRequest(MediaValidation.updateMediaZodSchema),
  MediaController.updateById
);
router2.delete("/:id", checkAuth(Role.ADMIN), MediaController.deleteById);
var MediaRoutes = router2;

// src/app/module/review/review.route.ts
import { Router as Router3 } from "express";

// src/app/module/review/review.controller.ts
import status8 from "http-status";

// src/app/module/review/review.constant.ts
var reviewSearchableFields = [
  "media.title"
];
var reviewFilterableFields = [
  "media.title"
];
var reviewIncludeConfig = {
  user: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  media: {
    select: {
      id: true,
      title: true
    }
  }
};

// src/app/module/review/review.service.ts
var getAll3 = async (query) => {
  const queryBuilder = new QueryBuilder(prisma.review, query, {
    searchableFields: reviewSearchableFields,
    filterableFields: reviewFilterableFields
  });
  const result = await queryBuilder.search().filter().where({
    isDeleted: false
  }).include({
    // basic include (lightweight)
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      }
    },
    media: {
      select: {
        id: true,
        title: true
      }
    },
    comments: {
      where: {
        parentId: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    },
    _count: {
      select: {
        likes: true,
        comments: true
      }
    }
  }).dynamicInclude(reviewIncludeConfig).paginate().sort().fields().execute();
  return result;
};
var getById3 = async (id) => {
  const result = await prisma.review.findUniqueOrThrow({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      media: {
        select: {
          id: true,
          title: true
        }
      },
      comments: {
        where: {
          parentId: null
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      }
    }
  });
  return result;
};
var create3 = async (user, payload) => {
  const result = await prisma.review.create({
    data: {
      ...payload,
      userId: user.userId
    }
  });
  return result;
};
var updateById3 = async (user, id, payload) => {
  await prisma.review.findUniqueOrThrow({ where: { id, userId: user.userId } });
  const result = await prisma.$transaction(async (tx) => {
    return await tx.review.update({
      where: { id },
      data: { ...payload }
    });
  });
  return result;
};
var updateStatusById = async (id, data) => {
  await prisma.review.findUniqueOrThrow({ where: { id } });
  const result = await prisma.$transaction(async (tx) => {
    return await tx.review.update({
      where: { id },
      data: { status: data }
    });
  });
  return result;
};
var deleteById3 = async (id) => {
  const result = await prisma.$transaction(async (tx) => {
    return await tx.review.update({
      where: { id },
      data: { isDeleted: true, deletedAt: /* @__PURE__ */ new Date() }
    });
  });
  return result;
};
var toggleLike = async (user, id) => {
  const existingReview = await prisma.review.findUnique({ where: { id } });
  if (!existingReview || existingReview.isDeleted) {
    throw new Error("Review not found");
  }
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_reviewId: {
        userId: user.userId,
        reviewId: existingReview.id
      }
    }
  });
  if (existingLike) {
    await prisma.like.delete({
      where: {
        userId_reviewId: {
          userId: user.userId,
          reviewId: existingReview.id
        }
      }
    });
    return {
      liked: false,
      message: "Review unliked successfully"
    };
  } else {
    await prisma.like.create({
      data: {
        userId: user.userId,
        reviewId: existingReview.id
      }
    });
    return {
      liked: true,
      message: "Review liked successfully"
    };
  }
};
var createComment = async (user, payload) => {
  const existingReview = await prisma.review.findUnique({ where: { id: payload.reviewId } });
  if (!existingReview || existingReview.isDeleted) {
    throw new Error("Review not found");
  }
  const result = await prisma.comment.create({
    data: {
      ...payload,
      userId: user.userId
    }
  });
  return result;
};
var updateComment = async (user, id, payload) => {
  const existingComment = await prisma.comment.findUnique({ where: { id } });
  if (!existingComment) {
    throw new Error("Comment not found");
  }
  if (existingComment.userId !== user.userId) {
    throw new Error("Unauthorized");
  }
  const result = await prisma.comment.update({
    where: { id },
    data: { content: payload.content }
  });
  return result;
};
var deleteComment = async (user, id) => {
  const existingComment = await prisma.comment.findUnique({ where: { id } });
  if (!existingComment) {
    throw new Error("Comment not found");
  }
  if (existingComment.userId !== user.userId) {
    throw new Error("Unauthorized");
  }
  const result = await prisma.comment.delete({
    where: { id }
  });
  return result;
};
var ReviewService = {
  getAll: getAll3,
  getById: getById3,
  create: create3,
  updateById: updateById3,
  updateStatusById,
  deleteById: deleteById3,
  toggleLike,
  createComment,
  updateComment,
  deleteComment
};

// src/app/module/review/review.controller.ts
var getAll4 = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await ReviewService.getAll(query);
  sendResponse(res, {
    success: true,
    httpStatusCode: status8.OK,
    message: "Review list retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var getById4 = catchAsync(async (req, res) => {
  const result = await ReviewService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    httpStatusCode: status8.OK,
    message: "Review retrieved successfully",
    data: result
  });
});
var create4 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await ReviewService.create(user, req.body);
  sendResponse(res, {
    success: true,
    httpStatusCode: status8.CREATED,
    message: "Review created successfully",
    data: result
  });
});
var updateById4 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await ReviewService.updateById(user, req.params.id, req.body);
  sendResponse(res, {
    success: true,
    httpStatusCode: status8.OK,
    message: "Review updated successfully",
    data: result
  });
});
var updateReviewStatusById = catchAsync(async (req, res) => {
  const user = req.user;
  if (user.role !== "ADMIN") {
    return sendResponse(res, {
      success: false,
      httpStatusCode: status8.FORBIDDEN,
      message: "Forbidden: Only admins can update review status",
      data: null
    });
  }
  const data = req.body;
  const result = await ReviewService.updateStatusById(req.params.id, data.status);
  sendResponse(res, {
    success: true,
    httpStatusCode: status8.OK,
    message: "Review status updated successfully",
    data: result
  });
});
var deleteById4 = catchAsync(async (req, res) => {
  const result = await ReviewService.deleteById(req.params.id);
  sendResponse(res, {
    success: true,
    httpStatusCode: status8.OK,
    message: "Review deleted successfully",
    data: result
  });
});
var toggleLike2 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await ReviewService.toggleLike(user, req.params.id);
  sendResponse(res, {
    success: true,
    httpStatusCode: status8.OK,
    message: result.liked ? "Review liked successfully" : "Review unliked successfully",
    data: result
  });
});
var createComment2 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await ReviewService.createComment(user, req.body);
  sendResponse(res, {
    success: true,
    httpStatusCode: status8.CREATED,
    message: "Comment created successfully",
    data: result
  });
});
var updateComment2 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await ReviewService.updateComment(user, req.params.id, req.body);
  sendResponse(res, {
    success: true,
    httpStatusCode: status8.OK,
    message: "Comment updated successfully",
    data: result
  });
});
var deleteComment2 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await ReviewService.deleteComment(user, req.params.id);
  sendResponse(res, {
    success: true,
    httpStatusCode: status8.OK,
    message: "Comment deleted successfully",
    data: result
  });
});
var ReviewController = {
  getAll: getAll4,
  getById: getById4,
  create: create4,
  updateById: updateById4,
  updateReviewStatusById,
  deleteById: deleteById4,
  toggleLike: toggleLike2,
  createComment: createComment2,
  updateComment: updateComment2,
  deleteComment: deleteComment2
};

// src/app/module/review/review.validation.ts
import z3 from "zod";
var createReviewZodSchema = z3.object({
  rating: z3.number("Rating must be a number").int("Rating must be an integer").min(1, "Rating must be at least 1").max(5, "Rating cannot be more than 5"),
  content: z3.string("Content must be a string").min(1, "Content cannot be empty"),
  tags: z3.array(z3.string("Tag must be a string").min(1, "Tag cannot be empty").max(50, "Tag must be less than 50 characters")).optional(),
  spoiler: z3.boolean("Spoiler must be a boolean").optional(),
  mediaId: z3.string("Media ID must be a string").min(1, "Media ID is required")
});
var updateReviewZodSchema = z3.object({
  rating: z3.number("Rating must be a number").int("Rating must be an integer").min(1, "Rating must be at least 1").max(5, "Rating cannot be more than 5").optional(),
  content: z3.string("Content must be a string").min(1, "Content cannot be empty").optional(),
  tags: z3.array(z3.string("Tag must be a string").min(1, "Tag cannot be empty").max(50, "Tag must be less than 50 characters")).optional(),
  spoiler: z3.boolean("Spoiler must be a boolean").optional()
});
var ReviewValidation = {
  createReviewZodSchema,
  updateReviewZodSchema
};

// src/app/module/review/review.route.ts
var router3 = Router3();
router3.get("/", checkAuth(Role.ADMIN), ReviewController.getAll);
router3.get("/:id", checkAuth(Role.ADMIN), ReviewController.getById);
router3.post(
  "/",
  checkAuth(Role.USER),
  validateRequest(ReviewValidation.createReviewZodSchema),
  ReviewController.create
);
router3.post("/:id/like", checkAuth(Role.USER), ReviewController.toggleLike);
router3.patch(
  "/:id",
  checkAuth(Role.USER),
  validateRequest(ReviewValidation.updateReviewZodSchema),
  ReviewController.updateById
);
router3.patch(
  "/:id/status",
  checkAuth(Role.ADMIN),
  ReviewController.updateReviewStatusById
);
router3.delete("/:id", checkAuth(Role.ADMIN), ReviewController.deleteById);
router3.post("/comments", checkAuth(Role.USER), ReviewController.createComment);
router3.patch("/comments/:id", checkAuth(Role.USER), ReviewController.updateComment);
router3.delete("/comments/:id", checkAuth(Role.USER), ReviewController.deleteComment);
var ReviewRoutes = router3;

// src/app/module/watchList/watchList.route.ts
import { Router as Router4 } from "express";

// src/app/module/watchList/watchList.controller.ts
import status9 from "http-status";

// src/app/module/watchList/watchList.constant.ts
var watchListSearchableFields = [
  "media.title"
];
var watchListFilterableFields = [
  "media.title"
];
var watchListIncludeConfig = {
  media: true
};

// src/app/module/watchList/watchList.service.ts
var getAll5 = async (user, query) => {
  const queryBuilder = new QueryBuilder(prisma.watchlist, query, {
    searchableFields: watchListSearchableFields,
    filterableFields: watchListFilterableFields
  });
  const result = await queryBuilder.search().filter().where({
    userId: user.userId,
    media: {
      isDeleted: false
    }
  }).include({
    // basic include (lightweight)
    media: true
  }).dynamicInclude(watchListIncludeConfig).paginate().sort().fields().execute();
  return result;
};
var getById5 = async (id) => {
  const result = await prisma.watchlist.findUniqueOrThrow({
    where: { id }
  });
  return result;
};
var create5 = async (user, payload) => {
  const result = await prisma.watchlist.create({
    data: { userId: user.userId, mediaId: payload.mediaId }
  });
  return result;
};
var deleteById5 = async (user, id) => {
  const result = await prisma.$transaction(async (tx) => {
    return await tx.watchlist.delete({ where: { id, userId: user.userId } });
  });
  return result;
};
var deleteAll = async (user) => {
  const result = await prisma.$transaction(async (tx) => {
    return await tx.watchlist.deleteMany({ where: { userId: user.userId } });
  });
  return result;
};
var WatchListService = {
  getAll: getAll5,
  getById: getById5,
  create: create5,
  deleteById: deleteById5,
  deleteAll
};

// src/app/module/watchList/watchList.controller.ts
var getAll6 = catchAsync(async (req, res) => {
  const user = req.user;
  const query = req.query;
  const result = await WatchListService.getAll(user, query);
  sendResponse(res, {
    success: true,
    httpStatusCode: status9.OK,
    message: "WatchList list retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var getById6 = catchAsync(async (req, res) => {
  const result = await WatchListService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    httpStatusCode: status9.OK,
    message: "WatchList retrieved successfully",
    data: result
  });
});
var create6 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await WatchListService.create(user, req.body);
  sendResponse(res, {
    success: true,
    httpStatusCode: status9.CREATED,
    message: "WatchList created successfully",
    data: result
  });
});
var deleteById6 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await WatchListService.deleteById(user, req.params.id);
  sendResponse(res, {
    success: true,
    httpStatusCode: status9.OK,
    message: "WatchList deleted successfully",
    data: result
  });
});
var deleteAll2 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await WatchListService.deleteAll(user);
  sendResponse(res, {
    success: true,
    httpStatusCode: status9.OK,
    message: "All WatchList entries deleted successfully",
    data: result
  });
});
var WatchListController = {
  getAll: getAll6,
  getById: getById6,
  create: create6,
  deleteById: deleteById6,
  deleteAll: deleteAll2
};

// src/app/module/watchList/watchList.route.ts
var router4 = Router4();
router4.get("/", checkAuth(Role.USER), WatchListController.getAll);
router4.get("/:id", checkAuth(Role.USER), WatchListController.getById);
router4.post(
  "/",
  checkAuth(Role.USER),
  WatchListController.create
);
router4.delete("/:id", checkAuth(Role.USER), WatchListController.deleteById);
router4.delete("/", checkAuth(Role.USER), WatchListController.deleteAll);
var WatchListRoutes = router4;

// src/app/module/payment/payment.route.ts
import { Router as Router5 } from "express";
var router5 = Router5();
var PaymentRoutes = router5;

// src/app/module/purchase/purchase.route.ts
import { Router as Router6 } from "express";

// src/app/module/purchase/purchase.controller.ts
import status11 from "http-status";

// src/app/module/purchase/purchase.constant.ts
var purchaseSearchableFields = [
  "media.title",
  "user.name",
  "user.email"
];
var purchaseFilterableFields = [
  "type",
  "createdAt",
  "expiresAt"
];

// src/app/module/purchase/purchase.service.ts
import status10 from "http-status";

// src/app/config/stripe.config.ts
import Stripe from "stripe";
var stripe = new Stripe(envVars.STRIPE.SECRET_KEY);

// src/app/module/purchase/purchase.service.ts
var getAll7 = async (query) => {
  const queryBuilder = new QueryBuilder(prisma.purchase, query, {
    searchableFields: purchaseSearchableFields,
    filterableFields: purchaseFilterableFields
  });
  const result = await queryBuilder.search().filter().include({
    user: {
      select: {
        id: true,
        name: true,
        email: true
      }
    },
    media: {
      select: {
        id: true,
        title: true,
        type: true
      }
    },
    payment: {
      select: {
        id: true,
        status: true,
        amount: true
      }
    }
  }).paginate().sort().fields().execute();
  return result;
};
var getById7 = async (id) => {
  const result = await prisma.purchase.findUniqueOrThrow({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      media: {
        select: {
          id: true,
          title: true,
          type: true,
          price: true
        }
      },
      payment: true
    }
  });
  return result;
};
var create7 = async (user, payload) => {
  const { mediaId, type } = payload;
  const media = await prisma.media.findUnique({
    where: { id: mediaId }
  });
  if (!media) {
    throw new AppError_default(status10.NOT_FOUND, "Media not found");
  }
  const existingPurchase = await prisma.purchase.findUnique({
    where: {
      userId_mediaId_type: {
        userId: user.userId,
        mediaId,
        type
      }
    }
  });
  if (existingPurchase) {
    throw new AppError_default(status10.CONFLICT, "You already have this purchase");
  }
  let price = 0;
  let expiresAt = null;
  if (type === "BUY") {
    price = media.price || 0;
  } else if (type === "RENT") {
    price = (media.price || 0) * 0.3;
    expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1e3);
  } else if (type === "SUBSCRIPTION") {
    price = (media.price || 0) * 0.1;
    expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3);
  }
  const payment = await prisma.payment.create({
    data: {
      amount: price,
      status: PaymentStatus.PENDING,
      // Temporary transaction ID, will be updated by Stripe
      transactionId: `temp_${user.userId}_${mediaId}_${Date.now()}`,
      userId: user.userId,
      mediaId
    }
  });
  const purchase = await prisma.purchase.create({
    data: {
      userId: user.userId,
      mediaId,
      type,
      price,
      expiresAt,
      paymentId: payment.id
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      media: {
        select: {
          id: true,
          title: true
        }
      },
      payment: true
    }
  });
  return {
    purchase,
    paymentId: payment.id,
    message: "Purchase created. Proceed to payment"
  };
};
var createAndCheckout = async (user, payload) => {
  const { mediaId, type } = payload;
  const media = await prisma.media.findUnique({
    where: { id: mediaId }
  });
  if (!media) {
    throw new AppError_default(status10.NOT_FOUND, "Media not found");
  }
  const existingPurchase = await prisma.purchase.findUnique({
    where: {
      userId_mediaId_type: {
        userId: user.userId,
        mediaId,
        type
      }
    }
  });
  if (existingPurchase) {
    throw new AppError_default(status10.CONFLICT, "You already have this purchase");
  }
  let price = 0;
  let expiresAt = null;
  if (type === "BUY") {
    price = media.price || 0;
  } else if (type === "RENT") {
    price = (media.price || 0) * 0.3;
    expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1e3);
  } else if (type === "SUBSCRIPTION") {
    price = (media.price || 0) * 0.1;
    expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3);
  }
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        amount: price,
        status: PaymentStatus.PENDING,
        transactionId: `temp_${user.userId}_${mediaId}_${Date.now()}`,
        userId: user.userId,
        mediaId
      }
    });
    const purchase = await tx.purchase.create({
      data: {
        userId: user.userId,
        mediaId,
        type,
        price,
        expiresAt,
        paymentId: payment.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        media: {
          select: {
            id: true,
            title: true
          }
        },
        payment: true
      }
    });
    return { purchase, payment };
  });
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${result.purchase.media.title} - ${type}`,
            description: `${type} access to ${result.purchase.media.title}`
          },
          unit_amount: Math.round(price * 100)
          // Convert to cents
        },
        quantity: 1
      }
    ],
    metadata: {
      purchaseId: result.purchase.id,
      paymentId: result.payment.id,
      userId: user.userId
    },
    success_url: `${envVars.FRONTEND_URL}/dashboard/purchases/success?purchase_id=${result.purchase.id}&payment_id=${result.payment.id}`,
    cancel_url: `${envVars.FRONTEND_URL}/dashboard/purchases?error=payment_cancelled`
  });
  return {
    purchase: result.purchase,
    paymentUrl: session.url,
    sessionId: session.id,
    message: "Checkout session created. Redirect to payment"
  };
};
var initiatePayment = async (purchaseId, user) => {
  const purchase = await prisma.purchase.findUniqueOrThrow({
    where: {
      id: purchaseId
    },
    include: {
      media: true,
      payment: true,
      user: true
    }
  });
  if (purchase.userId !== user.userId && user.role !== "ADMIN") {
    throw new AppError_default(status10.FORBIDDEN, "You cannot pay for this purchase");
  }
  if (!purchase.payment) {
    throw new AppError_default(status10.NOT_FOUND, "Payment data not found for this purchase");
  }
  if (purchase.payment.status === PaymentStatus.SUCCESS) {
    throw new AppError_default(status10.BAD_REQUEST, "Payment already completed for this purchase");
  }
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${purchase.media.title} - ${purchase.type}`,
            description: `${purchase.type} access to ${purchase.media.title}`
          },
          unit_amount: Math.round(purchase.price * 100)
        },
        quantity: 1
      }
    ],
    metadata: {
      purchaseId: purchase.id,
      paymentId: purchase.payment.id,
      userId: user.userId
    },
    success_url: `${envVars.FRONTEND_URL}/dashboard/purchases/success?purchase_id=${purchase.id}&payment_id=${purchase.payment.id}`,
    cancel_url: `${envVars.FRONTEND_URL}/dashboard/purchases?error=payment_cancelled`
  });
  return {
    paymentUrl: session.url,
    sessionId: session.id,
    message: "Payment session created"
  };
};
var cancelUnpaidPurchases = async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1e3);
  const unpaidPurchases = await prisma.purchase.findMany({
    where: {
      payment: {
        status: PaymentStatus.PENDING,
        createdAt: {
          lte: thirtyMinutesAgo
        }
      }
    },
    include: {
      payment: true
    }
  });
  if (unpaidPurchases.length === 0) {
    return { message: "No unpaid purchases to cancel", count: 0 };
  }
  const purchaseIds = unpaidPurchases.map((p) => p.id);
  const paymentIds = unpaidPurchases.map((p) => p.payment.id);
  await prisma.$transaction(async (tx) => {
    await tx.payment.deleteMany({
      where: {
        id: {
          in: paymentIds
        }
      }
    });
    await tx.purchase.deleteMany({
      where: {
        id: {
          in: purchaseIds
        }
      }
    });
  });
  return {
    message: `${unpaidPurchases.length} unpaid purchases cancelled`,
    count: unpaidPurchases.length
  };
};
var updateById5 = async (user, id, payload) => {
  const purchase = await prisma.purchase.findUnique({
    where: { id }
  });
  if (!purchase) {
    throw new AppError_default(status10.NOT_FOUND, "Purchase not found");
  }
  if (purchase.userId !== user.userId && user.role !== "ADMIN") {
    throw new AppError_default(status10.FORBIDDEN, "You cannot update this purchase");
  }
  const result = await prisma.purchase.update({
    where: { id },
    data: payload,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      media: {
        select: {
          id: true,
          title: true
        }
      }
    }
  });
  return result;
};
var deleteById7 = async (user, id) => {
  const purchase = await prisma.purchase.findUnique({
    where: { id }
  });
  if (!purchase) {
    throw new AppError_default(status10.NOT_FOUND, "Purchase not found");
  }
  if (purchase.userId !== user.userId && user.role !== "ADMIN") {
    throw new AppError_default(status10.FORBIDDEN, "You cannot delete this purchase");
  }
  const result = await prisma.purchase.delete({
    where: { id }
  });
  return result;
};
var hasAccess = async (userId, mediaId) => {
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId,
      mediaId
    }
  });
  if (!purchase) {
    return false;
  }
  if (purchase.type === "RENT" && purchase.expiresAt) {
    return /* @__PURE__ */ new Date() <= purchase.expiresAt;
  }
  return true;
};
var getUserPurchases = async (userId, query) => {
  const queryBuilder = new QueryBuilder(prisma.purchase, query, {
    searchableFields: purchaseSearchableFields,
    filterableFields: purchaseFilterableFields
  });
  const result = await queryBuilder.search().filter().where({ userId }).include({
    media: {
      select: {
        id: true,
        title: true,
        type: true
      }
    },
    payment: {
      select: {
        id: true,
        status: true
      }
    }
  }).paginate().sort().fields().execute();
  return result;
};
var PurchaseService = {
  getAll: getAll7,
  getById: getById7,
  create: create7,
  // Pay later flow
  createAndCheckout,
  // Pay now flow
  initiatePayment,
  // Initiate checkout for unpaid purchase
  cancelUnpaidPurchases,
  // Auto-cancel after 30 min
  updateById: updateById5,
  deleteById: deleteById7,
  hasAccess,
  getUserPurchases
};

// src/app/module/purchase/purchase.controller.ts
var getAll8 = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await PurchaseService.getAll(query);
  sendResponse(res, {
    success: true,
    httpStatusCode: status11.OK,
    message: "Purchases retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var getById8 = catchAsync(async (req, res) => {
  const result = await PurchaseService.getById(req.params.id);
  sendResponse(res, {
    success: true,
    httpStatusCode: status11.OK,
    message: "Purchase retrieved successfully",
    data: result
  });
});
var create8 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await PurchaseService.create(user, req.body);
  res.status(status11.CREATED).json({
    success: true,
    message: result.message,
    data: result.purchase,
    paymentId: result.paymentId
  });
});
var createAndCheckout2 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await PurchaseService.createAndCheckout(user, req.body);
  res.status(status11.CREATED).json({
    success: true,
    message: result.message,
    data: result.purchase,
    paymentUrl: result.paymentUrl,
    sessionId: result.sessionId
  });
});
var initiatePayment2 = catchAsync(async (req, res) => {
  const user = req.user;
  const { purchaseId } = req.params;
  const result = await PurchaseService.initiatePayment(purchaseId, user);
  sendResponse(res, {
    success: true,
    httpStatusCode: status11.OK,
    message: result.message,
    data: result
  });
});
var cancelUnpaidPurchases2 = catchAsync(async (req, res) => {
  const result = await PurchaseService.cancelUnpaidPurchases();
  sendResponse(res, {
    success: true,
    httpStatusCode: status11.OK,
    message: result.message,
    data: result
  });
});
var updateById6 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await PurchaseService.updateById(
    user,
    req.params.id,
    req.body
  );
  sendResponse(res, {
    success: true,
    httpStatusCode: status11.OK,
    message: "Purchase updated successfully",
    data: result
  });
});
var deleteById8 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await PurchaseService.deleteById(
    user,
    req.params.id
  );
  sendResponse(res, {
    success: true,
    httpStatusCode: status11.OK,
    message: "Purchase deleted successfully",
    data: result
  });
});
var getUserPurchases2 = catchAsync(async (req, res) => {
  const user = req.user;
  const query = req.query;
  const result = await PurchaseService.getUserPurchases(user.userId, query);
  sendResponse(res, {
    success: true,
    httpStatusCode: status11.OK,
    message: "User purchases retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var checkAccess = catchAsync(async (req, res) => {
  const user = req.user;
  const mediaId = req.params.mediaId;
  const hasAccess2 = await PurchaseService.hasAccess(user.userId, mediaId);
  sendResponse(res, {
    success: true,
    httpStatusCode: status11.OK,
    message: "Access check completed",
    data: { hasAccess: hasAccess2 }
  });
});
var PurchaseController = {
  getAll: getAll8,
  getById: getById8,
  create: create8,
  // Pay later
  createAndCheckout: createAndCheckout2,
  // Pay now
  initiatePayment: initiatePayment2,
  // Start checkout for unpaid
  cancelUnpaidPurchases: cancelUnpaidPurchases2,
  // Auto-cancel after 30min
  updateById: updateById6,
  deleteById: deleteById8,
  getUserPurchases: getUserPurchases2,
  checkAccess
};

// src/app/module/purchase/purchase.validation.ts
import z4 from "zod";
var createPurchaseZodSchema = z4.object({
  type: z4.enum(["BUY", "RENT", "SUBSCRIPTION"]).refine((val) => val !== void 0, {
    message: "Type must be BUY, RENT, or SUBSCRIPTION"
  }),
  mediaId: z4.string().min(1, "Media ID is required")
});
var updatePurchaseZodSchema = z4.object({
  type: z4.enum(["BUY", "RENT", "SUBSCRIPTION"]).refine((val) => val !== void 0, {
    message: "Type must be BUY, RENT, or SUBSCRIPTION"
  }).optional(),
  price: z4.number().positive("Price must be greater than 0").optional(),
  expiresAt: z4.string().datetime().optional().transform((val) => val ? new Date(val) : void 0)
});
var PurchaseValidation = {
  createPurchaseZodSchema,
  updatePurchaseZodSchema
};

// src/app/module/purchase/purchase.route.ts
var router6 = Router6();
router6.get(
  "/",
  checkAuth(Role.ADMIN),
  PurchaseController.getAll
);
router6.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.USER),
  PurchaseController.getById
);
router6.post(
  "/admin/cancel-unpaid",
  checkAuth(Role.ADMIN),
  PurchaseController.cancelUnpaidPurchases
);
router6.get(
  "/my-purchases/list",
  checkAuth(Role.USER),
  PurchaseController.getUserPurchases
);
router6.get(
  "/access/:mediaId",
  checkAuth(Role.USER),
  PurchaseController.checkAccess
);
router6.post(
  "/",
  checkAuth(Role.USER),
  validateRequest(PurchaseValidation.createPurchaseZodSchema),
  PurchaseController.create
);
router6.post(
  "/checkout",
  checkAuth(Role.USER),
  validateRequest(PurchaseValidation.createPurchaseZodSchema),
  PurchaseController.createAndCheckout
);
router6.post(
  "/:purchaseId/initiate-payment",
  checkAuth(Role.USER),
  PurchaseController.initiatePayment
);
router6.patch(
  "/:id",
  checkAuth(Role.USER),
  validateRequest(PurchaseValidation.updatePurchaseZodSchema),
  PurchaseController.updateById
);
router6.delete(
  "/:id",
  checkAuth(Role.USER),
  PurchaseController.deleteById
);
var PurchaseRoutes = router6;

// src/app/routes/index.ts
var router7 = Router7();
router7.use("/auth", AuthRoutes);
router7.use("/media", MediaRoutes);
router7.use("/reviews", ReviewRoutes);
router7.use("/watch-lists", WatchListRoutes);
router7.use("/payments", PaymentRoutes);
router7.use("/purchases", PurchaseRoutes);
var IndexRoute = router7;

// src/app/middleware/globalErrorHandler.ts
import status14 from "http-status";
import z5 from "zod";

// src/app/errorHelpers/handleZodError.ts
import status12 from "http-status";
var handleZodError = (err) => {
  const statusCode = status12.BAD_REQUEST;
  const message = "Zod Validation Error";
  const errorSources = [];
  err.issues.forEach((issue) => {
    errorSources.push({
      path: issue.path.join("=>"),
      message: issue.message
    });
  });
  return {
    success: false,
    message,
    errorSources,
    statusCode
  };
};

// src/app/utils/deleteUploadedFilesFromGlobalErrorHandler.ts
var deleteUploadedFilesFromGlobalErrorHandler = async (req) => {
  try {
    const filesToDelete = [];
    if (req.file && req.file?.path) {
      filesToDelete.push(req.file.path);
    } else if (req.files && typeof req.files === "object" && !Array.isArray(req.files)) {
      Object.values(req.files).forEach((fileArray) => {
        if (Array.isArray(fileArray)) {
          fileArray.forEach((file) => {
            if (file.path) {
              filesToDelete.push(file.path);
            }
          });
        }
      });
    } else if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      req.files.forEach((file) => {
        if (file.path) {
          filesToDelete.push(file.path);
        }
      });
    }
    if (filesToDelete.length > 0) {
      await Promise.all(
        filesToDelete.map((url) => cloudinaryDelete(url))
      );
      console.log(`
Deleted ${filesToDelete.length} uploaded file(s) from Cloudinary due to an error during request processing.
`);
    }
  } catch (error) {
    console.error("Error deleting uploaded files:", error);
  }
};

// src/app/errorHelpers/handlePrismaErrors.ts
import status13 from "http-status";
var getStatusCodeFromPrismaError = (errorCode) => {
  if (errorCode === "P2002") {
    return status13.CONFLICT;
  }
  if (["P2025", "P2001", "P2015", "P2018"].includes(errorCode)) {
    return status13.NOT_FOUND;
  }
  if (["P1000", "P6002"].includes(errorCode)) {
    return status13.UNAUTHORIZED;
  }
  if (["P1010", "P6010"].includes(errorCode)) {
    return status13.FORBIDDEN;
  }
  if (errorCode === "P6003") {
    return status13.PAYMENT_REQUIRED;
  }
  if (["P1008", "P2004", "P6004"].includes(errorCode)) {
    return status13.GATEWAY_TIMEOUT;
  }
  if (errorCode === "P5011") {
    return status13.TOO_MANY_REQUESTS;
  }
  if (errorCode === "P6009") {
    return 413;
  }
  if (errorCode.startsWith("P1") || ["P2024", "P2037", "P6008"].includes(errorCode)) {
    return status13.SERVICE_UNAVAILABLE;
  }
  if (errorCode.startsWith("P2")) {
    return status13.BAD_REQUEST;
  }
  if (errorCode.startsWith("P3") || errorCode.startsWith("P4")) {
    return status13.INTERNAL_SERVER_ERROR;
  }
  return status13.INTERNAL_SERVER_ERROR;
};
var formatErrorMeta = (meta) => {
  if (!meta) return "";
  const parts = [];
  if (meta.target) {
    parts.push(`field(s): ${String(meta.target)}`);
  }
  if (meta.field_name) {
    parts.push(`Field: ${String(meta.field_name)}`);
  }
  if (meta.column_name) {
    parts.push(`Column: ${String(meta.column_name)}`);
  }
  if (meta.table) {
    parts.push(`Table: ${String(meta.table)}`);
  }
  if (meta.model_name) {
    parts.push(`Model: ${String(meta.model_name)}`);
  }
  if (meta.relation_name) {
    parts.push(`Relation: ${String(meta.relation_name)}`);
  }
  if (meta.constraint) {
    parts.push(`Constraint: ${String(meta.constraint)}`);
  }
  if (meta.database_error) {
    parts.push(`Database Error: ${String(meta.database_error)}`);
  }
  return parts.length > 0 ? parts.join(" |") : "";
};
var PrismaClientKnownRequestError3 = (error) => {
  const statusCode = getStatusCodeFromPrismaError(error.code);
  const metaInfo = formatErrorMeta(error.meta);
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An error occurred with the database operation.";
  const errorSources = [
    {
      path: error.code,
      message: metaInfo ? `${mainMessage} | ${metaInfo}` : mainMessage
    }
  ];
  if (error.meta?.cause) {
    errorSources.push({
      path: "cause",
      message: String(error.meta.cause)
    });
  }
  return {
    success: false,
    statusCode,
    message: `Prisma Client Known Request Error: ${mainMessage}`,
    errorSources
  };
};
var handlePrismaClientUnknownRequestError = (error) => {
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An unknown error occurred with the database operation.";
  const errorSources = [
    {
      path: "Unknown Prisma Error",
      message: mainMessage
    }
  ];
  return {
    success: false,
    statusCode: status13.INTERNAL_SERVER_ERROR,
    message: `Prisma Client Unknown Request Error: ${mainMessage}`,
    errorSources
  };
};
var handlePrismaClientValidationError = (error) => {
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const errorSources = [];
  const fieldMatch = cleanMessage.match(/Argument `(\w+)`/i);
  const fieldName = fieldMatch ? fieldMatch[1] : "Unknown Field";
  const mainMessage = lines.find(
    (line) => !line.includes("Argument") && !line.includes("\u2192") && line.length > 10
  ) || lines[0] || "Invalid query parameters provided to the database operation.";
  errorSources.push({
    path: fieldName,
    message: mainMessage
  });
  return {
    success: false,
    statusCode: status13.BAD_REQUEST,
    message: `Prisma Client Validation Error: ${mainMessage}`,
    errorSources
  };
};
var handlerPrismaClientInitializationError = (error) => {
  const statusCode = error.errorCode ? getStatusCodeFromPrismaError(error.errorCode) : status13.SERVICE_UNAVAILABLE;
  const cleanMessage = error.message;
  cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An error occurred while initializing the Prisma Client.";
  const errorSources = [
    {
      path: error.errorCode || "Initialization Error",
      message: mainMessage
    }
  ];
  return {
    success: false,
    statusCode,
    message: `Prisma Client Initialization Error: ${mainMessage}`,
    errorSources
  };
};
var handlerPrismaClientRustPanicError = () => {
  const errorSources = [{
    path: "Rust Engine Crashed",
    message: "The database engine encountered a fatal error and crashed. This is usually due to an internal bug in the Prisma engine or an unexpected edge case in the database operation. Please check the Prisma logs for more details and consider reporting this issue to the Prisma team if it persists."
  }];
  return {
    success: false,
    statusCode: status13.INTERNAL_SERVER_ERROR,
    message: "Prisma Client Rust Panic Error: The database engine crashed due to a fatal error.",
    errorSources
  };
};

// src/app/middleware/globalErrorHandler.ts
var globalErrorHandler = async (err, req, res) => {
  if (envVars.NODE_ENV === "development") {
    console.error("Error from globalErrorHandler:", err);
  }
  await deleteUploadedFilesFromGlobalErrorHandler(req);
  let errorSources = [];
  let statusCode = status14.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  let stack = void 0;
  if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    const simplifiedError = PrismaClientKnownRequestError3(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    const simplifiedError = handlePrismaClientUnknownRequestError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    const simplifiedError = handlePrismaClientValidationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientRustPanicError) {
    const simplifiedError = handlerPrismaClientRustPanicError();
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    const simplifiedError = handlerPrismaClientInitializationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof z5.ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
  } else if (err instanceof AppError_default) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  } else if (err instanceof Error) {
    statusCode = status14.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  }
  const errorResponse = {
    success: false,
    message,
    errorSources,
    stack: envVars.NODE_ENV === "development" ? stack : void 0,
    error: envVars.NODE_ENV === "development" ? err : void 0
  };
  res.status(statusCode).json(errorResponse);
};

// src/app/middleware/notFound.ts
import status15 from "http-status";
var notFound = (req, res) => {
  res.status(status15.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

// src/app.ts
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import path3 from "path";
import cors from "cors";
import qs from "qs";

// src/app/module/payment/payment.controller.ts
import status17 from "http-status";

// src/app/module/payment/payment.utils.ts
import PDFDocument from "pdfkit";
var generateInvoicePdf = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50
      });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (error) => {
        reject(error);
      });
      doc.fontSize(20).text("MEDIA STREAMING INVOICE", { align: "center" });
      doc.moveDown();
      doc.text(`Invoice ID: ${data.invoiceId}`);
      doc.text(`User: ${data.userName}`);
      doc.text(`Email: ${data.userEmail}`);
      doc.text(`Media: ${data.mediaTitle}`);
      doc.text(`Transaction ID: ${data.transactionId}`);
      doc.text(`Date: ${new Date(data.paymentDate).toLocaleDateString()}`);
      doc.moveDown();
      doc.fontSize(14).text(`Amount Paid: $${data.amount}`);
      doc.moveDown();
      doc.text("Thank you for your purchase \u{1F3AC}");
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// src/app/module/payment/payment.service.ts
import status16 from "http-status";
var handleStripeWebhookEvent = async (event) => {
  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id
    }
  });
  if (existingPayment) {
    console.log(`Event ${event.id} already processed`);
    return { message: "Already processed", data: existingPayment };
  }
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const purchaseId = session.metadata?.purchaseId;
      const paymentId = session.metadata?.paymentId;
      if (!purchaseId || !paymentId) {
        throw new AppError_default(status16.BAD_REQUEST, "Missing purchase or payment metadata");
      }
      const purchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
        include: {
          user: true,
          media: true,
          payment: true
        }
      });
      if (!purchase) {
        throw new AppError_default(status16.NOT_FOUND, "Purchase not found");
      }
      if (!purchase.payment) {
        throw new AppError_default(status16.NOT_FOUND, "Payment not found");
      }
      let invoiceUrl = null;
      if (session.payment_status === "paid") {
        try {
          const pdfBuffer = await generateInvoicePdf({
            invoiceId: paymentId,
            userName: purchase.user.name,
            userEmail: purchase.user.email,
            mediaTitle: purchase.media?.title || "Media",
            amount: purchase.price,
            transactionId: purchase.payment.transactionId || "",
            paymentDate: (/* @__PURE__ */ new Date()).toISOString()
          });
          const cloudinaryResponse = await uploadFileToCloudinary(
            pdfBuffer,
            `invoice-${paymentId}.pdf`
          );
          invoiceUrl = cloudinaryResponse.secure_url;
          console.log("\u2705 Invoice uploaded to Cloudinary:", invoiceUrl);
        } catch (err) {
          console.error("\u274C Invoice generation/upload error:", err);
        }
      }
      const result = await prisma.$transaction(async (tx) => {
        const updatedPurchase = await tx.purchase.update({
          where: { id: purchaseId },
          data: {
            // RENT expiry logic
            expiresAt: purchase.type === PurchaseType.RENT ? new Date(Date.now() + 48 * 60 * 60 * 1e3) : null
          }
        });
        const updatedPayment = await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: session.payment_status === "paid" ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
            paymentGatewayData: session,
            stripeEventId: event.id,
            invoiceUrl
          }
        });
        return { updatedPurchase, updatedPayment };
      });
      console.log("\u2705 Payment success for purchase:", purchaseId);
      if (session.payment_status === "paid") {
        try {
          await sendEmail({
            to: purchase.user.email,
            subject: `Invoice for ${purchase.media?.title || "Media"} Purchase`,
            templateName: "invoice",
            templateData: {
              userName: purchase.user.name,
              userEmail: purchase.user.email,
              invoiceId: paymentId,
              mediaTitle: purchase.media?.title || "Media",
              transactionId: purchase.payment.transactionId || "",
              paymentDate: (/* @__PURE__ */ new Date()).toISOString(),
              amount: purchase.price,
              invoiceUrl
              // ✅ Pass Cloudinary URL to template
            },
            attachments: invoiceUrl ? [
              {
                filename: `invoice-${paymentId}.pdf`,
                content: await generateInvoicePdf({
                  invoiceId: paymentId,
                  userName: purchase.user.name,
                  userEmail: purchase.user.email,
                  mediaTitle: purchase.media?.title || "Media",
                  amount: purchase.price,
                  transactionId: purchase.payment.transactionId || "",
                  paymentDate: (/* @__PURE__ */ new Date()).toISOString()
                }),
                contentType: "application/pdf"
              }
            ] : void 0
          });
          console.log("\u2705 Invoice email sent to:", purchase.user.email);
        } catch (err) {
          console.error("\u274C Email sending error:", err);
        }
      }
      return result;
    }
    case "checkout.session.expired": {
      console.log("Checkout session expired");
      return { message: "Checkout session expired" };
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      console.log("Payment failed for intent:", paymentIntent.id);
      try {
        const payment = await prisma.payment.findUnique({
          where: { stripePaymentIntentId: paymentIntent.id }
        });
        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.FAILED,
              stripeEventId: event.id
            }
          });
        }
      } catch (err) {
        console.error("Error updating failed payment:", err);
      }
      return { message: "Payment failed processed" };
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
      return { message: `Unhandled event type: ${event.type}` };
  }
};
var PaymentService = {
  handleStripeWebhookEvent
};

// src/app/module/payment/payment.controller.ts
var handleStripeWebhookEvent2 = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const webhookSecret = envVars.STRIPE.WEBHOOK_SECRET;
  console.log("\u{1F514} Webhook received:", {
    signature: signature ? "present" : "missing",
    webhookSecret: webhookSecret ? "present" : "missing"
  });
  if (!signature || !webhookSecret) {
    console.error("\u274C Missing Stripe signature or webhook secret");
    return res.status(status17.BAD_REQUEST).json({ message: "Missing signature or secret" });
  }
  let event;
  try {
    const body = typeof req.body === "string" ? req.body : Buffer.from(req.body).toString("utf8");
    console.log("\u{1F4E6} Raw body type:", typeof req.body);
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log("\u2705 Event constructed:", event.type, event.id);
  } catch (error) {
    console.error("\u274C Webhook signature verification failed:", {
      error: error.message,
      signature: signature ? "provided" : "missing"
    });
    return res.status(status17.BAD_REQUEST).json({
      error: "Webhook Error",
      message: error.message
    });
  }
  try {
    console.log("\u{1F4E5} Processing event:", event.type);
    await PaymentService.handleStripeWebhookEvent(event);
    console.log("\u2705 Event processed successfully:", event.type);
    res.status(status17.OK).json({
      received: true,
      message: "Event processed",
      event_type: event.type
    });
  } catch (error) {
    console.error("\u274C Error handling Stripe webhook event:", {
      type: event.type,
      id: event.id,
      error: error.message,
      stack: error.stack
    });
    res.status(status17.OK).json({
      received: true,
      message: "Event received but processing failed",
      event_type: event.type,
      error: error.message
    });
  }
};
var PaymentController = {
  handleStripeWebhookEvent: handleStripeWebhookEvent2
};

// src/app.ts
import cron from "node-cron";
var app = express();
app.set("query parser", (str) => qs.parse(str));
app.set("view engine", "ejs");
app.set("views", path3.resolve(process.cwd(), `src/app/templates`));
app.post("/webhook", express.raw({ type: "application/json" }), PaymentController.handleStripeWebhookEvent);
app.use(cors({
  origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, "http://localhost:3000", "http://localhost:8001"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use("/api/auth", toNodeHandler(auth));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
cron.schedule("*/25 * * * *", async () => {
  try {
    await PurchaseService.cancelUnpaidPurchases();
    console.log("Cron job completed: Unpaid purchases cancelled successfully.");
  } catch (error) {
    console.error("Error during cron job execution:", error.message);
  }
});
app.use("/api/v1", IndexRoute);
app.get("/", (req, res) => {
  res.send("Hello, TypeScript + Express!");
});
app.use(globalErrorHandler);
app.use(notFound);
var app_default = app;

// src/app/utils/seed.ts
var seedAdmin = async () => {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: envVars.ADMIN_EMAIL
      }
    });
    if (existingAdmin) {
      console.log("\u2705 Admin already exists. Skipping seeding.");
      return;
    }
    const admin = await auth.api.signUpEmail({
      body: {
        email: envVars.ADMIN_EMAIL,
        password: envVars.ADMIN_PASSWORD,
        name: "Admin",
        role: Role.ADMIN,
        needPasswordChange: false,
        rememberMe: false
      }
    });
    await prisma.user.update({
      where: {
        id: admin.user.id
      },
      data: {
        emailVerified: true
      }
    });
    console.log("\u{1F680} Admin seeded successfully:", admin.user.email);
  } catch (error) {
    console.error("\u274C Error seeding admin:", error);
    try {
      await prisma.user.delete({
        where: {
          email: envVars.ADMIN_EMAIL
        }
      });
    } catch {
      console.log("Cleanup skipped");
    }
  }
};

// src/server.ts
var server;
var bootstrap = async () => {
  try {
    await seedAdmin();
    server = app_default.listen(envVars.PORT, () => {
      console.log(`Server is running on http://localhost:${envVars.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received. Shutting down server...");
  if (server) {
    server.close(() => {
      console.log("Server closed gracefully.");
      process.exit(1);
    });
  }
  process.exit(1);
});
process.on("SIGINT", () => {
  console.log("SIGINT signal received. Shutting down server...");
  if (server) {
    server.close(() => {
      console.log("Server closed gracefully.");
      process.exit(1);
    });
  }
  process.exit(1);
});
process.on("uncaughtException", (error) => {
  console.log("Uncaught Exception Detected... Shutting down server", error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
process.on("unhandledRejection", (error) => {
  console.log("Unhandled Rejection Detected... Shutting down server", error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
bootstrap();
