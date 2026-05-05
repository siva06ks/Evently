import type { ApiEvent } from "../types/api";
import type { WarmthEvent } from "../store/useWarmthStore";

export function apiEventToWarmth(e: ApiEvent): WarmthEvent {
  return {
    id: String(e.id),
    title: e.title,
    category: e.category,
    dateLabel: e.dateLabel,
    location: e.location,
    priceLabel: e.priceLabel,
    description: e.description,
    summary: e.summary ?? undefined,
    dateDetail: e.dateDetail ?? undefined,
    timeRange: e.timeRange ?? undefined,
    aboutLong: e.aboutLong ?? undefined,
    heroImageUrl: e.heroImageUrl ?? undefined,
    mapImageUrl: e.mapImageUrl ?? undefined,
    organizerName: e.organizerName ?? undefined,
    organizerAvatarUrl: e.organizerAvatarUrl ?? undefined,
    apiDate: e.date,
  };
}
