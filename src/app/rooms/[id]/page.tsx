'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { roomService } from '@/app/services/api';

interface Room {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  creator: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  participants: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  }[];
  tags: string[];
  status: 'scheduled' | 'live' | 'closed';
}

interface Message {
  _id: string;
  room: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  content: string;
  type: 'text' | 'emoji';
  timestamp: string;
}

export default function RoomPage() {
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    startTime: '',
    endTime: ''
  });
  const params = useParams();
  const roomId = params.id as string;
  const router = useRouter();
  const { data: session, status } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Poll for messages and room status
  const pollingInterval = 5000; // 5 seconds
  const pollingRef = useRef<NodeJS.Timeout>();
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch room details and check if user is a participant
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/rooms/${roomId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch room');
        }
        
        const data = await response.json();
        setRoom(data);
        
        // Check if the current user is a participant
        if (session?.user?.id) {
          setIsJoined(data.participants.some((p: {_id: string}) => p._id === session.user.id));
        }
        
        // If room is live, fetch messages
        if (data.status === 'live') {
          fetchMessages();
        }
      } catch (err: Error | unknown) {
        setError(err instanceof Error ? err.message : 'Failed to fetch room');
      } finally {
        setLoading(false);
      }
    };
    
    if (roomId) {
      fetchRoom();
    }
  }, [roomId, session]);

  // Set up polling for messages and room status
  useEffect(() => {
    if (room?.status === 'live' && isJoined) {
      pollingRef.current = setInterval(() => {
        fetchMessages();
        fetchRoomStatus();
      }, pollingInterval);
    } else if (room?.status === 'scheduled' && isJoined) {
      pollingRef.current = setInterval(() => {
        fetchRoomStatus();
      }, pollingInterval);
    }
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [room?.status, isJoined]);

  const fetchRoomStatus = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch room status');
      }
      
      const data = await response.json();
      
      // If status changed, update room
      if (data.status !== room?.status) {
        setRoom(data);
        
        // If room just went live, fetch messages
        if (data.status === 'live' && room?.status === 'scheduled') {
          fetchMessages();
        }
      }
    } catch (err: Error | unknown) {
      console.error('Error fetching room status:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/messages`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      setMessages(data);
    } catch (err: Error | unknown) {
      console.error('Error fetching messages:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleJoinRoom = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    try {
      setJoinLoading(true);
      
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join room');
      }
      
      setIsJoined(true);
      
      // Refresh room data to get updated participants
      const roomResponse = await fetch(`/api/rooms/${roomId}`);
      const roomData = await roomResponse.json();
      setRoom(roomData);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setMessageLoading(true);
      
      const response = await fetch(`/api/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          type: 'text',
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send message');
      }
      
      const data = await response.json();
      
      // Add new message to the list
      setMessages(prev => [...prev, data]);
      
      // Clear input
      setNewMessage('');
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setMessageLoading(false);
    }
  };

  const handleSendEmoji = async (emoji: string) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: emoji,
          type: 'emoji',
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send emoji');
      }
      
      const data = await response.json();
      
      // Add new message to the list
      setMessages(prev => [...prev, data]);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send emoji');
    }
  };

  const handleRescheduleRoom = async () => {
    if (!session || !isCreator) {
      return;
    }
    
    // Show reschedule modal instead of automatically rescheduling
    setShowRescheduleModal(true);
  };

  const handleSubmitReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setRescheduleLoading(true);
      
      // Validate dates
      const startDate = new Date(rescheduleData.startTime);
      const endDate = new Date(rescheduleData.endTime);
      
      if (startDate >= endDate) {
        setError('End time must be after start time');
        setRescheduleLoading(false);
        return;
      }
      
      if (startDate < new Date()) {
        setError('Start time cannot be in the past');
        setRescheduleLoading(false);
        return;
      }
      
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'scheduled',
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reschedule room');
      }
      
      const updatedRoom = await response.json();
      setRoom(updatedRoom);
      
      // Close modal and show success message
      setShowRescheduleModal(false);
      alert('Room rescheduled successfully!');
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reschedule room');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');
    
    if (!inviteEmail.trim()) {
      setInviteError('Email is required');
      return;
    }
    
    try {
      setInviteLoading(true);
      
      await roomService.inviteToRoom(roomId, inviteEmail);
      
      setInviteSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setInviteSuccess('');
      }, 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to send invitation';
      setInviteError(errorMessage);
    } finally {
      setInviteLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format time for chat messages
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check if the current user is the creator
  const isCreator = room?.creator._id === session?.user?.id;

  // Render room actions based on user role and room status
  const renderRoomActions = () => {
    const isCreator = session?.user?.id === room?.creator._id;
    
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {!isJoined && room?.status !== 'closed' && (
          <button
            onClick={handleJoinRoom}
            disabled={joinLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {joinLoading ? 'Joining...' : 'Join Room'}
          </button>
        )}
        
        {isCreator && room?.status === 'scheduled' && (
          <>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
            >
              Invite Users
            </button>
            
            <button
              onClick={handleRescheduleRoom}
              disabled={rescheduleLoading}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rescheduleLoading ? 'Updating...' : 'Reschedule Room'}
            </button>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading room...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
          <p className="font-medium">Error</p>
          <p>{error}</p>
          <Link href="/rooms" className="text-red-700 underline mt-2 inline-block">
            Back to Rooms
          </Link>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-400 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded relative">
          <p>Room not found</p>
          <Link href="/rooms" className="text-yellow-700 underline mt-2 inline-block">
            Back to Rooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-center">
          <p className="text-red-800 dark:text-red-300 text-lg">{error}</p>
          <Link href="/rooms" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Back to Rooms
          </Link>
        </div>
      ) : room && (
        <>
          <div className="mb-6">
            <Link href="/rooms" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Rooms
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {room.title}
              </h1>
              
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  room.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                  room.status === 'live' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                </span>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {room.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Start Time</h3>
                <p className="text-gray-900 dark:text-white">{formatDate(room.startTime)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">End Time</h3>
                <p className="text-gray-900 dark:text-white">{formatDate(room.endTime)}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Created by</h3>
              <div className="flex items-center">
                {room.creator.image ? (
                  <Image 
                    src={room.creator.image} 
                    alt={room.creator.name} 
                    width={32} 
                    height={32} 
                    className="rounded-full mr-2"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 mr-2 flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                      {room.creator.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-gray-900 dark:text-white">{room.creator.name}</span>
              </div>
            </div>
            
            {room.tags && room.tags.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {room.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-md text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {renderRoomActions()}
          </div>
          
          {/* Participants section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Participants ({room.participants.length})
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {room.participants.map((participant) => (
                <div key={participant._id} className="flex items-center">
                  {participant.image ? (
                    <Image 
                      src={participant.image} 
                      alt={participant.name} 
                      width={32} 
                      height={32} 
                      className="rounded-full mr-2"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 mr-2 flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-gray-900 dark:text-white text-sm truncate">
                    {participant.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Messages section - only show if room is live and user is a participant */}
          {room.status === 'live' && isJoined && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Discussion
              </h2>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
                <div className="h-80 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      No messages yet. Be the first to send a message!
                    </p>
                  ) : (
                    messages.map((message) => (
                      <div 
                        key={message._id} 
                        className={`flex ${message.sender._id === session?.user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${
                          message.sender._id === session?.user?.id 
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          } rounded-lg px-4 py-2`}
                        >
                          {message.sender._id !== session?.user?.id && (
                            <p className="text-xs font-medium mb-1">
                              {message.sender.name}
                            </p>
                          )}
                          
                          {message.type === 'emoji' ? (
                            <p className="text-2xl">{message.content}</p>
                          ) : (
                            <p>{message.content}</p>
                          )}
                          
                          <p className="text-xs opacity-70 text-right mt-1">
                            {formatMessageTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={handleSendMessage} className="border-t border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={messageLoading || !newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {messageLoading ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleSendEmoji('👍')}
                      className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md"
                    >
                      👍
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendEmoji('❤️')}
                      className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md"
                    >
                      ❤️
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendEmoji('😂')}
                      className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md"
                    >
                      😂
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendEmoji('🎉')}
                      className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md"
                    >
                      🎉
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendEmoji('🤔')}
                      className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md"
                    >
                      🤔
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Invite Modal */}
          {showInviteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Invite User
                  </h3>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {inviteError && (
                  <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{inviteError}</span>
                  </div>
                )}
                
                {inviteSuccess && (
                  <div className="mb-4 bg-green-50 dark:bg-green-900/30 border border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{inviteSuccess}</span>
                  </div>
                )}
                
                <form onSubmit={handleInviteUser}>
                  <div className="mb-4">
                    <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="inviteEmail"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white"
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={inviteLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {inviteLoading ? 'Sending...' : 'Send Invitation'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Reschedule Modal */}
          {showRescheduleModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Reschedule Room
                  </h3>
                  <button
                    onClick={() => setShowRescheduleModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {error && (
                  <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}
                
                <form onSubmit={handleSubmitReschedule}>
                  <div className="mb-4">
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      id="startTime"
                      value={rescheduleData.startTime}
                      onChange={(e) => setRescheduleData({...rescheduleData, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      id="endTime"
                      value={rescheduleData.endTime}
                      onChange={(e) => setRescheduleData({...rescheduleData, endTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRescheduleModal(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={rescheduleLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {rescheduleLoading ? 'Rescheduling...' : 'Reschedule Room'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Closed Room Section */}
          {room.status === 'closed' ? (
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-8 rounded-lg text-center">
              <h2 className="text-xl font-semibold mb-2">This room has ended</h2>
              <p className="mb-4">The discussion is no longer active as this room has closed.</p>
              
              {isCreator && (
                <button
                  onClick={handleRescheduleRoom}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Reschedule Room
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Existing code for other room statuses */}
            </>
          )}
        </>
      )}
    </div>
  );
} 