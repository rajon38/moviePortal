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
// }


export interface ICreateReviewPayload {
  rating: number;
  content: string;
  tags?: string[];
  spoiler?: boolean;
  mediaId: string;
}

export interface IUpdateReviewPayload {
  rating?: number;
  content?: string;
  tags?: string[];
  spoiler?: boolean;
}

// model Comment {
//   id          String     @id @default(uuid())
//   content     String

//   userId      String
//   reviewId    String
//   parentId    String?

//   createdAt   DateTime   @default(now())

//   user        User       @relation(fields: [userId], references: [id])
//   review      Review     @relation(fields: [reviewId], references: [id])

//   parent      Comment?   @relation("CommentToComment", fields: [parentId], references: [id])
//   replies     Comment[]  @relation("CommentToComment")
// }

export interface ICreateCommentPayload {
  content: string;
  reviewId: string;
  parentId?: string;
}