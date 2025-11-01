import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "@/components/ui/Button";

describe("Button Component", () => {
  describe("Rendering", () => {
    it("should render button with children", () => {
      render(<Button>Click Me</Button>);
      expect(
        screen.getByRole("button", { name: "Click Me" })
      ).toBeInTheDocument();
    });

    it("should render as Link when href is provided", () => {
      render(<Button href="/test">Go to Test</Button>);
      const link = screen.getByRole("link", { name: "Go to Test" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/test");
    });
  });

  describe("Variants", () => {
    it("should apply primary variant styles by default", () => {
      render(<Button>Primary Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-[#5858FA]");
      expect(button).toHaveClass("text-white");
    });

    it("should apply secondary variant styles", () => {
      render(<Button variant="secondary">Secondary Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-gray-200");
      expect(button).toHaveClass("text-gray-900");
    });
  });

  describe("Interactions", () => {
    it("should handle onClick event", () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should be disabled when disabled prop is true", () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });
});
