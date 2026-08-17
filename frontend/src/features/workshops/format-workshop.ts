const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Recife",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Recife",
});

export function formatWorkshopDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function formatHour(value: string) {
  return timeFormatter.format(new Date(value)).replace(":00", "h").replace(":", "h");
}

export function formatWorkshopTimeRange(start: string, end: string) {
  return `${formatHour(start)}–${formatHour(end)}`;
}
