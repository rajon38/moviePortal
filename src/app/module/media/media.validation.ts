import z from "zod";

const createMediaZodSchema = z.object({
  title: z
    .string("Title must be a string")
    .min(1, "Title cannot be empty")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string("Description must be a string")
    .min(1, "Description cannot be empty"),
  type: z.enum(["MOVIE", "TV_SHOW"], "Type must be either MOVIE or TV_SHOW"),
  releaseYear: z
    .number( "Release year must be a number")
    .int("Release year must be an integer")
    .min(1888, "Release year must be after 1888")
    .max(new Date().getFullYear(), "Release year cannot be in the future"),
  director: z
    .string("Director must be a string")
    .min(1, "Director cannot be empty")
    .max(100, "Director must be less than 100 characters"),
  cast: z.array(
    z.string("Cast member must be a string").min(1, "Cast member cannot be empty").max(100, "Cast member must be less than 100 characters")
  ).min(1, "At least one cast member is required"),
  genres: z.array(
    z.string("Genre must be a string").min(1, "Genre cannot be empty").max(50, "Genre must be less than 50 characters")
  ).min(1, "At least one genre is required"),
  platform: z.array(
    z.string("Platform must be a string").min(1, "Platform cannot be empty").max(50, "Platform must be less than 50 characters")
  ).min(1, "At least one platform is required"),
  pricing: z.enum(["FREE", "PAID"], "Pricing must be either FREE or PAID"),
  price: z.number("Price must be a number").optional(),
  youtubeLink: z.string("YouTube link must be a string").url("YouTube link must be a valid URL").optional(),
});

const updateMediaZodSchema = z.object({
  title: z
    .string("Title must be a string")
    .min(1, "Title cannot be empty")
    .max(100, "Title must be less than 100 characters")
    .optional(),
  description: z
    .string("Description must be a string")
    .min(1, "Description cannot be empty")
    .optional(),
  type: z.enum(["MOVIE", "TV_SHOW"], "Type must be either MOVIE or TV_SHOW").optional(),
  releaseYear: z
    .number( "Release year must be a number")
    .int("Release year must be an integer")
    .min(1888, "Release year must be after 1888")
    .max(new Date().getFullYear(), "Release year cannot be in the future")
    .optional(),
  director: z
    .string("Director must be a string")
    .min(1, "Director cannot be empty")
    .max(100, "Director must be less than 100 characters")
    .optional(),
  cast: z.array(
    z.string("Cast member must be a string").min(1, "Cast member cannot be empty").max(100, "Cast member must be less than 100 characters")
  ).min(1, "At least one cast member is required").optional(),
  genres: z.array(
    z.string("Genre must be a string").min(1, "Genre cannot be empty").max(50, "Genre must be less than 50 characters")
  ).min(1, "At least one genre is required").optional(),
  platform: z.array(
    z.string("Platform must be a string").min(1, "Platform cannot be empty").max(50, "Platform must be less than 50 characters")
  ).min(1, "At least one platform is required").optional(),
  pricing: z.enum(["FREE", "PAID"], "Pricing must be either FREE or PAID").optional(),
  price: z.number("Price must be a number").optional(),
  youtubeLink: z.string("YouTube link must be a string").url("YouTube link must be a valid URL").optional(),
});

export const MediaValidation = {
  createMediaZodSchema,
  updateMediaZodSchema,
};
