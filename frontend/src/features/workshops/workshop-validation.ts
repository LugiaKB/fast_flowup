import type { components } from "@/lib/api/schema";

type WorkshopSummary = components["schemas"]["WorkshopSummary"];

const RECIFE_SCHEDULE = /^(\d{4})-(\d{2})-(\d{2})T16:00:00-03:00$/;

function quarterKey(timestamp: string) {
  const match = /^(\d{4})-(\d{2})/.exec(timestamp);
  if (!match) return undefined;
  return `${match[1]}-Q${Math.floor((Number(match[2]) - 1) / 3) + 1}`;
}

export function toRecifeWorkshopTimestamp(date: string) {
  return `${date}T16:00:00-03:00`;
}

export function workshopDateInputValue(timestamp: string) {
  return timestamp.slice(0, 10);
}

export function validateWorkshopSchedule(
  timestamp: string,
  activeWorkshops: readonly WorkshopSummary[],
  currentWorkshopId?: number,
) {
  const match = RECIFE_SCHEDULE.exec(timestamp);
  if (!match) return "O workshop deve começar às 16h em America/Recife.";

  const [, year, month, day] = match;
  const weekday = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))).getUTCDay();
  if (weekday !== 4) return "A realização deve ocorrer em uma quinta-feira.";

  const quarter = quarterKey(timestamp);
  const conflict = activeWorkshops.some(
    (workshop) =>
      workshop.status === "active" &&
      workshop.id !== currentWorkshopId &&
      quarterKey(workshop.dataRealizacao) === quarter,
  );
  if (conflict) return "Já existe um workshop ativo neste trimestre.";

  return undefined;
}
