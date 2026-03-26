import { Prisma } from "../../../generated/prisma/client";

// 🔍 Searchable fields (used for search query)
export const watchListSearchableFields = [
  "media.title"
];

// 🎯 Filterable fields (used for filtering)
export const watchListFilterableFields = [
  "media.title",
];

// 📦 Include config (relations to include in queries)
export const watchListIncludeConfig: Partial<
  Record<
    keyof Prisma.WatchlistInclude,
    Prisma.WatchlistInclude[keyof Prisma.WatchlistInclude]
  >
> = {
  media: true
};