export const regex = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  eventTitle: /^[A-Za-z0-9 ]{3,60}$/,
  isoDate: /^\d{4}-\d{2}-\d{2}$/,
};

export const isValidEmail = (value: string) => regex.email.test(value);
export const isValidEventTitle = (value: string) => regex.eventTitle.test(value);
export const isValidDate = (value: string) => regex.isoDate.test(value);
