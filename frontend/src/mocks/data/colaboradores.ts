import type { components } from "@/lib/api/schema";

import { colaboradorArquivadoFixture, colaboradoresFixture } from "../fixtures";

export type Colaborador = components["schemas"]["Colaborador"];

const initialRecords: Colaborador[] = [...colaboradoresFixture, colaboradorArquivadoFixture];
let records: Colaborador[] = [];
let nextId = 10;
let mutationSequence = 0;

function mutationTimestamp() {
  mutationSequence += 1;
  return new Date(Date.UTC(2026, 7, 17, 12, 0, mutationSequence)).toISOString();
}

export function resetColaboradoresMockState() {
  records = structuredClone(initialRecords);
  nextId = 10;
  mutationSequence = 0;
}

export function listMockColaboradores() {
  return records;
}

export function findMockColaborador(id: number) {
  return records.find((record) => record.id === id);
}

export function createMockColaborador(nome: string) {
  const timestamp = mutationTimestamp();
  const record: Colaborador = {
    id: nextId,
    nome,
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  nextId += 1;
  records.push(record);
  return record;
}

export function updateMockColaborador(record: Colaborador, nome: string) {
  record.nome = nome;
  record.updatedAt = mutationTimestamp();
  return record;
}

export function archiveMockColaborador(record: Colaborador) {
  if (record.status === "archived") return;

  const timestamp = mutationTimestamp();
  record.status = "archived";
  record.archivedAt = timestamp;
  record.updatedAt = timestamp;
}

export function restoreMockColaborador(record: Colaborador) {
  record.status = "active";
  record.archivedAt = null;
  record.updatedAt = mutationTimestamp();
  return record;
}

resetColaboradoresMockState();
