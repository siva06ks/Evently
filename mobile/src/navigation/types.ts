export type RootStackParamList = {
  Login: undefined;
  OTP: { identifier: string };
  Profile: undefined;
  HomeFeed: undefined;
  EventDetails: { eventId: string };
  BookingForm: { eventId: string };
  QRTicket: { eventId: string; attendeeName: string; ticketId: string };
  TicketScanner: undefined;
  OfflineHub: undefined;
  TicketLimits: undefined;
  CreateEvent: undefined;
  EditEvent: { eventId: string };
};
