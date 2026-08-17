"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogIn, LogOut, Menu, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/features/auth/auth-provider";
import { ThemeToggle } from "@/features/theme/theme-toggle";
import { cn } from "@/lib/cn";

const navigation = [
  { href: "/workshops", label: "Workshops" },
  { href: "/colaboradores", label: "Colaboradores" },
] as const;

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navigationClassName(active: boolean) {
  return cn(
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-primary-subtle hover:text-strong focus-visible:outline-2 focus-visible:outline-primary",
    active && "bg-primary-subtle text-strong",
  );
}

export function Header() {
  const pathname = usePathname();
  const { admin, logout, status } = useAuth();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-[200] rounded-lg bg-surface px-4 py-3 text-strong shadow-panel focus:fixed focus:left-4 focus:top-4 focus:not-sr-only"
      >
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-30 border-b border-border bg-surface">
        <div className="mx-auto flex h-[var(--header-height)] w-full max-w-[var(--container-max)] items-center justify-between gap-6 px-[var(--container-padding)]">
          <Link
            href="/workshops"
            className="font-heading text-lg font-bold text-strong sm:text-xl"
          >
            Workshops FAST
          </Link>

          <nav aria-label="Navegação principal" className="hidden items-center gap-2 md:flex">
            {navigation.map(({ href, label }) => {
              const active = isActiveRoute(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={navigationClassName(active)}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            {status === "loading" && (
              <span role="status" className="text-sm text-muted">
                Verificando sessão…
              </span>
            )}
            {status === "visitor" && (
              <Link
                href="/login"
                aria-current={pathname === "/login" ? "page" : undefined}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border-2 border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-subtle"
              >
                <LogIn aria-hidden="true" className="size-5" />
                Entrar
              </Link>
            )}
            {status === "authenticated" && admin && (
              <>
                <span className="flex max-w-48 items-center gap-2 truncate text-sm text-body">
                  <UserRound aria-hidden="true" className="size-5 shrink-0" />
                  <span className="truncate">{admin.username}</span>
                </span>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg border-2 border-border px-4 py-2 text-sm font-semibold text-body hover:bg-surface-subtle"
                >
                  <LogOut aria-hidden="true" className="size-5" />
                  Sair
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  aria-label="Abrir menu de navegação"
                  className="inline-flex size-11 items-center justify-center rounded-lg text-body hover:bg-surface-subtle"
                >
                  <Menu aria-hidden="true" className="size-6" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="z-50 min-w-56 rounded-xl border border-border bg-surface p-2 shadow-panel"
                >
                  {navigation.map(({ href, label }) => {
                    const active = isActiveRoute(pathname, href);
                    return (
                      <DropdownMenu.Item key={href} asChild>
                        <Link
                          href={href}
                          aria-current={active ? "page" : undefined}
                          className={navigationClassName(active)}
                        >
                          {label}
                        </Link>
                      </DropdownMenu.Item>
                    );
                  })}
                  {status !== "loading" && (
                    <DropdownMenu.Separator className="my-2 h-px bg-border" />
                  )}
                  {status === "visitor" && (
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/login"
                        className={navigationClassName(pathname === "/login")}
                      >
                        <LogIn aria-hidden="true" className="size-5" />
                        Entrar
                      </Link>
                    </DropdownMenu.Item>
                  )}
                  {status === "authenticated" && admin && (
                    <>
                      <DropdownMenu.Label className="flex items-center gap-2 px-3 py-2 text-sm text-muted">
                        <UserRound aria-hidden="true" className="size-5 shrink-0" />
                        <span className="max-w-44 truncate">{admin.username}</span>
                      </DropdownMenu.Label>
                      <DropdownMenu.Item asChild>
                        <button
                          type="button"
                          onClick={() => void logout()}
                          className={cn(navigationClassName(false), "w-full")}
                        >
                          <LogOut aria-hidden="true" className="size-5" />
                          Sair
                        </button>
                      </DropdownMenu.Item>
                    </>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </header>
    </>
  );
}
