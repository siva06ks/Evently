import type { ApiEvent } from "../types/api";
import type { WarmthEvent } from "../store/useWarmthStore";

function strOrUndefined(value: string | null | undefined) {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function apiEventToWarmth(e: ApiEvent): WarmthEvent {
  return {
    id: String(e.id),
    title: e.title,
    category: e.category,
    dateLabel: e.dateLabel,
    location: e.location,
    priceLabel: e.priceLabel,
    description: e.description,
    summary: strOrUndefined(e.summary),
    dateDetail: strOrUndefined(e.dateDetail),
    timeRange: strOrUndefined(e.timeRange),
    aboutLong: strOrUndefined(e.aboutLong),
    heroImageUrl: strOrUndefined(e.heroImageUrl),
    mapImageUrl: strOrUndefined(e.mapImageUrl),
    organizerName: strOrUndefined(e.organizerName),
    organizerAvatarUrl: strOrUndefined(e.organizerAvatarUrl),
    apiDate: e.date,
  };
}
