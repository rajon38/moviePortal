// model Review {
//   id          String        @id @default(uuid())
//   rating      Int           // 1-5
//   content     String
//   tags        String[]
//   spoiler     Boolean       @default(false)
//   status      ReviewStatus  @default(PENDING)

//   userId      String
//   mediaId     String

//   isDeleted   Boolean       @default(false)
//   deletedAt   DateTime?

//   createdAt   DateTime      @default(now())
//   updatedAt   DateTime      @updatedAt

//   user        User          @relation(fields: [userId], references: [id])
//   media       Media         @relation(fields: [mediaId], references: [id])
//   comments    Comment[]
//   likes       Like[]
// }

import { Prisma } from "../../../generated/prisma/client";

// 🔍 Searchable fields (used for search query)
export const reviewSearchableFields = [
    "media.title",
];

// 🎯 Filterable fields (used for filtering)
export const reviewFilterableFields = [
  "media.title",
];

// 📦 Include config (relations to include in queries)
export const reviewIncludeConfig: Partial<
  Record<
    keyof Prisma.ReviewInclude,
    Prisma.ReviewInclude[keyof Prisma.ReviewInclude]
  >
> = {
    user: {
        select: {
            id: true,
            name: true,
            email: true,
        }
    },
    media: {
        select: {
            id: true,
            title: true,
        }
    },
};