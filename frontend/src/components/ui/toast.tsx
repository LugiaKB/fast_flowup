"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface ToastMessage {
  title: string;
  description?: string;
}

interface ActiveToast extends ToastMessage {
  id: number;
}

interface ToastContextValue {
  notify: (message: ToastMessage) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const sequence = useRef(0);
  const [message, setMessage] = useState<ActiveToast | null>(null);

  const notify = useCallback((nextMessage: ToastMessage) => {
    sequence.current += 1;
    setMessage({ ...nextMessage, id: sequence.current });
  }, []);
  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {message && (
          <ToastPrimitive.Root
            key={message.id}
            defaultOpen
            onOpenChange={(open) => !open && setMessage(null)}
            duration={4_000}
            className="grid w-[calc(100vw-3rem)] max-w-sm grid-cols-[1fr_auto] gap-x-4 rounded-xl border border-gray-200 bg-white p-4 shadow-panel"
          >
            <ToastPrimitive.Title className="col-start-1 row-start-1 font-semibold text-gray-900">
              {message.title}
            </ToastPrimitive.Title>
            {message.description && (
              <ToastPrimitive.Description className="col-start-1 row-start-2 mt-1 text-sm text-gray-700">
                {message.description}
              </ToastPrimitive.Description>
            )}
            <ToastPrimitive.Close
              aria-label="Fechar notificação"
              className="col-start-2 row-span-2 row-start-1 rounded-md p-1 text-gray-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <X aria-hidden="true" className="size-5" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        )}
        <ToastPrimitive.Viewport className="fixed inset-x-6 bottom-6 z-[100] m-0 flex list-none flex-col items-end gap-3 outline-none sm:left-auto sm:right-6" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
