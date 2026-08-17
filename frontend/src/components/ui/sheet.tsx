"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  trigger?: ReactNode;
  children: ReactNode;
}

export function Sheet({ children, description, onOpenChange, open, title, trigger }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="sheet-overlay fixed inset-0 z-40 bg-gray-900/50" />
        <Dialog.Content className="sheet-content fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-y-auto bg-surface p-6 shadow-panel focus:outline-none sm:max-w-lg sm:p-8">
          <div className="mb-8 pr-12">
            <Dialog.Title className="font-heading text-2xl font-semibold text-strong">
              {title}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-body">{description}</Dialog.Description>
          </div>
          <Dialog.Close
            className="absolute right-5 top-5 rounded-lg p-2 text-body hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label="Fechar painel"
          >
            <X aria-hidden="true" className="size-6" />
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
