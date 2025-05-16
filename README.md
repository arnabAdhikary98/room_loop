# RoomLoop - Micro-Meetup App

RoomLoop is a web application for creating and joining micro-meetups with focused discussions, quick collaborations, and meaningful connections.

![CI](https://github.com/yourusername/roomloop-app/actions/workflows/ci.yml/badge.svg)
![Deploy](https://github.com/yourusername/roomloop-app/actions/workflows/deploy.yml/badge.svg)

## Features

- **User Authentication**: Sign up, sign in, and manage your profile
- **Room Creation**: Create rooms with specific topics, time slots, and tags
- **Room Discovery**: Browse rooms by status (scheduled, live, closed) and tags
- **Live Chat**: Participate in discussions when rooms are live
- **Automatic Status Updates**: Rooms automatically switch from scheduled to live to closed based on the set timeframe

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/roomloop-app.git
   cd roomloop-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # MongoDB Connection String
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/roomloop?retryWrites=true&w=majority

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-for-jwt-encryption
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### MongoDB Setup

1. Create a free MongoDB Atlas account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Add your IP address to the network access list
5. Get your connection string and replace the placeholder in `.env.local`

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment:

### CI Workflow

The CI workflow runs on every push to main and pull requests:
- Linting with ESLint
- Type checking with TypeScript
- Building the application

### Test Workflow

The test workflow runs on every push to main and pull requests:
- Sets up MongoDB for testing
- Verifies database connection
- Runs tests (when added)

### CD Workflow

The CD workflow automatically deploys to Vercel on pushes to the main branch:
- Builds the application
- Deploys to Vercel production environment

### Setting up CI/CD

1. Fork or push this repository to your GitHub account
2. Set up a Vercel account and connect it to your repository
3. Add the following secrets to your GitHub repository:
   - `VERCEL_TOKEN`: Your Vercel API token
4. The CI/CD pipeline will automatically run on push to the main branch

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Sign up for a [Vercel](https://vercel.com) account
3. Import your repository
4. Add the environment variables from `.env.local` to your Vercel project
5. Deploy!

## Project Structure

- `/src/app`: Next.js App Router components and pages
- `/src/app/api`: API routes for backend functionality
- `/src/app/lib`: Utility functions and database connection
- `/src/app/models`: Mongoose models for database schema
- `/src/app/components`: Reusable React components

## License

This project is licensed under the MIT License.
