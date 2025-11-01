import { getUserFromToken } from "@/lib/auth";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/models/Users";
import dbConnect from "@/lib/dbConnect";

jest.mock("next/headers");
jest.mock("jsonwebtoken");
jest.mock("@/models/Users");
jest.mock("@/lib/dbConnect");

describe("Auth Utility Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  it("should return user when valid token is provided", async () => {
    const mockUser = {
      _id: "user123",
      username: "testuser",
      email: "test@example.com",
    };

    const mockCookies = {
      get: jest.fn().mockReturnValue({ value: "valid-token" }),
    };

    (cookies as jest.Mock).mockReturnValue(mockCookies);
    (dbConnect as jest.Mock).mockResolvedValue(true);
    (jwt.verify as jest.Mock).mockReturnValue({ id: "user123" });

    const mockSelect = jest.fn().mockResolvedValue(mockUser);
    User.findById = jest.fn().mockReturnValue({ select: mockSelect });

    const result = await getUserFromToken("valid-token");

    expect(result).toEqual(mockUser);
  });

  it("should return null when no token is provided", async () => {
    const mockCookies = {
      get: jest.fn().mockReturnValue(undefined),
    };

    (cookies as jest.Mock).mockReturnValue(mockCookies);
    (dbConnect as jest.Mock).mockResolvedValue(true);

    const result = await getUserFromToken(undefined);

    expect(result).toBeNull();
  });
});
