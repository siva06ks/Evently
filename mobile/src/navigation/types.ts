export type RootStackParamList = {
  Login: undefined;
  OTP: { phone: string };
  HomeFeed: undefined;
  EventDetails: { eventId: string };
  BookingForm: { eventId: string };
  QRTicket: { eventId: string; attendeeName: string; ticketId: string };
  OfflineHub: undefined;
  TicketLimits: undefined;
  CreateEvent: undefined;
  EditEvent: { eventId: string };
};
