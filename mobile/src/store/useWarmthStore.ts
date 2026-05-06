import { Alert } from "react-native";
import { create } from "zustand";
import type { ApiEvent, ApiUser } from "../types/api";
import { api } from "../services/api";
import { apiEventToWarmth } from "../services/mapApiEvent";
import { useAuthStore } from "./useAuthStore";

export type WarmthEventCategory = "Arts" | "Health" | "Social" | "Learning" | "Technology";

export type WarmthEvent = {
  id: string;
  title: string;
  category: WarmthEventCategory;
  dateLabel: string;
  location: string;
  priceLabel: string;
  description: string;
  summary?: string;
  dateDetail?: string;
  timeRange?: string;
  aboutLong?: string;
  heroImageUrl?: string;
  mapImageUrl?: string;
  organizerName?: string;
  organizerAvatarUrl?: string;
  /** ISO YYYY-MM-DD when synced from API */
  apiDate?: string;
};

export type WarmthTicket = {
  ticketId: string;
  eventId: string;
  attendeeName: string;
  createdAt: number;
};

export type WarmthCreateInput = Omit<WarmthEvent, "id" | "apiDate"> & {
  /** Required for API */
  date: string;
};

type WarmthState = {
  events: WarmthEvent[];
  savedEventIds: string[];
  tickets: WarmthTicket[];
  totalCapacity: number;
  earlyBirdLimit: number;
  loading: boolean;
  error: string | null;

  refreshFromApi: () => Promise<void>;
  toggleSavedEvent: (eventId: string) => Promise<void>;
  addTicketForEvent: (eventId: string, attendeeName: string) => Promise<WarmthTicket>;
  updateTicketLimits: (nextTotal: number, nextEarly: number) => Promise<void>;
  createEvent: (payload: WarmthCreateInput) => Promise<string>;
  updateEvent: (eventId: string, payload: Omit<WarmthEvent, "id"> & { apiDate?: string }) => Promise<void>;
};

export const useWarmthStore = create<WarmthState>()((set, get) => ({
  events: [],
  savedEventIds: [],
  tickets: [],
  totalCapacity: 150,
  earlyBirdLimit: 50,
  loading: false,
  error: null,

  refreshFromApi: async () => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const { data: eventsData } = await api.get<ApiEvent[]>("/events");
      const events = eventsData.map(apiEventToWarmth);

      let savedEventIds: string[] = [];
      let tickets: WarmthTicket[] = [];
      let totalCapacity = get().totalCapacity;
      let earlyBirdLimit = get().earlyBirdLimit;

      if (token) {
        try {
          const { data } = await api.get<number[]>("/saved-events");
          savedEventIds = data.map(String);
        } catch {
          savedEventIds = [];
        }
        try {
          const { data } = await api.get<
            Array<{
              eventId: string;
              ticketId: string;
              attendeeName: string;
              createdAt: number;
            }>
          >("/tickets");
          tickets = data.map((t) => ({
            ticketId: t.ticketId,
            eventId: String(t.eventId),
            attendeeName: t.attendeeName,
            createdAt: t.createdAt,
          }));
        } catch {
          tickets = [];
        }
        try {
          const { data: me } = await api.get<ApiUser>("/me");
          totalCapacity = me.totalCapacity;
          earlyBirdLimit = me.earlyBirdLimit;
          useAuthStore.getState().patchUser({
            totalCapacity: me.totalCapacity,
            earlyBirdLimit: me.earlyBirdLimit,
          });
        } catch {
          /* keep prior limits */
        }
      }

      set({
        events,
        savedEventIds,
        tickets,
        totalCapacity,
        earlyBirdLimit,
        loading: false,
      });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      const message =
        err?.response?.data?.message ?? err?.message ?? "Could not load data. Is the API running?";
      set({ loading: false, error: message });
    }
  },

  toggleSavedEvent: async (eventId: string) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      Alert.alert("Sign in required", "Please log in to save events.");
      return;
    }
    const numericId = Number(eventId);
    if (!Number.isInteger(numericId)) return;

    const isSaved = get().savedEventIds.includes(eventId);
    try {
      if (isSaved) {
        await api.delete(`/saved-events/${numericId}`);
        set((s) => ({
          savedEventIds: s.savedEventIds.filter((id) => id !== eventId),
        }));
      } else {
        await api.post(`/saved-events/${numericId}`);
        set((s) => ({
          savedEventIds: [...s.savedEventIds, eventId],
        }));
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      Alert.alert("Error", err?.response?.data?.message ?? err?.message ?? "Request failed");
    }
  },

  addTicketForEvent: async (eventId: string, attendeeName: string) => {
    const { data } = await api.post<{
      ticketId: string;
      eventId: string;
      attendeeName: string;
      createdAt: number;
    }>("/tickets", {
      eventId: Number(eventId),
      attendeeName,
    });
    const ticket: WarmthTicket = {
      ticketId: data.ticketId,
      eventId: data.eventId,
      attendeeName: data.attendeeName,
      createdAt: data.createdAt,
    };
    set((s) => ({
      tickets: [ticket, ...s.tickets.filter((t) => t.ticketId !== ticket.ticketId)],
    }));
    return ticket;
  },

  updateTicketLimits: async (nextTotal: number, nextEarly: number) => {
    const totalCapacity = Math.max(nextTotal, 1);
    const earlyBirdLimit = Math.max(Math.min(nextEarly, totalCapacity), 0);
    const token = useAuthStore.getState().token;
    if (token) {
      await api.patch("/me/limits", { totalCapacity, earlyBirdLimit });
    }
    set({ totalCapacity, earlyBirdLimit });
  },

  createEvent: async (payload: WarmthCreateInput) => {
    const { date, ...rest } = payload;
    const body = {
      title: rest.title,
      organizerEmail: "",
      date,
      category: rest.category,
      location: rest.location,
      description: rest.description,
      priceLabel: rest.priceLabel,
      summary: rest.summary ?? null,
      dateDetail: rest.dateDetail ?? null,
      timeRange: rest.timeRange ?? null,
      aboutLong: rest.aboutLong ?? null,
      heroImageUrl: rest.heroImageUrl ?? null,
      mapImageUrl: rest.mapImageUrl ?? null,
      organizerName: rest.organizerName ?? null,
      organizerAvatarUrl: rest.organizerAvatarUrl ?? null,
    };

    const { data } = await api.post<ApiEvent>("/events", body);
    const warmth = apiEventToWarmth(data);
    set((s) => ({ events: [warmth, ...s.events] }));
    return warmth.id;
  },

  updateEvent: async (eventId: string, payload) => {
    const patch: Record<string, unknown> = {
      title: payload.title,
      category: payload.category,
      location: payload.location,
      description: payload.description,
      priceLabel: payload.priceLabel,
      summary: payload.summary ?? null,
      dateDetail: payload.dateDetail ?? null,
      timeRange: payload.timeRange ?? null,
      aboutLong: payload.aboutLong ?? null,
      heroImageUrl: payload.heroImageUrl ?? null,
      mapImageUrl: payload.mapImageUrl ?? null,
      organizerName: payload.organizerName ?? null,
      organizerAvatarUrl: payload.organizerAvatarUrl ?? null,
    };
    if (payload.apiDate) {
      patch.date = payload.apiDate;
    }

    const { data } = await api.patch<ApiEvent>(`/events/${eventId}`, patch);
    const warmth = apiEventToWarmth(data);
    set((s) => ({
      events: s.events.map((ev) => (ev.id === eventId ? warmth : ev)),
    }));
  },
}));

export function getEventById(eventId: string) {
  return useWarmthStore.getState().events.find((event) => event.id === eventId);
}
