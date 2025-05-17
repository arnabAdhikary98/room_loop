import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Room service functions
export const roomService = {
  // Get all rooms with optional filters
  getAllRooms: async (filters?: { status?: string; tag?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.tag) params.append('tag', filters.tag);
    
    const response = await api.get(`/rooms?${params.toString()}`);
    return response.data;
  },
  
  // Get a single room by ID
  getRoomById: async (id: string) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },
  
  // Create a new room
  createRoom: async (roomData: {
    title: string;
    description: string;
    startTime: Date | string;
    endTime: Date | string;
    tags?: string[];
  }) => {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },
  
  // Update a room
  updateRoom: async (id: string, roomData: any) => {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
  },
  
  // Delete a room
  deleteRoom: async (id: string) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },
  
  // Join a room
  joinRoom: async (id: string) => {
    const response = await api.post(`/rooms/${id}/join`);
    return response.data;
  },
  
  // Invite a user to a room
  inviteToRoom: async (id: string, email: string) => {
    const response = await api.post(`/rooms/${id}/invite`, { email });
    return response.data;
  },
};

// User service functions
export const userService = {
  // Get user profile
  getUserProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
  
  // Get user's rooms
  getUserRooms: async () => {
    const response = await api.get('/user/rooms');
    return response.data;
  },
  
  // Update user profile
  updateUserProfile: async (userData: any) => {
    const response = await api.put('/user/profile', userData);
    return response.data;
  },
};

// Message service functions
export const messageService = {
  // Get messages for a room
  getRoomMessages: async (roomId: string) => {
    const response = await api.get(`/rooms/${roomId}/messages`);
    return response.data;
  },
  
  // Send a message to a room
  sendMessage: async (roomId: string, content: string, type: 'text' | 'emoji' = 'text') => {
    const response = await api.post(`/rooms/${roomId}/messages`, { content, type });
    return response.data;
  },
  
  // Delete a message
  deleteMessage: async (messageId: string) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },
};

// Notification service functions
export const notificationService = {
  // Get user notifications
  getNotifications: async (options?: { limit?: number; offset?: number; unreadOnly?: boolean }) => {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.unreadOnly) params.append('unreadOnly', 'true');
    
    const response = await api.get(`/user/notifications?${params.toString()}`);
    return response.data;
  },
  
  // Get unread notification count
  getUnreadCount: async () => {
    const response = await api.get('/user/notifications/count');
    return response.data.count;
  },
  
  // Mark a notification as read
  markAsRead: async (notificationId: string) => {
    const response = await api.put(`/user/notifications/${notificationId}`);
    return response.data;
  },
  
  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.put('/user/notifications');
    return response.data;
  },
};

export default api; 