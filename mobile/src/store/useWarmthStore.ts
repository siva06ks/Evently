import { create } from "zustand";

export type WarmthEventCategory = "Arts" | "Health" | "Social" | "Learning" | "Technology";

export type WarmthEvent = {
  id: string;
  title: string;
  category: WarmthEventCategory;
  dateLabel: string;
  location: string;
  priceLabel: string;
  description: string;
  /** Short blurb under the title (defaults to `description` if missing). */
  summary?: string;
  /** e.g. "Saturday, Oct 24, 2024" */
  dateDetail?: string;
  /** e.g. "9:00 AM - 5:00 PM PST" */
  timeRange?: string;
  /** Long copy for the "About this event" block */
  aboutLong?: string;
  heroImageUrl?: string;
  mapImageUrl?: string;
  organizerName?: string;
  organizerAvatarUrl?: string;
};

export type WarmthTicket = {
  ticketId: string;
  eventId: string;
  attendeeName: string;
  createdAt: number;
};

type WarmthState = {
  events: WarmthEvent[];
  savedEventIds: string[];
  tickets: WarmthTicket[];
  totalCapacity: number;
  earlyBirdLimit: number;
  toggleSavedEvent: (eventId: string) => void;
  addTicketForEvent: (eventId: string, attendeeName: string) => WarmthTicket;
  updateTicketLimits: (nextTotal: number, nextEarly: number) => void;
  createEvent: (payload: Omit<WarmthEvent, "id">) => string;
  updateEvent: (eventId: string, payload: Omit<WarmthEvent, "id">) => void;
};

const initialEvents: WarmthEvent[] = [
  {
    id: "evt-1",
    title: "Watercolor Basics Workshop",
    category: "Arts",
    dateLabel: "Sat, Oct 14 • 10:00 AM",
    location: "Community Center",
    priceLabel: "$15",
    description: "Learn watercolor painting in a supportive setting.",
    summary: "A hands-on intro to color washing and simple landscapes in a small group.",
    dateDetail: "Saturday, Oct 14, 2024",
    timeRange: "10:00 AM - 1:00 PM PDT",
    aboutLong:
      "Bring your curiosity—supplies are included. This workshop focuses on light, layering, and gentle feedback so you can leave with a small piece of your own.\n\nSuitable for absolute beginners; the room is on the first floor with accessible seating.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1520423465872-5e0b6f05e29d?auto=format&w=1200&q=80",
    mapImageUrl:
      "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&w=1000&q=80",
    organizerName: "Creative Neighbors Co-op",
    organizerAvatarUrl: "https://i.pravatar.cc/200?u=org-watercolor",
  },
  {
    id: "evt-2",
    title: "Gentle Morning Yoga",
    category: "Health",
    dateLabel: "Tue, Oct 17 • 9:00 AM",
    location: "Botanical Gardens",
    priceLabel: "Free",
    description: "A beginner-friendly yoga session for all ages.",
    summary: "Slow flows and deep breathing surrounded by the quiet of the garden paths.",
    dateDetail: "Tuesday, Oct 17, 2024",
    timeRange: "9:00 AM - 10:00 AM PDT",
    aboutLong:
      "We'll move through a gentle flow designed for all bodies, then close with a short rest. Instructors can suggest modifications and chairs are available.\n\nMeet at the main pavilion; mats are first-come—bring a towel if you like extra cushion.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1545205597-3b9a04fbb0d4?auto=format&w=1200&q=80",
    mapImageUrl:
      "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&w=1000&q=80",
    organizerName: "Open Air Wellness",
    organizerAvatarUrl: "https://i.pravatar.cc/200?u=org-yoga",
  },
  {
    id: "evt-3",
    title: "Neighborhood Supper Club",
    category: "Social",
    dateLabel: "Fri, Oct 20 • 6:30 PM",
    location: "Main Hall",
    priceLabel: "$5",
    description: "Meet neighbors and share a cozy evening meal.",
    summary: "A potluck with assigned dishes so the table always feels balanced and warm.",
    dateDetail: "Friday, Oct 20, 2024",
    timeRange: "6:30 PM - 9:00 PM PDT",
    aboutLong:
      "We assign categories so the menu stays fun—veggies, grains, and dessert. Bring your dish ready to share and a story about where it comes from.\n\nSeating is communal; dietary notes are collected the week of the event.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&w=1200&q=80",
    mapImageUrl:
      "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&w=1000&q=80",
    organizerName: "Main Hall Residents",
    organizerAvatarUrl: "https://i.pravatar.cc/200?u=org-supper",
  },
  {
    id: "evt-4",
    title: "Future Tech Summit 2024",
    category: "Technology",
    dateLabel: "Sat, Oct 24 • 9:00 AM - 5:00 PM",
    location: "Moscone Center",
    priceLabel: "$149",
    description:
      "A full-day look at the tools shaping the next generation of design and product teams.",
    summary:
      "Join industry leaders to explore the future of AI, immersive design, and digital experiences. Hands-on sessions and a keynote to close the day.",
    dateDetail: "Saturday, Oct 24, 2024",
    timeRange: "9:00 AM - 5:00 PM PST",
    aboutLong:
      "Future Tech Summit brings together product builders, designers, and technologists to explore what is next for connected experiences. Expect practical talks, live demos, and a closing keynote on responsible AI.\n\nThe program balances inspiration with takeaways: you'll leave with a clearer point of view on how teams ship AI-assisted features, design systems, and end-to-end experiences without losing a human feel.\n\nThis year's speakers include product leads from top platforms and a special guest on accessibility in new interfaces. Sessions are recorded and shared with attendees for 30 days after the event.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&w=1200&q=80",
    mapImageUrl:
      "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&w=1000&q=80",
    organizerName: "TechVision Partners",
    organizerAvatarUrl: "https://i.pravatar.cc/200?u=techvision",
  },
];

export const useWarmthStore = create<WarmthState>()((set, get) => ({
  events: initialEvents,
  savedEventIds: ["evt-1", "evt-3"],
  tickets: [],
  totalCapacity: 150,
  earlyBirdLimit: 50,
  toggleSavedEvent: (eventId) =>
    set((state) => {
      const exists = state.savedEventIds.includes(eventId);
      return {
        savedEventIds: exists
          ? state.savedEventIds.filter((id) => id !== eventId)
          : [...state.savedEventIds, eventId],
      };
    }),
  addTicketForEvent: (eventId, attendeeName) => {
    const ticketId = `TKT-${eventId.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const ticket: WarmthTicket = { ticketId, eventId, attendeeName, createdAt: Date.now() };
    set((state: any) => ({ tickets: [ticket, ...(state.tickets ?? [])] }));
    return ticket;
  },
  updateTicketLimits: (nextTotal, nextEarly) =>
    set({
      totalCapacity: Math.max(nextTotal, 1),
      earlyBirdLimit: Math.max(Math.min(nextEarly, nextTotal), 0),
    }),
  createEvent: (payload) => {
    const eventId = `evt-${Date.now()}`;
    set((state) => ({ events: [{ id: eventId, ...payload }, ...state.events] }));
    return eventId;
  },
  updateEvent: (eventId, payload) =>
    set((state) => ({
      events: state.events.map((event) => (event.id === eventId ? { id: eventId, ...payload } : event)),
    })),
}));

export function getEventById(eventId: string) {
  return useWarmthStore.getState().events.find((event) => event.id === eventId);
}
