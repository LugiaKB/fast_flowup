import { render } from "@testing-library/react";
import { vi } from "vitest";

import Home from "./page";

const redirect = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ redirect }));

describe("Home", () => {
  it("redirects to the public workshop listing", () => {
    render(<Home />);

    expect(redirect).toHaveBeenCalledWith("/workshops");
  });
});
