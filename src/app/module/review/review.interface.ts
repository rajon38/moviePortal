

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


export interface ICreateCommentPayload {
  content: string;
  reviewId: string;
  parentId?: string;
}