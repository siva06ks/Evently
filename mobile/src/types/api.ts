import type { WarmthEventCategory } from "../store/useWarmthStore";

/** Matches backend `toEvent` JSON */
export type ApiEvent = {
  id: number;
  title: string;
  organizerEmail: string;
  date: string;
  category: WarmthEventCategory;
  location: string;
  description: string;
  priceLabel: string;
  summary: string | null;
  dateDetail: string | null;
  timeRange: string | null;
  aboutLong: string | null;
  heroImageUrl: string | null;
  mapImageUrl: string | null;
  organizerName: string | null;
  organizerAvatarUrl: string | null;
  dateLabel: string;
  createdAt?: string;
};

export type ApiUser = {
  id: number;
  identifier: string;
  totalCapacity: number;
  earlyBirdLimit: number;
};
