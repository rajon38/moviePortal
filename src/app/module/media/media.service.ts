import { Media, Prisma } from "../../../generated/prisma/client.js";
import { IQueryParams } from "../../interfaces/query.interface.js";
import { IRequestUser } from "../../interfaces/requestUser.interface.js";
import { prisma } from "../../lib/prisma.js";
import { QueryBuilder } from "../../utils/queryBuilder.js";
import { mediaFilterableFields, mediaIncludeConfig, mediaSearchableFields } from "./media.constant.js";
import { ICreateMediaPayload, IUpdateMediaPayload } from "./media.interface.js";

export const getAll = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Media,
    Prisma.MediaWhereInput,
    Prisma.MediaInclude
  >(prisma.media, query, {
    searchableFields: mediaSearchableFields,
    filterableFields: mediaFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({
      isDeleted: false,
    })
    .include({
      // basic include (lightweight)
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
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
        },
      },
    })
    .dynamicInclude(mediaIncludeConfig)
    .paginate()
    .sort()
    .fields()
    .execute();

  // Add average rating to each media
  const dataWithAvgRating = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result.data.map(async (media: any) => {
      const avgRating = await prisma.review.aggregate({
        where: {
          mediaId: media.id,
          isDeleted: false,
        },
        _avg: {
          rating: true,
        },
      });
      
      return {
        ...media,
        avgRating: avgRating._avg.rating ? parseFloat(avgRating._avg.rating.toFixed(2)) : null,
      };
    })
  );

  return {
    ...result,
    data: dataWithAvgRating,
  };
};

const getById = async (id: string) => {
  const result = await prisma.media.findUniqueOrThrow({
    where: { id, isDeleted: false },
    include: {
      reviews: {
        include: {
          user: true,
        },
      },
    }
  });

  // Get average rating
  const avgRating = await prisma.review.aggregate({
    where: {
      mediaId: id,
      isDeleted: false,
    },
    _avg: {
      rating: true,
    },
  });

  return {
    ...result,
    avgRating: avgRating._avg.rating ? parseFloat(avgRating._avg.rating.toFixed(2)) : null,
  };
};

const create = async (user: IRequestUser, payload: ICreateMediaPayload) => {
  const result = await prisma.media.create({
    data: {
      ...payload,
    }
  });
  return result;
};

const updateById = async (
  id: string,
  payload: IUpdateMediaPayload
) => {
  await prisma.media.findUniqueOrThrow({ where: { id } });

  const result = await prisma.$transaction(async (tx) => {
    return await tx.media.update({
      where: { id },
      data: { ...payload },
    });
  });

  return result;
};

const deleteById = async (id: string) => {
  await prisma.media.findUniqueOrThrow({
    where: { id, isDeleted: false },
  });

  const result = await prisma.$transaction(async (tx) => {
    return await tx.media.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  });
  return result;
};

export const MediaService = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
