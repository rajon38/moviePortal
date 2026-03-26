import { Prisma, Watchlist } from "../../../generated/prisma/client.js";
import { IQueryParams } from "../../interfaces/query.interface.js";
import { IRequestUser } from "../../interfaces/requestUser.interface.js";
import { prisma } from "../../lib/prisma.js";
import { QueryBuilder } from "../../utils/queryBuilder.js";
import { watchListFilterableFields, watchListIncludeConfig, watchListSearchableFields } from "./watchList.constant.js";
import { ICreateWatchListPayload } from "./watchList.interface.js";

const getAll = async (user: IRequestUser, query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Watchlist,
    Prisma.WatchlistWhereInput,
    Prisma.WatchlistInclude
  >(prisma.watchlist, query, {
    searchableFields: watchListSearchableFields,
    filterableFields: watchListFilterableFields,
  });
const result = await queryBuilder
    .search()
    .filter()
    .where({
      userId: user.userId,
      media: {
        isDeleted: false,
      }
    })
    .include({
      // basic include (lightweight)
      media: true,
    })
    .dynamicInclude(watchListIncludeConfig)
    .paginate()
    .sort()
    .fields()
    .execute();
  return result;
}

const getById = async (id: string) => {
  const result = await prisma.watchlist.findUniqueOrThrow({
    where: { id },
  });
  return result;
};

const create = async (user: IRequestUser, payload: ICreateWatchListPayload) => {
  const result = await prisma.watchlist.create({
    data: { userId: user.userId, mediaId: payload.mediaId },
  });
  return result;
};

const deleteById = async (user: IRequestUser, id: string) => {
  const result = await prisma.$transaction(async (tx) => {
    return await tx.watchlist.delete({ where: { id, userId: user.userId } });
  });
  return result;
};

const deleteAll = async (user: IRequestUser,) => {
  const result = await prisma.$transaction(async (tx) => {
    return await tx.watchlist.deleteMany({ where: { userId: user.userId } });
  });
  return result;
};

export const WatchListService = {
  getAll,
  getById,
  create,
  deleteById,
  deleteAll,
};
