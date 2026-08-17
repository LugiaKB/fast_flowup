import type { components } from "@/lib/api/schema";

import { workshopsFixture } from "../fixtures";

export type WorkshopDetail = components["schemas"]["WorkshopDetail"];
type ArchiveReason = components["schemas"]["ArchiveReason"];
type CreateWorkshopRequest = components["schemas"]["CreateWorkshopRequest"];
type WorkshopInput = components["schemas"]["WorkshopInput"];

const archivedWorkshop: WorkshopDetail = {
  id: 8,
  nome: "Colaboração entre áreas",
  descricao: "Workshop arquivado mantido como histórico.",
  dataRealizacao: "2024-10-17T16:00:00-03:00",
  dataTermino: "2024-10-17T17:00:00-03:00",
  status: "archived",
  archivedAt: "2024-10-18T12:00:00Z",
  participantCount: 0,
  participantes: [],
  archiveEvents: [
    {
      id: 1,
      reason: "manual",
      archivedAt: "2024-10-18T12:00:00Z",
      archivedByAdminId: "admin-1",
    },
  ],
};

let records: WorkshopDetail[] = [];
let nextId = 9;
let nextArchiveEventId = 2;
let mutationSequence = 0;

function mutationTimestamp() {
  mutationSequence += 1;
  return new Date(Date.UTC(2026, 7, 17, 13, 0, mutationSequence)).toISOString();
}

function endTimestamp(start: string) {
  return start.replace("T16:00:00-03:00", "T17:00:00-03:00");
}

export function resetWorkshopsMockState() {
  records = structuredClone([...workshopsFixture, archivedWorkshop]);
  nextId = 9;
  nextArchiveEventId = 2;
  mutationSequence = 0;
}

export function listMockWorkshops() {
  return records;
}

export function findMockWorkshop(id: number) {
  return records.find((record) => record.id === id);
}

export function createMockWorkshop(input: CreateWorkshopRequest) {
  const record: WorkshopDetail = {
    id: nextId,
    nome: input.nome.trim(),
    descricao: input.descricao.trim(),
    dataRealizacao: input.dataRealizacao,
    dataTermino: endTimestamp(input.dataRealizacao),
    status: "active",
    participantCount: 0,
    participantes: [],
    archiveEvents: [],
  };
  nextId += 1;
  records.push(record);

  if (input.substituiWorkshopId) {
    const predecessor = findMockWorkshop(input.substituiWorkshopId);
    const event = predecessor?.archiveEvents.findLast(({ restoredAt }) => !restoredAt);
    if (event) event.replacementWorkshopId = record.id;
  }

  return record;
}

export function updateMockWorkshop(record: WorkshopDetail, input: WorkshopInput) {
  record.nome = input.nome.trim();
  record.descricao = input.descricao.trim();
  record.dataRealizacao = input.dataRealizacao;
  record.dataTermino = endTimestamp(input.dataRealizacao);
  return record;
}

export function archiveMockWorkshop(record: WorkshopDetail, reason: ArchiveReason) {
  if (record.status === "archived") return;
  const archivedAt = mutationTimestamp();
  record.status = "archived";
  record.archivedAt = archivedAt;
  record.archiveEvents.push({
    id: nextArchiveEventId,
    reason,
    archivedAt,
    archivedByAdminId: "admin-1",
  });
  nextArchiveEventId += 1;
}

export function restoreMockWorkshop(record: WorkshopDetail) {
  record.status = "active";
  record.archivedAt = null;
  const event = record.archiveEvents.findLast(({ restoredAt }) => !restoredAt);
  if (event) event.restoredAt = mutationTimestamp();
  return record;
}

export function replaceMockParticipantes(
  workshop: WorkshopDetail,
  participantes: WorkshopDetail["participantes"],
) {
  workshop.participantes = [...participantes];
  workshop.participantCount = participantes.length;
  return workshop;
}

export function addMockParticipante(
  workshop: WorkshopDetail,
  participante: WorkshopDetail["participantes"][number],
) {
  if (!workshop.participantes.some(({ id }) => id === participante.id)) {
    workshop.participantes.push(participante);
  }
  workshop.participantCount = workshop.participantes.length;
}

export function removeMockParticipante(workshop: WorkshopDetail, colaboradorId: number) {
  workshop.participantes = workshop.participantes.filter(({ id }) => id !== colaboradorId);
  workshop.participantCount = workshop.participantes.length;
}

resetWorkshopsMockState();
