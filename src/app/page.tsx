import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="py-12 md:py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to <span className="text-blue-600 dark:text-blue-400">RoomLoop</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Create and join micro-meetups for focused discussions, quick collaborations, 
            and meaningful connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/rooms/create" 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Create a Room
            </Link>
            <Link 
              href="/rooms" 
              className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition font-medium"
            >
              Browse Rooms
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Create Rooms</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Easily set up rooms with specific topics, time slots, and tags to gather like-minded people.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Join Discussions</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Participate in live discussions with text messages and emoji reactions.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Time-Bounded</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Rooms automatically switch from scheduled to live to closed based on the set timeframe.
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-12 border-t border-gray-200 dark:border-gray-800">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">How It Works</h2>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="bg-gray-200 dark:bg-gray-700 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold">1</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Sign Up</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Create an account with your email and password or sign in if you already have one.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="bg-gray-200 dark:bg-gray-700 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold">2</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Create or Find a Room</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Create your own room with a specific topic or browse existing rooms by tags or status.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="bg-gray-200 dark:bg-gray-700 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Join and Participate</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Join rooms that interest you and participate in the discussion when the room goes live.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
