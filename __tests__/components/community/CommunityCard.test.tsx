import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CommunityCard from "@/components/community/CommunityCard";
import { useAuth } from "@/app/contexts/AuthContext";

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("CommunityCard Component", () => {
  const mockProps = {
    id: "123",
    slug: "test-community",
    title: "Test Community",
    image: "/test-image.jpg",
    membersPreview: ["/avatar1.png", "/avatar2.png", "/avatar3.png"],
    extraMembers: 50,
    freq: "10+ posts a day",
    description: "This is a test community",
    mine: false,
    onUpdate: jest.fn(),
  };

  let mockFetch: any;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "user123", username: "testuser", email: "test@example.com" },
      loading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render community card with all information", () => {
    render(<CommunityCard {...mockProps} />);

    expect(screen.getByText("Test Community")).toBeInTheDocument();
    expect(screen.getByText("This is a test community")).toBeInTheDocument();
    expect(screen.getByText("50 members")).toBeInTheDocument();
  });

  it("should show Join button when mine is false", () => {
    render(<CommunityCard {...mockProps} />);
    expect(screen.getByRole("button", { name: "Join" })).toBeInTheDocument();
  });

  it("should handle join button click successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Berhasil bergabung" }),
    });

    render(<CommunityCard {...mockProps} />);

    const joinButton = screen.getByRole("button", { name: "Join" });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Joined" })
      ).toBeInTheDocument();
    });
  });
});
