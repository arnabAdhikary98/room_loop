'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

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
  const [error, setError] = useState('');
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
          setIsJoined(data.participants.some((p: any) => p._id === session.user.id));
        }
        
        // If room is live, fetch messages
        if (data.status === 'live') {
          fetchMessages();
        }
      } catch (err: any) {
        setError(err.message);
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
    } catch (err) {
      console.error('Error fetching room status:', err);
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
    } catch (err) {
      console.error('Error fetching messages:', err);
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
    } catch (err: any) {
      setError(err.message);
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
    } catch (err: any) {
      setError(err.message);
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
    } catch (err: any) {
      setError(err.message);
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{room.title}</h1>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden mr-2">
                  {room.creator.image ? (
                    <img src={room.creator.image} alt={room.creator.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold">{room.creator.name.charAt(0)}</span>
                  )}
                </div>
                <span>Created by {room.creator.name}</span>
              </div>
            </div>
            
            <span className={`text-sm font-semibold px-3 py-1 rounded-full mt-2 sm:mt-0 ${
              room.status === 'live' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : room.status === 'scheduled'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {room.status.toUpperCase()}
            </span>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">{room.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Start Time</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDate(room.startTime)}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">End Time</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDate(room.endTime)}</p>
            </div>
          </div>
          
          {room.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {room.tags.map(tag => (
                <span 
                  key={tag} 
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Participants ({room.participants.length})</h2>
            
            {!isJoined && status === 'authenticated' && room.status !== 'closed' && (
              <button
                onClick={handleJoinRoom}
                disabled={joinLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {joinLoading ? 'Joining...' : 'Join Room'}
              </button>
            )}
            
            {status === 'unauthenticated' && (
              <Link href="/auth/signin" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Sign in to Join
              </Link>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {room.participants.map(participant => (
              <div 
                key={participant._id} 
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full"
              >
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                  {participant.image ? (
                    <img src={participant.image} alt={participant.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold">{participant.name.charAt(0)}</span>
                  )}
                </div>
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  {participant.name}
                  {participant._id === room.creator._id && (
                    <span className="text-xs ml-1 text-gray-500 dark:text-gray-400">(Creator)</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Chat section - only visible for participants when room is live */}
      {room.status === 'live' && isJoined ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Live Chat</h2>
          </div>
          
          <div className="h-[400px] overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">No messages yet. Be the first to say something!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map(message => (
                  <div 
                    key={message._id} 
                    className={`flex ${message.sender._id === session?.user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[70%] ${
                        message.sender._id === session?.user?.id 
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      } ${
                        message.type === 'emoji' ? 'px-3 py-2 text-2xl' : 'px-4 py-2'
                      } rounded-lg`}
                    >
                      {message.sender._id !== session?.user?.id && (
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                            {message.sender.image ? (
                              <img src={message.sender.image} alt={message.sender.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-semibold">{message.sender.name.charAt(0)}</span>
                            )}
                          </div>
                          <span className="text-xs font-medium">{message.sender.name}</span>
                        </div>
                      )}
                      
                      <div>
                        {message.content}
                      </div>
                      
                      <div className="text-xs mt-1 text-right text-gray-500 dark:text-gray-400">
                        {formatMessageTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex mb-2 gap-2">
              {['👍', '❤️', '😂', '😮', '🎉', '👀'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleSendEmoji(emoji)}
                  className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
            
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={messageLoading || !newMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {messageLoading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      ) : room.status === 'scheduled' && isJoined ? (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-6 py-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-2">This room is scheduled to start soon</h2>
          <p className="mb-4">The chat will be available once the room goes live at {formatDate(room.startTime)}</p>
          <p className="text-sm">You'll be notified when the room starts</p>
        </div>
      ) : room.status === 'closed' ? (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-2">This room has ended</h2>
          <p>The discussion is no longer active as this room has closed.</p>
        </div>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 px-6 py-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-2">Join to participate</h2>
          <p className="mb-4">You need to join this room to see the chat when it goes live.</p>
          {status === 'authenticated' ? (
            <button
              onClick={handleJoinRoom}
              disabled={joinLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {joinLoading ? 'Joining...' : 'Join Room'}
            </button>
          ) : (
            <Link href="/auth/signin" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block">
              Sign in to Join
            </Link>
          )}
        </div>
      )}
    </div>
  );
} 