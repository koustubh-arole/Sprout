import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DecisionMoment } from "@/components/DecisionMoment";
import { DECISIONS } from "@/lib/carbon/factors";

describe("DecisionMoment", () => {
  it("renders options with an impact badge before the user chooses", () => {
    render(<DecisionMoment decisions={DECISIONS} onChoose={() => {}} selected={{}} />);
    expect(screen.getByText("Veg thali")).toBeInTheDocument();
    expect(screen.getAllByText(/impact/i).length).toBeGreaterThan(0);
  });

  it("calls onChoose with the decision and chosen option id", () => {
    const onChoose = vi.fn();
    render(<DecisionMoment decisions={DECISIONS} onChoose={onChoose} selected={{}} />);
    fireEvent.click(screen.getByRole("button", { name: /Choose Veg thali/i }));
    expect(onChoose).toHaveBeenCalledTimes(1);
    expect(onChoose.mock.calls[0][0].id).toBe("lunch");
    expect(onChoose.mock.calls[0][1]).toBe("veg");
  });
});
