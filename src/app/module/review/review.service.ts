import { Prisma, Review } from "../../../generated/prisma/client.js";
import { ReviewStatus } from "../../../generated/prisma/enums.js";
import { IQueryParams } from "../../interfaces/query.interface.js";
import { IRequestUser } from "../../interfaces/requestUser.interface.js";
import { prisma } from "../../lib/prisma.js";
import { QueryBuilder } from "../../utils/queryBuilder.js";
import { reviewFilterableFields, reviewIncludeConfig, reviewSearchableFields } from "./review.constant.js";
import { ICreateReviewPayload, IUpdateReviewPayload } from "./review.interface.js";

const getAll = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Review,
    Prisma.ReviewWhereInput,
    Prisma.ReviewInclude
  >(prisma.review, query, {
    searchableFields: reviewSearchableFields,
    filterableFields: reviewFilterableFields,
  });
const result = await queryBuilder
    .search()
    .filter()
    .where({
      isDeleted: false,
    })
    .include({
      // basic include (lightweight)
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
    })
    .dynamicInclude(reviewIncludeConfig)
    .paginate()
    .sort()
    .fields()
    .execute();
  return result;
}

const getById = async (id: string) => {
  const result = await prisma.review.findUniqueOrThrow({
    where: { id },
  });
  return result;
};

const create = async (user: IRequestUser, payload: ICreateReviewPayload) => {
  const result = await prisma.review.create({
    data: {
      ...payload,
      userId: user.userId,
    },
  });
  return result;
};

const updateById = async (
  user: IRequestUser,
  id: string,
  payload: IUpdateReviewPayload
) => {
  await prisma.review.findUniqueOrThrow({ where: { id , userId: user.userId } });

  const result = await prisma.$transaction(async (tx) => {
    return await tx.review.update({
      where: { id },
      data: { ...payload },
    });
  });

  return result;
};

const updateStatusById = async (id: string, data: ReviewStatus) => {
  await prisma.review.findUniqueOrThrow({ where: { id } });

  const result = await prisma.$transaction(async (tx) => {
    return await tx.review.update({
      where: { id },
      data: { status: data },
    });
  });

  return result;
}

const deleteById = async (id: string) => {
  const result = await prisma.$transaction(async (tx) => {
    return await tx.review.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  });
  return result;
};

export const ReviewService = {
  getAll,
  getById,
  create,
  updateById,
  updateStatusById,
  deleteById,
};
