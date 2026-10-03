import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import Home from "@/app/page";

describe("page d’accueil provisoire", () => {
  it("affiche un titre accessible", async () => {
    const { container } = render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("GTS Diagnostic");
    expect(await axe(container)).toHaveNoViolations();
  });
});
