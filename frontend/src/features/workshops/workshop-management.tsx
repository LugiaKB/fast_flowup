"use client";

import { Archive, Pencil, Plus, RefreshCcw, Replace } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button, ConfirmDialog, Sheet, TextField, useToast } from "@/components/ui";
import { useAuth } from "@/features/auth/auth-provider";
import { useColaboradores } from "@/features/colaboradores/use-colaboradores";
import { ParticipantSelection } from "@/features/participantes/participant-selection";
import { useAttendanceMutations } from "@/features/participantes/use-attendance-mutations";
import { ApiError } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

import { useWorkshopMutations } from "./use-workshop-mutations";
import { useWorkshop } from "./use-workshops";
import {
  toRecifeWorkshopTimestamp,
  validateWorkshopSchedule,
  workshopDateInputValue,
} from "./workshop-validation";

type ArchiveReason = components["schemas"]["ArchiveReason"];
type WorkshopSummary = components["schemas"]["WorkshopSummary"];
export type WorkshopStatusFilter = components["parameters"]["Status"];

function ActiveParticipantSelection({
  currentParticipantIds,
  disabled,
  onSelectedIdsChange,
  selectedIds,
}: {
  currentParticipantIds?: number[];
  disabled: boolean;
  onSelectedIdsChange: (ids: number[]) => void;
  selectedIds: number[];
}) {
  const { request } = useAuth();
  const [query, setQuery] = useState("");
  const { data, error, isLoading, refetch } = useColaboradores({
    query,
    offset: 0,
    limit: 100,
    status: "active",
    requester: request,
  });

  return (
    <ParticipantSelection
      currentParticipantIds={currentParticipantIds}
      idPrefix={currentParticipantIds ? "edit-attendance" : "initial-attendance"}
      title={currentParticipantIds ? "Participantes do workshop" : "Participantes iniciais"}
      searchLabel="Buscar participantes"
      query={query}
      onQueryChange={setQuery}
      selectedIds={selectedIds}
      onSelectedIdsChange={onSelectedIdsChange}
      items={data?.items ?? []}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      disabled={disabled}
    />
  );
}

export function WorkshopStatusSelect({
  value,
  onChange,
}: {
  value: WorkshopStatusFilter;
  onChange: (value: WorkshopStatusFilter) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor="workshop-status" className="text-sm font-medium text-body">
        Status dos workshops
      </label>
      <select
        id="workshop-status"
        value={value}
        onChange={(event) => onChange(event.target.value as WorkshopStatusFilter)}
        className="min-h-12 rounded-lg border border-border bg-surface px-4 text-base text-strong focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20"
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
  const { replace } = useAttendanceMutations(workshop?.id ?? 0);
  const { notify } = useToast();
  const { request } = useAuth();
  const replacement = workshop?.status === "archived";
  const editing = workshop?.status === "active";
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [date, setDate] = useState("");
  const [descricao, setDescricao] = useState("");
  const [participantIds, setParticipantIds] = useState<number[] | undefined>([]);
  const [reason, setReason] = useState<ArchiveReason>("manual");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [acting, setActing] = useState(false);
  const editingParticipants = useWorkshop(open && editing ? (workshop?.id ?? null) : null, request);
  const currentParticipantIds = editingParticipants.data?.participantes.map(({ id }) => id) ?? [];
  const selectedParticipantIds = editing && participantIds === undefined
    ? currentParticipantIds
    : (participantIds ?? []);

  function hasSameParticipants(left: number[], right: number[]) {
    return left.length === right.length && left.every((id) => right.includes(id));
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setNome(editing ? workshop.nome : "");
      setDate(workshop ? workshopDateInputValue(workshop.dataRealizacao) : "");
      setDescricao(editing ? workshop.descricao : "");
      setParticipantIds(editing ? undefined : []);
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

    if (editing && (!editingParticipants.data || editingParticipants.isLoading || editingParticipants.error)) {
      setError("Aguarde o carregamento dos participantes antes de salvar.");
      return;
    }

    setSaving(true);
    setError(undefined);
    try {
      if (editing) {
        await update(workshop.id, { nome: nome.trim(), descricao: descricao.trim(), dataRealizacao });
        const participantsChanged = !hasSameParticipants(currentParticipantIds, selectedParticipantIds);
        try {
          if (participantsChanged) await replace(selectedParticipantIds);
        } catch {
          setParticipantIds(undefined);
          editingParticipants.refetch();
          setError(
            "Os dados do workshop foram salvos, mas não foi possível atualizar os participantes. A lista foi recarregada.",
          );
          return;
        }
        notify({ title: participantsChanged ? "Workshop e participantes atualizados" : "Workshop atualizado" });
      } else {
        await create({
          nome: nome.trim(),
          descricao: descricao.trim(),
          dataRealizacao,
          colaboradorIds: selectedParticipantIds,
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
            <label htmlFor={`workshop-description-${workshop?.id ?? "new"}`} className="text-sm font-medium text-body">Descrição</label>
            <textarea id={`workshop-description-${workshop?.id ?? "new"}`} value={descricao} maxLength={4000} rows={5} onChange={(event) => setDescricao(event.target.value)} className="rounded-lg border border-border bg-surface p-4 text-strong focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20" />
          </div>
          {!editing && open && (
            <ActiveParticipantSelection
              selectedIds={selectedParticipantIds}
              onSelectedIdsChange={setParticipantIds}
              disabled={saving}
            />
          )}
          {editing && open && editingParticipants.isLoading && (
            <section aria-labelledby="edit-attendance-title" className="grid gap-2">
              <h3 id="edit-attendance-title" className="text-lg font-semibold">Participantes</h3>
              <p role="status" className="text-sm text-muted">Carregando participantes atuais…</p>
            </section>
          )}
          {editing && open && editingParticipants.error && (
            <section aria-labelledby="edit-attendance-title" className="grid gap-3 rounded-lg bg-error-subtle p-4 text-error-strong">
              <h3 id="edit-attendance-title" className="text-lg font-semibold">Participantes</h3>
              <p role="alert">Não foi possível carregar os participantes atuais.</p>
              <Button type="button" size="sm" variant="secondary" onClick={editingParticipants.refetch}>Tentar novamente</Button>
            </section>
          )}
          {editing && open && editingParticipants.data && !editingParticipants.error && (
            <ActiveParticipantSelection
              currentParticipantIds={currentParticipantIds}
              selectedIds={selectedParticipantIds}
              onSelectedIdsChange={setParticipantIds}
              disabled={saving}
            />
          )}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving || (editing && (!editingParticipants.data || editingParticipants.isLoading || Boolean(editingParticipants.error)))}>{saving ? "Salvando…" : editing ? "Salvar alterações" : "Salvar workshop"}</Button>
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
            <label htmlFor={`archive-reason-${workshop.id}`} className="text-sm font-medium text-body">Motivo do arquivamento</label>
            <select id={`archive-reason-${workshop.id}`} value={reason} onChange={(event) => setReason(event.target.value as ArchiveReason)} className="min-h-12 rounded-lg border border-border bg-surface px-4 text-strong">
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
