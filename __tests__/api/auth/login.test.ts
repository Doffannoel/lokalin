import { POST } from "@/app/api/auth/login/route";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/Users";

jest.mock("@/lib/dbConnect");
jest.mock("@/models/Users");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("POST /api/auth/login", () => {
  let mockRequest: any;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  it("should login user successfully with valid credentials", async () => {
    const mockUser = {
      _id: "123",
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword",
    };

    mockRequest = {
      json: jest.fn().mockResolvedValue({
        email: "test@example.com",
        password: "password123",
      }),
    };

    (dbConnect as jest.Mock).mockResolvedValue(true);
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("mock-token");
    const response = await POST(mockRequest as any);

    expect(User.findOne as jest.Mock).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(bcrypt.compare as jest.Mock).toHaveBeenCalledWith(
      "password123",
      "hashedpassword"
    );
  });

  it("should return 404 when email does not exist", async () => {
    mockRequest = {
      json: jest.fn().mockResolvedValue({
        email: "notfound@example.com",
        password: "password123",
      }),
    };

    (dbConnect as jest.Mock).mockResolvedValue(true);
    (User.findOne as jest.Mock).mockResolvedValue(null);

    const response = await POST(mockRequest as any);

    expect(response.body).toEqual({ message: "Email tidak ditemukan" });
    expect(response.status).toBe(404);
  });
});
