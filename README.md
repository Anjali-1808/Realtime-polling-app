# Real-Time Polling Application

A backend and frontend application that allows users to **create polls, vote on them**, and see **live vote updates** in real-time using **Express.js, Prisma, PostgreSQL, and Socket.IO**.

---

## Features

- User signup/signin (store in database)
- Create polls with multiple options
- Vote on a poll (only **one vote per user per poll**)
- Live results updated via WebSockets
- Responsive frontend UI
- Demo “Restore” data option included

---

## Technologies

- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Real-time:** Socket.IO
- **Frontend:** Vanilla HTML/CSS/JS

---

## Prerequisites

1. **Node.js** ≥ 18  
2. **PostgreSQL** installed and running  
   - Create a database, e.g., `voting_app`
3. **npm** or **yarn**  

---

## Setup Guide

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd Voting_App


2. Install dependencies
npm install


3. Configure environment

Create a .env file in the project root:
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/voting_app?schema=public"
JWT_SECRET="change_this_to_a_secret"
PORT=4000
Replace <username> and <password> with your PostgreSQL credentials.
Replace voting_app with your database name.



4. Setup Prisma
a) Generate Prisma client
1.npx prisma generate
2.npx prisma migrate dev --name init

b) Reset the database (for development)(optional)

Warning: This will drop all existing tables and data

npx prisma migrate reset


Select y to confirm.

This will apply all migrations and create tables for User, Poll, PollOption, Vote.



5. Run the backend
node index.js or npm start


Server will run on http://localhost:4000

WebSocket is also running via the same server.



6. Serve frontend

You can open frontend.html in a browser directly, or use a simple HTTP server:

npx serve .


Then open http://localhost:5000/frontend.html (or whichever port serve uses).

Frontend communicates with backend API and WebSocket.

API Endpoints
Users

POST /users – create user

{ "name": "Alice", "email": "alice@example.com", "password": "password123" }


GET /users – list all users

GET /users/:id – get user details by ID

Polls

POST /polls – create a poll

{ "question": "Tea or Coffee?", "options": ["Tea","Coffee"], "creatorId": "<userId>" }


GET /polls – get all polls

GET /polls/:id – get poll details

POST /polls/:id/vote – vote on a poll option

{ "userId": "<userId>", "pollOptionId": "<optionId>" }

Notes

Single vote per user per poll is enforced. Once a user votes on a poll, they cannot vote on another option in the same poll.

Live vote updates are sent via Socket.IO (voteUpdate event).

Frontend stores the current logged-in user in localStorage.

Demo user (demo@polls.com) will be created if no creator is provided.
