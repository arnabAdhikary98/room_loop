'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

interface Room {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  creator: {
    name: string;
    email: string;
    image?: string;
  };
  participants: any[];
  tags: string[];
  status: 'scheduled' | 'live' | 'closed';
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const statusFilter = searchParams.get('status') || '';
  const tagFilter = searchParams.get('tag') || '';

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        
        // Build query params
        const queryParams = new URLSearchParams();
        if (statusFilter) queryParams.append('status', statusFilter);
        if (tagFilter) queryParams.append('tag', tagFilter);
        
        const response = await fetch(`/api/rooms?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch rooms');
        }
        
        const data = await response.json();
        setRooms(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRooms();
  }, [statusFilter, tagFilter]);

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    router.push(`/rooms?${params.toString()}`);
  };

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tag', tag);
    router.push(`/rooms?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/rooms');
  };

  // Function to format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get all unique tags from rooms
  const allTags = Array.from(
    new Set(rooms.flatMap(room => room.tags))
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Browse Rooms</h1>
      
      {/* Filters */}
      <div className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
          
          {(statusFilter || tagFilter) && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Clear all filters
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h3>
            <div className="flex flex-wrap gap-2">
              {['scheduled', 'live', 'closed'].map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusFilter(status === statusFilter ? '' : status)}
                  className={`px-3 py-1 rounded-full text-sm capitalize ${
                    status === statusFilter
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          
          {allTags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag === tagFilter ? '' : tag)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      tag === tagFilter
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Rooms List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Loading rooms...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
          <p>{error}</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-400 text-yellow-700 dark:text-yellow-300 px-4 py-12 rounded relative text-center">
          <p className="text-lg font-medium">No rooms found</p>
          <p className="mt-2">Try changing your filters or create a new room</p>
          <div className="mt-6">
            <Link
              href="/rooms/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create a Room
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
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
                
                {room.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {room.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full"
                        onClick={(e) => {
                          e.preventDefault();
                          handleTagClick(tag);
                        }}
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