// Mock the database connection
jest.mock('@/app/lib/mongoose', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true),
}));

// Mock the Room model
jest.mock('@/app/models/Room', () => ({
  __esModule: true,
  default: {
    find: jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockImplementation(() => ({
        sort: jest.fn().mockResolvedValue([
          {
            _id: '123',
            title: 'Test Room',
            description: 'Test Description',
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 3600000).toISOString(),
            creator: {
              _id: 'user123',
              name: 'Test User',
              email: 'test@example.com',
            },
            participants: [],
            tags: ['test'],
            status: 'scheduled',
          },
        ]),
      })),
    })),
  },
}));

// Mock next-auth getServerSession
jest.mock('next-auth', () => ({
  getServerSession: jest.fn().mockResolvedValue(null),
}));

// Mock next/server
jest.mock('next/server', () => ({
  NextRequest: class {
    url = 'http://localhost:3000/api/rooms';
  },
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      status: options?.status || 200,
      json: async () => data,
    })),
  },
}));

import { GET } from '@/app/api/rooms/route';

describe('Rooms API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return rooms', async () => {
    // Import the mocked NextRequest from next/server
    const { NextRequest } = require('next/server');
    
    // Create a mock request with URL
    const request = new NextRequest();
    
    // Call the GET handler
    const response = await GET(request);
    
    // Check the response
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]?.title).toBe('Test Room');
  });
}); 