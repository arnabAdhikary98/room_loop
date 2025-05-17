RoomLoop – The Drop-In Events & Micro-Meetup Platform

Scenario:
Sometimes you want to throw a quick virtual event, a hangout, or a focused collab session — no bloated calendar invites, no links buried in chat. You just want a room, a time, a vibe — and people show up.

RoomLoop is a casual, link-free micro-event platform. Users create temporary "Rooms" with topics, people get notified, and anyone can hop in when the room is live.

It’s not a video call app — it’s a presence-first coordination tool.

🎯 Objective:
Build a fullstack application where users can:

Create scheduled rooms with themes & time windows
Invite friends via username (or public join code)
Show room status (Scheduled, Live, Closed)
Drop into live rooms to chat (text-based) or leave reactions
Track past rooms and participation
👥 User Role: user
All users can create rooms, join rooms they’re invited to, and interact with active rooms.

🔐 Authentication & Authorization:
Secure login/signup with email or username
All room access must be scoped to:
Creator
Invited users
Public (if room is marked open)
Users can only access rooms during their valid time window
🧱 Core Functional Features:
1. Create a Room
Users can fill:

Room Title (e.g., “Friday Night Doodles”, “Bug Bash”, “Catch-Up Session”)
Description
Room Type: Private, Public
Time Window: start and end time (e.g., 7–9pm today)
Max Participants (optional)
Tag: Hangout, Work, Brainstorm, Wellness, etc.
Room status updates automatically based on time:

Scheduled → Live → Closed
2. Invite Others
For private rooms:
Add users by username or email
For public rooms:
Anyone can view/join from explore page
Invitation should appear in dashboard or notification panel
3. Join a Live Room
Once live, users can:

See who’s in the room
Drop text messages (ephemeral chat or thread-style)
React with emoji bursts
View shared topic or pinned idea
Leave room anytime
No video/audio — this is minimal, async-compatible coordination

4. Room History & Stats
Dashboard shows:
All rooms created or joined
Room status, time, participants
Short summary of room outcome (optional field by creator)
Past rooms can’t be joined but remain viewable
5. Explore Public Rooms
See currently live public rooms (if within active time window)
Join if slots are open
Filter by tag (Social, Deep Work, Chill, etc.) or status (Live, Starting Soon)
Trending rooms shown based on joins
6. UI/UX Considerations
Room cards with status color badges
Countdown clocks for rooms about to go live
Minimalist, mobile-friendly design
Vibe: casual + ephemeral + creative (not enterprise-y)
🧪 Additional Notes:
Live state doesn’t require real-time tech — status can be driven by server time + refresh polling
Reactions/messages can be stored per room session
Room expiration should auto-disable join button
Bonus: allow “reschedule” for recurring rooms
Important: Submit the following to complete your challenge:
• Deployed link/URL
• GitHub repository link
• 3–5 minute video recorded by you, walking us through your product, code, and tech stack

Wherever details are unclear, feel free to make reasonable assumptions and mention them clearly in your submission.