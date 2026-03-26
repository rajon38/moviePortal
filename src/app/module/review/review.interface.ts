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
