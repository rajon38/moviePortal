import z from "zod";

const createReviewZodSchema = z.object({
  rating: z.number("Rating must be a number").int("Rating must be an integer").min(1, "Rating must be at least 1").max(5, "Rating cannot be more than 5"),
  content: z.string("Content must be a string").min(1, "Content cannot be empty"),
  tags: z.array(z.string("Tag must be a string").min(1, "Tag cannot be empty").max(50, "Tag must be less than 50 characters")).optional(),
  spoiler: z.boolean("Spoiler must be a boolean").optional(),
  mediaId: z.string("Media ID must be a string").min(1, "Media ID is required"),
});

const updateReviewZodSchema = z.object({
  rating: z.number("Rating must be a number").int("Rating must be an integer").min(1, "Rating must be at least 1").max(5, "Rating cannot be more than 5").optional(),
  content: z.string("Content must be a string").min(1, "Content cannot be empty").optional(),
  tags: z.array(z.string("Tag must be a string").min(1, "Tag cannot be empty").max(50, "Tag must be less than 50 characters")).optional(),
  spoiler: z.boolean("Spoiler must be a boolean").optional(),
});

export const ReviewValidation = {
  createReviewZodSchema,
  updateReviewZodSchema,
};
