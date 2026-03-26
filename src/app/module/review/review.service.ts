import { Prisma, Review } from "../../../generated/prisma/client.js";
import { ReviewStatus } from "../../../generated/prisma/enums.js";
import { IQueryParams } from "../../interfaces/query.interface.js";
import { IRequestUser } from "../../interfaces/requestUser.interface.js";
import { prisma } from "../../lib/prisma.js";
import { QueryBuilder } from "../../utils/queryBuilder.js";
import { reviewFilterableFields, reviewIncludeConfig, reviewSearchableFields } from "./review.constant.js";
import { ICreateCommentPayload, ICreateReviewPayload, IUpdateReviewPayload } from "./review.interface.js";

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
          image: true,
        },
      },
      media: {
        select: {
          id: true,
          title: true,
        },
      },
      comments: {
        where: {
          parentId: null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
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
      comments: {
        where: {
          parentId: null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
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

//toggle like for a review
const toggleLike = async (user: IRequestUser, id: string) => {
  const existingReview = await prisma.review.findUnique({ where: { id } });
  if (!existingReview || existingReview.isDeleted) {
    throw new Error("Review not found");
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_reviewId: {
        userId: user.userId,
        reviewId: existingReview.id,
      },
    },
  });

  if (existingLike) {
    // If like exists, remove it (unlike)
    await prisma.like.delete({
      where: {
        userId_reviewId: {
          userId: user.userId,
          reviewId: existingReview.id,
        },
      },
    });
    return {
      liked: false,
      message: "Review unliked successfully",
    };
  } else {
    // If like doesn't exist, create it
    await prisma.like.create({
      data: {
        userId: user.userId,
        reviewId: existingReview.id,
      },
    });
    return {
      liked: true,
      message: "Review liked successfully",
    };
  }
};

// Additional functions for comments can be added here (e.g., createComment, deleteComment, etc.)
const createComment = async (user: IRequestUser, payload: ICreateCommentPayload) => {
  const existingReview = await prisma.review.findUnique({ where: { id: payload.reviewId } });
  if (!existingReview || existingReview.isDeleted) {
    throw new Error("Review not found");
  }

  const result = await prisma.comment.create({
    data: {
      ...payload,
      userId: user.userId,
    },
  });
  return result;
}

const updateComment = async (user: IRequestUser, id: string, payload: { content: string }) => {
  const existingComment = await prisma.comment.findUnique({ where: { id } });
  if (!existingComment) {
    throw new Error("Comment not found");
  }
  if (existingComment.userId !== user.userId) {
    throw new Error("Unauthorized");
  }

  const result = await prisma.comment.update({
    where: { id },
    data: { content: payload.content },
  });
  return result;
}

const deleteComment = async (user: IRequestUser, id: string) => {
  const existingComment = await prisma.comment.findUnique({ where: { id } });
  if (!existingComment) {
    throw new Error("Comment not found");
  }
  if (existingComment.userId !== user.userId) {
    throw new Error("Unauthorized");
  }

  const result = await prisma.comment.delete({
    where: { id },
  });
  return result;
}

export const ReviewService = {
  getAll,
  getById,
  create,
  updateById,
  updateStatusById,
  deleteById,
  toggleLike,
  createComment,
  updateComment,
  deleteComment,
};