import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { User as NextAuthUser } from "next-auth";
import dbConnect from "@/app/lib/mongoose";
import Room from "@/app/models/Room";
import User from "@/app/models/User";
import { POST } from "@/app/api/rooms/route";

// Mock the database connection
jest.mock("@/lib/db", () => ({
  dbConnect: jest.fn(),
}));

// Mock the models
jest.mock("@/models/Room", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
  },
}));

jest.mock("@/models/User", () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

// Mock next-auth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Mock next/server
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
    })),
  },
}));

describe("Rooms API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/rooms", () => {
    const mockUser: NextAuthUser = {
      id: "mockUserId",
      name: "Test User",
      email: "test@example.com",
    };

    const mockRoom = {
      _id: "mockRoomId",
      title: "Test Room",
      description: "Test Description",
      startTime: new Date(),
      endTime: new Date(),
      creator: mockUser,
      participants: [mockUser],
    };

    it("should create a room successfully", async () => {
      // Mock session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: mockUser,
      });

      // Mock user find
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      // Mock room creation
      (Room.create as jest.Mock).mockResolvedValue(mockRoom);

      // Create mock request
      const request = new NextRequest("http://localhost:3000/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Test Room",
          description: "Test Description",
          startTime: new Date(),
          endTime: new Date(),
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockRoom);
      expect(User.findById).toHaveBeenCalledWith("mockUserId");
      expect(Room.create).toHaveBeenCalledWith({
        title: "Test Room",
        description: "Test Description",
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        creator: mockUser,
        participants: [mockUser],
      });
    });

    it("should return 401 if not authenticated", async () => {
      // Mock no session
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Test Room",
          description: "Test Description",
          startTime: new Date(),
          endTime: new Date(),
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 404 if user not found", async () => {
      // Mock session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: mockUser,
      });

      // Mock user not found
      (User.findById as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Test Room",
          description: "Test Description",
          startTime: new Date(),
          endTime: new Date(),
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("User not found");
    });

    it("should handle database errors", async () => {
      // Mock session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: mockUser,
      });

      // Mock user find
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      // Mock database error
      (Room.create as jest.Mock).mockRejectedValue(new Error("Database error"));

      const request = new NextRequest("http://localhost:3000/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Test Room",
          description: "Test Description",
          startTime: new Date(),
          endTime: new Date(),
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to create room");
    });
  });
}); 