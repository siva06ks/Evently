export type NavIconName =
  | "home-outline"
  | "bookmark-outline"
  | "ticket-outline"
  | "account-outline"
  | "calendar-month-outline"
  | "plus-circle-outline"
  | "help-circle-outline";

export const attendeeNavIcons: Record<"home" | "saved" | "tickets" | "profile", NavIconName> = {
  home: "home-outline",
  saved: "bookmark-outline",
  tickets: "ticket-outline",
  profile: "account-outline",
};

export const organizerNavIcons: Record<"events" | "create" | "tickets" | "help", NavIconName> = {
  events: "calendar-month-outline",
  create: "plus-circle-outline",
  tickets: "ticket-outline",
  help: "help-circle-outline",
};
