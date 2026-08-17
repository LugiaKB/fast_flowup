"use client";

import { Archive, Pencil, Plus, RotateCcw } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button, ConfirmDialog, Sheet, TextField, useToast } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

import { useColaboradorMutations } from "./use-colaborador-mutations";

type Colaborador = components["schemas"]["Colaborador"];
export type ColaboradorStatusFilter = components["parameters"]["Status"];

interface StatusFilterProps {
  value: ColaboradorStatusFilter;
  onChange: (value: ColaboradorStatusFilter) => void;
}

export function ColaboradorStatusSelect({ onChange, value }: StatusFilterProps) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor="collaborator-status" className="text-sm font-medium text-gray-700">
        Status dos colaboradores
      </label>
      <select
        id="collaborator-status"
        value={value}
        onChange={(event) => onChange(event.target.value as ColaboradorStatusFilter)}
        className="min-h-12 rounded-lg border border-gray-300 bg-white px-4 text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20"
      >
        <option value="active">Ativos</option>
        <option value="archived">Arquivados</option>
        <option value="all">Todos</option>
      </select>
    </div>
  );
}

interface ManagementProps {
  colaborador?: Colaborador;
  onChanged: () => void;
}

export function ColaboradorManagement({ colaborador, onChanged }: ManagementProps) {
  const { archive, create, restore, update } = useColaboradorMutations();
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState(colaborador?.nome ?? "");
  const [fieldError, setFieldError] = useState<string>();
  const [submissionError, setSubmissionError] = useState<string>();
  const [actionError, setActionError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const [isActing, setIsActing] = useState(false);
  const isEditing = Boolean(colaborador);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setNome(colaborador?.nome ?? "");
      setFieldError(undefined);
      setSubmissionError(undefined);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = nome.trim();
    if (!normalizedName) {
      setFieldError("Informe o nome do colaborador.");
      setSubmissionError("Revise os campos indicados antes de continuar.");
      return;
    }
    if (normalizedName.length > 160) {
      setFieldError("O nome deve ter no máximo 160 caracteres.");
      setSubmissionError("Revise os campos indicados antes de continuar.");
      return;
    }

    setFieldError(undefined);
    setSubmissionError(undefined);
    setIsSaving(true);
    try {
      if (colaborador) {
        await update(colaborador.id, { nome: normalizedName });
        notify({ title: "Colaborador atualizado" });
      } else {
        await create({ nome: normalizedName });
        notify({ title: "Colaborador criado" });
      }
      setOpen(false);
      onChanged();
    } catch (error) {
      const apiFieldError =
        error instanceof ApiError ? error.problem.errors?.nome?.[0] : undefined;
      if (apiFieldError) setFieldError(apiFieldError);
      setSubmissionError("Não foi possível salvar o colaborador. Revise os campos e tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleArchive() {
    if (!colaborador) return;
    setActionError(undefined);
    setIsActing(true);
    try {
      await archive(colaborador.id);
      notify({ title: "Colaborador arquivado" });
      onChanged();
    } catch {
      setActionError("Não foi possível arquivar o colaborador. Tente novamente.");
    } finally {
      setIsActing(false);
    }
  }

  async function handleRestore() {
    if (!colaborador) return;
    setActionError(undefined);
    setIsActing(true);
    try {
      await restore(colaborador.id);
      notify({ title: "Colaborador restaurado" });
      onChanged();
    } catch {
      setActionError("Não foi possível restaurar o colaborador. Tente novamente.");
    } finally {
      setIsActing(false);
    }
  }

  const trigger = colaborador ? (
    <Button size="sm" variant="secondary" aria-label={`Editar ${colaborador.nome}`}>
      <Pencil aria-hidden="true" className="size-5" />
      Editar
    </Button>
  ) : (
    <Button>
      <Plus aria-hidden="true" className="size-5" />
      Novo colaborador
    </Button>
  );

  return (
    <div className="grid gap-3">
      {(!colaborador || colaborador.status === "active") && (
        <Sheet
          open={open}
          onOpenChange={handleOpenChange}
          title={isEditing ? "Editar colaborador" : "Novo colaborador"}
          description={
            isEditing
              ? "Atualize o nome e salve as alterações."
              : "Informe o nome para adicionar uma pessoa à listagem."
          }
          trigger={trigger}
        >
          <form className="grid gap-6" onSubmit={handleSubmit} noValidate>
            {submissionError && (
              <p role="alert" className="rounded-lg border border-error bg-error-subtle p-4 text-sm text-error-strong">
                {submissionError}
              </p>
            )}
            <TextField
              label="Nome"
              value={nome}
              maxLength={160}
              required
              error={fieldError}
              onChange={(event) => setNome(event.target.value)}
            />
            <div className="mt-auto flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving
                  ? "Salvando…"
                  : isEditing
                    ? "Salvar alterações"
                    : "Salvar colaborador"}
              </Button>
            </div>
          </form>
        </Sheet>
      )}

      {colaborador?.status === "active" && (
        <ConfirmDialog
          title={`Arquivar ${colaborador.nome}?`}
          description="O colaborador deixará de aparecer nas consultas públicas, mas suas participações serão preservadas."
          confirmLabel="Arquivar"
          onConfirm={() => void handleArchive()}
          trigger={
            <Button
              size="sm"
              variant="danger"
              disabled={isActing}
              aria-label={`Arquivar ${colaborador.nome}`}
            >
              <Archive aria-hidden="true" className="size-5" />
              Arquivar
            </Button>
          }
        />
      )}

      {colaborador?.status === "archived" && (
        <Button
          size="sm"
          variant="secondary"
          disabled={isActing}
          onClick={() => void handleRestore()}
          aria-label={`Restaurar ${colaborador.nome}`}
        >
          <RotateCcw aria-hidden="true" className="size-5" />
          {isActing ? "Restaurando…" : "Restaurar"}
        </Button>
      )}

      {actionError && (
        <p role="alert" className="text-sm text-error-strong">
          {actionError}
        </p>
      )}
    </div>
  );
}
