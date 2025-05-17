'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { notificationService, roomService } from '@/app/services/api';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const limit = 10;

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin?callbackUrl=/notifications');
    }
  }, [status]);

  // Fetch notifications
  useEffect(() => {
    if (status === 'authenticated') {
      const fetchNotifications = async () => {
        setLoading(true);
        try {
          const offset = (page - 1) * limit;
          const fetchedNotifications = await notificationService.getNotifications({
            limit,
            offset,
          });
          
          if (page === 1) {
            setNotifications(fetchedNotifications);
          } else {
            setNotifications(prev => [...prev, ...fetchedNotifications]);
          }
          
          // Check if we have more notifications to load
          setHasMore(fetchedNotifications.length === limit);
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
          setError('Failed to load notifications. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      fetchNotifications();
    }
  }, [status, page]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification._id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Handle notification action
  const handleNotificationAction = async (notification: any) => {
    try {
      // Mark as read first
      await notificationService.markAsRead(notification._id);
      
      // Update local state
      setNotifications(notifications.map(n => 
        n._id === notification._id 
          ? { ...n, read: true } 
          : n
      ));
      
      // Handle different notification types
      switch (notification.type) {
        case 'room_invite':
          if (notification.data?.roomId) {
            try {
              // Join the room
              await roomService.joinRoom(notification.data.roomId);
              // Redirect to the room
              window.location.href = `/rooms/${notification.data.roomId}`;
            } catch (error) {
              console.error('Failed to join room:', error);
              setError('Failed to join room. Please try again later.');
            }
          }
          break;
        case 'room_update':
        case 'new_message':
          // Navigate to the room
          if (notification.data?.roomId) {
            window.location.href = `/rooms/${notification.data.roomId}`;
          }
          break;
        default:
          // Do nothing for other notification types
          break;
      }
    } catch (error) {
      console.error('Failed to handle notification action:', error);
    }
  };

  // Format notification date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get notification type style
  const getNotificationTypeStyle = (type: string) => {
    switch (type) {
      case 'room_invite':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'room_update':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'new_message':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'system':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Load more notifications
  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  // If loading initial data, show loading state
  if (status === 'loading' || (loading && page === 1)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.some(n => !n.read) && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">You don't have any notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div 
              key={notification._id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${!notification.read ? 'border-l-4 border-blue-500' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium">
                    {notification.content}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNotificationTypeStyle(notification.type)}`}>
                      {notification.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  
                  {/* Action buttons based on notification type */}
                  {!notification.read && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {notification.type === 'room_invite' && notification.data?.roomId && (
                        <button
                          onClick={() => handleNotificationAction(notification)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                        >
                          Accept & Join
                        </button>
                      )}
                      {(notification.type === 'room_update' || notification.type === 'new_message') && notification.data?.roomId && (
                        <Link
                          href={`/rooms/${notification.data.roomId}`}
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                        >
                          View Room
                        </Link>
                      )}
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
                {!notification.read && !notification.type.includes('invite') && (
                  <button
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="ml-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 