'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Room {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'live' | 'closed';
  participants: any[];
  tags: string[];
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [createdRooms, setCreatedRooms] = useState<Room[]>([]);
  const [participatedRooms, setParticipatedRooms] = useState<Room[]>([]);
  const [activeTab, setActiveTab] = useState('created');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUserRooms = async () => {
      if (status !== 'authenticated') return;
      
      try {
        setLoading(true);
        
        // Fetch created rooms
        const createdResponse = await fetch('/api/user/rooms?type=created');
        
        if (!createdResponse.ok) {
          throw new Error('Failed to fetch created rooms');
        }
        
        const createdData = await createdResponse.json();
        setCreatedRooms(createdData);
        
        // Fetch participated rooms
        const participatedResponse = await fetch('/api/user/rooms?type=participated');
        
        if (!participatedResponse.ok) {
          throw new Error('Failed to fetch participated rooms');
        }
        
        const participatedData = await participatedResponse.json();
        setParticipatedRooms(participatedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserRooms();
  }, [status]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // We'll show an empty state with the "Create Room" button if no rooms
  const displayedRooms = activeTab === 'created' ? createdRooms : participatedRooms;
  const hasRooms = displayedRooms.length > 0;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">My Dashboard</h1>
        
        <Link 
          href="/rooms/create" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create New Room
        </Link>
      </div>
      
      {/* User info */}
      {session?.user && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden mr-4">
              {session.user.image ? (
                <img src={session.user.image} alt={session.user.name || ''} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-semibold">{session.user.name?.charAt(0) || '?'}</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{session.user.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">{session.user.email}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('created')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'created'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Rooms I Created
          </button>
          <button
            onClick={() => setActiveTab('participated')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'participated'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Rooms I Joined
          </button>
        </nav>
      </div>
      
      {/* Rooms content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Loading rooms...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          <p>{error}</p>
        </div>
      ) : !hasRooms ? (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No {activeTab === 'created' ? 'created' : 'joined'} rooms yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {activeTab === 'created' 
              ? 'Create your first room to get started' 
              : 'Join rooms to participate in discussions'}
          </p>
          {activeTab === 'created' ? (
            <Link 
              href="/rooms/create" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Room
            </Link>
          ) : (
            <Link 
              href="/rooms" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Browse Rooms
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedRooms.map(room => (
            <Link 
              key={room._id} 
              href={`/rooms/${room._id}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2">{room.title}</h3>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full uppercase ${
                    room.status === 'live' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : room.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {room.status}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{room.description}</p>
                
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div>Starts: {formatDate(room.startTime)}</div>
                  <div>Ends: {formatDate(room.endTime)}</div>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>{room.participants.length} participant{room.participants.length !== 1 ? 's' : ''}</span>
                  
                  {activeTab === 'created' && room.status !== 'closed' && (
                    <div className="flex items-center text-blue-600 dark:text-blue-400">
                      <span>Manage</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 