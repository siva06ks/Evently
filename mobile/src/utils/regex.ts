export const regex = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  eventTitle: /^[A-Za-z0-9 ]{3,60}$/,
  isoDate: /^\d{4}-\d{2}-\d{2}$/,
};

export const isValidEmail = (value: string) => regex.email.test(value.trim().toLowerCase());
export const isValidEventTitle = (value: string) => regex.eventTitle.test(value.trim());
export const isValidDate = (value: string) => {
  const trimmedValue = value.trim();

  if (!regex.isoDate.test(trimmedValue)) {
    return false;
  }

  const date = new Date(`${trimmedValue}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === trimmedValue;
};
