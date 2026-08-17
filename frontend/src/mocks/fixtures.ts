import type { components } from "@/lib/api/schema";

type Colaborador = components["schemas"]["Colaborador"];
type WorkshopDetail = components["schemas"]["WorkshopDetail"];

export const colaboradoresFixture = [
  {
    id: 1,
    nome: "Ana Beatriz",
    status: "active",
    createdAt: "2026-01-08T12:00:00Z",
    updatedAt: "2026-01-08T12:00:00Z",
  },
  {
    id: 2,
    nome: "Carlos Eduardo",
    status: "active",
    createdAt: "2026-01-09T12:00:00Z",
    updatedAt: "2026-01-09T12:00:00Z",
  },
] satisfies Colaborador[];

export const workshopsFixture = [
  {
    id: 1,
    nome: "Comunicação que conecta",
    descricao: "Práticas objetivas para colaboração entre equipes.",
    dataRealizacao: "2026-07-16T16:00:00-03:00",
    dataTermino: "2026-07-16T17:00:00-03:00",
    status: "active",
    participantCount: 2,
    participantes: colaboradoresFixture,
    archiveEvents: [],
  },
] satisfies WorkshopDetail[];
