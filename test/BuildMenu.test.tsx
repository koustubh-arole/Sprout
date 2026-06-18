import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BuildMenu } from "@/components/BuildMenu";
import { useWorld } from "@/lib/store";
import { START_METERS } from "@/lib/village";

beforeEach(() => {
  useWorld.setState({ sprigs: 1000, buildings: {}, meters: { ...START_METERS } });
});

describe("BuildMenu", () => {
  it("shows the Sprigs balance and the building catalog", () => {
    render(<BuildMenu />);
    expect(screen.getByText("Build your village")).toBeInTheDocument();
    expect(screen.getByText("Solar Farm")).toBeInTheDocument();
  });

  it("builds an affordable structure and deducts Sprigs", () => {
    render(<BuildMenu />);
    fireEvent.click(screen.getByRole("button", { name: /Build Solar Farm for 120 Sprigs/i }));
    expect(useWorld.getState().sprigs).toBe(880); // 1000 - 120
    expect(useWorld.getState().buildings.solar).toBe(1);
  });

  it("disables the button and explains the shortfall when unaffordable", () => {
    useWorld.setState({ sprigs: 0 });
    render(<BuildMenu />);
    const btn = screen.getByRole("button", { name: /more Sprigs to build Solar Farm/i });
    expect(btn).toBeDisabled();
  });
});
