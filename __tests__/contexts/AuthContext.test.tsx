import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => "/"),
}));

describe("AuthContext", () => {
  let mockRouter: any;
  let mockFetch: any;

  beforeEach(() => {
    mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("useAuth hook", () => {
    it("should throw error when used outside AuthProvider", () => {
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow("useAuth must be used within an AuthProvider");

      console.error = originalError;
    });

    it("should provide auth context when used inside AuthProvider", () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current).toHaveProperty("user");
      expect(result.current).toHaveProperty("loading");
      expect(result.current).toHaveProperty("login");
      expect(result.current).toHaveProperty("register");
      expect(result.current).toHaveProperty("logout");
    });
  });

  describe("login", () => {
    it("should login successfully and redirect to homepage", async () => {
      const mockUser = {
        id: "123",
        username: "testuser",
        email: "test@example.com",
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: "Login berhasil",
          user: mockUser,
        }),
      });

      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      expect(result.current.user).toEqual(mockUser);
      expect(mockRouter.push).toHaveBeenCalledWith("/homepage");
    });
  });
});
