"use client";

import { Archive, Pencil, Plus, RefreshCcw, Replace } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button, ConfirmDialog, Sheet, TextField, useToast } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

import { useWorkshopMutations } from "./use-workshop-mutations";
import {
  toRecifeWorkshopTimestamp,
  validateWorkshopSchedule,
  workshopDateInputValue,
} from "./workshop-validation";

type ArchiveReason = components["schemas"]["ArchiveReason"];
type WorkshopSummary = components["schemas"]["WorkshopSummary"];
export type WorkshopStatusFilter = components["parameters"]["Status"];

export function WorkshopStatusSelect({
  value,
  onChange,
}: {
  value: WorkshopStatusFilter;
  onChange: (value: WorkshopStatusFilter) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor="workshop-status" className="text-sm font-medium text-gray-700">
        Status dos workshops
      </label>
      <select
        id="workshop-status"
        value={value}
        onChange={(event) => onChange(event.target.value as WorkshopStatusFilter)}
        className="min-h-12 rounded-lg border border-gray-300 bg-white px-4 text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20"
      >
        <option value="active">Ativos</option>
        <option value="archived">Arquivados</option>
        <option value="all">Todos</option>
      </select>
    </div>
  );
}

export function WorkshopManagement({
  workshop,
  activeWorkshops,
  onChanged,
}: {
  workshop?: WorkshopSummary;
  activeWorkshops: readonly WorkshopSummary[];
  onChanged: () => void;
}) {
  const { archive, create, restore, update } = useWorkshopMutations();
  const { notify } = useToast();
  const replacement = workshop?.status === "archived";
  const editing = workshop?.status === "active";
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [date, setDate] = useState("");
  const [descricao, setDescricao] = useState("");
  const [reason, setReason] = useState<ArchiveReason>("manual");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [acting, setActing] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setNome(editing ? workshop.nome : "");
      setDate(workshop ? workshopDateInputValue(workshop.dataRealizacao) : "");
      setDescricao(editing ? workshop.descricao : "");
      setError(undefined);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nome.trim() || !date || !descricao.trim()) {
      setError("Revise os campos e informe nome, data e descrição.");
      return;
    }
    const dataRealizacao = toRecifeWorkshopTimestamp(date);
    const scheduleError = validateWorkshopSchedule(
      dataRealizacao,
      activeWorkshops,
      editing ? workshop.id : undefined,
    );
    if (scheduleError) {
      setError(scheduleError);
      return;
    }

    setSaving(true);
    setError(undefined);
    try {
      if (editing) {
        await update(workshop.id, { nome: nome.trim(), descricao: descricao.trim(), dataRealizacao });
        notify({ title: "Workshop atualizado" });
      } else {
        await create({
          nome: nome.trim(),
          descricao: descricao.trim(),
          dataRealizacao,
          substituiWorkshopId: replacement ? workshop.id : undefined,
        });
        notify({ title: replacement ? "Workshop substituto criado" : "Workshop criado" });
      }
      setOpen(false);
      onChanged();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? (caught.problem.detail ?? caught.problem.title)
          : "Não foi possível salvar o workshop. Tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive() {
    if (!workshop) return;
    setActing(true);
    try {
      await archive(workshop.id, reason);
      notify({ title: "Workshop arquivado" });
      onChanged();
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.problem.title : "Não foi possível arquivar o workshop.",
      );
    } finally {
      setActing(false);
    }
  }

  async function handleRestore() {
    if (!workshop) return;
    setActing(true);
    setError(undefined);
    try {
      await restore(workshop.id);
      notify({ title: "Workshop restaurado" });
      onChanged();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.problem.title
          : "Não foi possível restaurar o workshop.",
      );
    } finally {
      setActing(false);
    }
  }

  const trigger = !workshop ? (
    <Button><Plus aria-hidden="true" className="size-5" />Novo workshop</Button>
  ) : editing ? (
    <Button size="sm" variant="secondary" aria-label={`Editar ${workshop.nome}`}>
      <Pencil aria-hidden="true" className="size-5" />Editar
    </Button>
  ) : (
    <Button size="sm" variant="secondary" aria-label={`Criar substituto de ${workshop.nome}`}>
      <Replace aria-hidden="true" className="size-5" />Criar substituto
    </Button>
  );

  return (
    <div className="grid gap-3">
      <Sheet
        open={open}
        onOpenChange={handleOpenChange}
        title={editing ? "Editar workshop" : replacement ? "Criar workshop substituto" : "Novo workshop"}
        description="Os workshops ocorrem às quintas-feiras, das 16h às 17h, em America/Recife."
        trigger={trigger}
      >
        <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
          {error && <p role="alert" className="rounded-lg bg-error-subtle p-4 text-sm text-error-strong">{error}</p>}
          <TextField label="Nome" value={nome} maxLength={200} onChange={(event) => setNome(event.target.value)} />
          <TextField label="Data de realização" type="date" value={date} onChange={(event) => setDate(event.target.value)} hint="Quinta-feira, das 16h às 17h." />
          <div className="grid gap-1.5">
            <label htmlFor={`workshop-description-${workshop?.id ?? "new"}`} className="text-sm font-medium text-gray-700">Descrição</label>
            <textarea id={`workshop-description-${workshop?.id ?? "new"}`} value={descricao} maxLength={4000} rows={5} onChange={(event) => setDescricao(event.target.value)} className="rounded-lg border border-gray-300 bg-white p-4 text-gray-900 focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20" />
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? "Salvando…" : editing ? "Salvar alterações" : "Salvar workshop"}</Button>
          </div>
        </form>
      </Sheet>

      {editing && (
        <ConfirmDialog
          title={`Arquivar ${workshop.nome}?`}
          description="O workshop deixará de aparecer nas consultas públicas e o motivo ficará no histórico."
          confirmLabel="Arquivar"
          onConfirm={() => void handleArchive()}
          trigger={<Button size="sm" variant="danger" disabled={acting} aria-label={`Arquivar ${workshop.nome}`}><Archive aria-hidden="true" className="size-5" />Arquivar</Button>}
        >
          <div className="mt-5 grid gap-1.5">
            <label htmlFor={`archive-reason-${workshop.id}`} className="text-sm font-medium text-gray-700">Motivo do arquivamento</label>
            <select id={`archive-reason-${workshop.id}`} value={reason} onChange={(event) => setReason(event.target.value as ArchiveReason)} className="min-h-12 rounded-lg border border-gray-300 bg-white px-4">
              <option value="manual">Manual</option>
              <option value="replacement">Substituição</option>
            </select>
          </div>
        </ConfirmDialog>
      )}

      {replacement && (
        <Button size="sm" variant="secondary" disabled={acting} onClick={() => void handleRestore()} aria-label={`Restaurar ${workshop.nome}`}>
          <RefreshCcw aria-hidden="true" className="size-5" />{acting ? "Restaurando…" : "Restaurar"}
        </Button>
      )}
      {workshop && error && !open && <p role="alert" className="text-sm text-error-strong">{error}</p>}
    </div>
  );
}
