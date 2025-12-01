# Incident Automation & Reporting Dashboard

This is a self-built project where I designed and developed a small incident-monitoring system inspired by real data-centre and IT operations workflows.  
The goal of this project was to understand how automated alerts, backend APIs, dashboards, and operational metrics come together in real environments.

I previously built a simpler system called **HelpDesk Lite**, and this project is a more advanced, automated version of that idea—focused more on backend automation, server simulation, data reporting, and a better UI.

## Overview

This application simulates multiple servers, automatically generates incidents, stores them in a database, and displays them in a dashboard where you can track and update their status.  
It’s built to resemble how IT teams monitor infrastructure, respond to alerts, and track operational metrics like severity levels and mean-time-to-resolve (MTTR).

The project includes:
- A **Node.js + Express** backend with SQLite
- A **React** dashboard with a clean UI
- A **simulator script** that automatically inserts incidents
- Real-time stats, filters, and trends

This project helped me practice full-stack development, automation, backend design, state management, UI building, and operational thinking.

## Features

### Incident Automation
- A simulator automatically creates incidents every few seconds  
- Each incident includes:
  - Server name  
  - Severity (Low → Critical)  
  - Status (Open → In Progress → Resolved)  
  - Timestamps  
  - Description

### Backend API (Node.js + Express)
- Fetch all incidents  
- Filter by server, severity, or status  
- Update status  
- Compute statistics such as:
  - Total incidents  
  - Open vs resolved  
  - MTTR (average resolution time)  
  - Daily incident trend  

### Dashboard UI (React)
- Clean dark/glass style design  
- Shows all incidents in a table  
- Status update buttons  
- Filters for easier navigation  
- Stats cards + a small 7-day bar chart  
- Responsive layout

### Database (SQLite)
- Lightweight file-based DB  
- Stores all incident history  
- Easy to inspect while developing

## Tech Stack

**Frontend:** React, Vite, CSS  
**Backend:** Node.js, Express.js  
**Database:** SQLite (better-sqlite3)  
**Automation:** Node-based custom simulator  
**Version Control:** Git & GitHub  

## How to Run the Project

### 1. Backend Setup

```bash
cd server
npm install
npm run seed    
npm start    
```
starts API on  http://localhost:4000

### 2. Start the Incident Simulator
Open another terminal window:

```bash
cd server
npm run simulate
```
This will start generating new incidents automatically every few seconds.

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```
After running the above, open the URL shown in the terminal: 
http://localhost:5173

## How It Works

- The simulator continuously inserts new incidents into the SQLite database.
- The backend exposes routes to retrieve and update these incidents.
- The React frontend fetches data from the API and displays it in a dashboard.
- Stats such as MTTR, severity distribution, and daily incident totals are calculated automatically.
- Incidents can be updated directly from the UI (Open → In Progress → Resolved).

### What I Learned From This Project

- How automation can be integrated into backend systems  
- How dashboards support IT and Data Centre operations  
- Full-stack workflow and state management  
- Designing REST APIs, database schemas, and UI layouts  
- Understanding operational metrics used in real environments  

---

## Future Improvements

Some enhancements I’d like to add:

- Authentication for protected access  
- A more advanced change-request module  
- Email or SMS alerts for critical incidents  
- Docker setup for containerized deployment  
- Deployment on AWS, Render, or similar platforms  
- Integration with Power BI for richer reporting  
