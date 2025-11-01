import { POST } from "@/app/api/auth/register/route";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/Users";

jest.mock("@/lib/dbConnect");
jest.mock("@/models/Users");
jest.mock("bcryptjs");

describe("POST /api/auth/register", () => {
  let mockRequest: any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register new user successfully", async () => {
    mockRequest = {
      json: jest.fn().mockResolvedValue({
        username: "newuser",
        email: "new@example.com",
        password: "password123",
        confirmPassword: "password123",
      }),
    };

    (dbConnect as jest.Mock).mockResolvedValue(true);
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");
    (User.create as jest.Mock).mockResolvedValue({
      _id: "123",
      username: "newuser",
      email: "new@example.com",
    });

    const response = await POST(mockRequest as any);

    expect(bcrypt.hash as jest.Mock).toHaveBeenCalledWith("password123", 10);
    expect(response.status).toBe(201);
  });

  it("should return 400 when passwords do not match", async () => {
    mockRequest = {
      json: jest.fn().mockResolvedValue({
        username: "newuser",
        email: "new@example.com",
        password: "password123",
        confirmPassword: "differentpassword",
      }),
    };

    (dbConnect as jest.Mock).mockResolvedValue(true);

    const response = await POST(mockRequest as any);

    expect(response.body).toEqual({
      message: "Password dan konfirmasi tidak cocok",
    });
    expect(response.status).toBe(400);
  });
});
