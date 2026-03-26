import { MediaType, PricingType } from "../../../generated/prisma/enums";


export interface ICreateMediaPayload {
    title: string;
    imageUrl?: string;
    description: string;
    type: MediaType;
    releaseYear: number;
    director: string;
    cast: string[];
    genres: string[];
    platform: string[];
    pricing: PricingType;
    price?: number;
    youtubeLink?: string;
}

export interface IUpdateMediaPayload {
    title?: string;
    imageUrl?: string;
    description?: string;
    type?: MediaType;
    releaseYear?: number;
    director?: string;
    cast?: string[];
    genres?: string[];
    platform?: string[];
    pricing?: PricingType;
    price?: number;
    youtubeLink?: string;
}
