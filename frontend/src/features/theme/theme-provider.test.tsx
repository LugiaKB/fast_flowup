import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, vi } from "vitest";

import {
  THEME_BOOTSTRAP_SCRIPT,
  THEME_STORAGE_KEY,
  ThemeProvider,
  useTheme,
} from "./theme-provider";
import { ThemeToggle } from "./theme-toggle";

function ThemeProbe() {
  const { theme } = useTheme();
  return <output aria-label="Tema atual">{theme}</output>;
}

function setSystemTheme(dark: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: dark,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
}

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  document.documentElement.style.colorScheme = "";
});

afterEach(() => vi.unstubAllGlobals());

describe("theme flow", () => {
  it("uses the system preference when there is no persisted choice", () => {
    setSystemTheme(true);

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText("Tema atual")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("persists a manual choice and exposes an accessible toggle", async () => {
    const user = userEvent.setup();
    setSystemTheme(true);
    render(
      <ThemeProvider>
        <ThemeToggle />
        <ThemeProbe />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Ativar tema claro" }));

    expect(screen.getByLabelText("Tema atual")).toHaveTextContent("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("applies the persisted theme in the pre-hydration bootstrap", () => {
    setSystemTheme(false);
    localStorage.setItem(THEME_STORAGE_KEY, "dark");

    Function(THEME_BOOTSTRAP_SCRIPT)();

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });
});
