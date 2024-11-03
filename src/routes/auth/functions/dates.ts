export function getFutureDate(daysToAdd: number, date: Date): Date {
  const currentDate = date;
  currentDate.setDate(currentDate.getDate() + daysToAdd);
  return currentDate;
}
