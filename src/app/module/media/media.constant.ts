import { Prisma } from "../../../generated/prisma/client";

// 🔍 Searchable fields (used for search query)
export const mediaSearchableFields = [
  "title",
  "description",
  "director",
  "cast",
  "genres",
  "platform"
];

// 🎯 Filterable fields (used for filtering)
export const mediaFilterableFields = [
  "type",
  "releaseYear",
  "genres",
  "platform",
  "price",
  "createdAt"
];

// 📦 Include config (relations to include in queries)
export const mediaIncludeConfig: Partial<
  Record<
    keyof Prisma.MediaInclude,
    Prisma.MediaInclude[keyof Prisma.MediaInclude]
  >
> = {
  reviews: {
    include: {
      user: true
    }
  },
  purchases: {
    include: {
      user: true,
    }
  },
  watchlist: {
    include: {
      user: true
    }
  },
};