import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "./button";

export interface PaginationProps {
  offset: number;
  limit: number;
  totalItems: number;
  onPageChange: (offset: number) => void;
}

export function Pagination({ offset, limit, totalItems, onPageChange }: PaginationProps) {
  const first = totalItems === 0 ? 0 : offset + 1;
  const last = Math.min(offset + limit, totalItems);

  return (
    <nav
      aria-label="Paginação"
      className="flex flex-col items-center justify-between gap-4 sm:flex-row"
    >
      <p className="text-sm text-gray-700" aria-live="polite">
        Exibindo {first}–{last} de {totalItems}
      </p>
      <div className="flex w-full gap-2 sm:w-auto">
        <Button
          variant="secondary"
          size="sm"
          disabled={offset === 0}
          onClick={() => onPageChange(Math.max(0, offset - limit))}
        >
          <ChevronLeft aria-hidden="true" className="size-5" />
          Anterior
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={offset + limit >= totalItems}
          onClick={() => onPageChange(offset + limit)}
        >
          Próxima
          <ChevronRight aria-hidden="true" className="size-5" />
        </Button>
      </div>
    </nav>
  );
}
