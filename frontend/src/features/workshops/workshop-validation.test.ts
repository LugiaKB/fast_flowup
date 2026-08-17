import type { components } from "@/lib/api/schema";

import { toRecifeWorkshopTimestamp, validateWorkshopSchedule } from "./workshop-validation";

type WorkshopSummary = components["schemas"]["WorkshopSummary"];

const occupiedWorkshop = {
  id: 1,
  nome: "Workshop existente",
  descricao: "Descrição",
  dataRealizacao: "2026-07-16T16:00:00-03:00",
  dataTermino: "2026-07-16T17:00:00-03:00",
  status: "active",
  participantCount: 0,
} satisfies WorkshopSummary;

describe("workshop schedule validation", () => {
  it("builds the fixed Recife schedule from a Thursday", () => {
    expect(toRecifeWorkshopTimestamp("2027-01-07")).toBe("2027-01-07T16:00:00-03:00");
    expect(validateWorkshopSchedule("2027-01-07T16:00:00-03:00", [])).toBeUndefined();
  });

  it("rejects a day other than Thursday", () => {
    expect(validateWorkshopSchedule("2027-01-06T16:00:00-03:00", [])).toBe(
      "A realização deve ocorrer em uma quinta-feira.",
    );
  });

  it("rejects a time or offset outside the Recife contract", () => {
    expect(validateWorkshopSchedule("2027-01-07T15:00:00-03:00", [])).toBe(
      "O workshop deve começar às 16h em America/Recife.",
    );
    expect(validateWorkshopSchedule("2027-01-07T16:00:00Z", [])).toBe(
      "O workshop deve começar às 16h em America/Recife.",
    );
  });

  it("rejects an occupied civil quarter but excludes the workshop being edited", () => {
    expect(
      validateWorkshopSchedule("2026-09-17T16:00:00-03:00", [occupiedWorkshop]),
    ).toBe("Já existe um workshop ativo neste trimestre.");
    expect(
      validateWorkshopSchedule("2026-09-17T16:00:00-03:00", [occupiedWorkshop], 1),
    ).toBeUndefined();
  });
});
