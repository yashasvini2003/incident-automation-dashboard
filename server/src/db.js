// server/src/db.js
import Database from 'better-sqlite3';

const db = new Database('incident_db.sqlite');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_name TEXT NOT NULL,
    severity TEXT NOT NULL,        -- 'Low', 'Medium', 'High', 'Critical'
    status TEXT NOT NULL,          -- 'Open', 'In Progress', 'Resolved'
    description TEXT,
    created_at TEXT NOT NULL,
    resolved_at TEXT,
    change_suggested INTEGER DEFAULT 0  -- 0 = false, 1 = true
  );

  CREATE TABLE IF NOT EXISTS changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id INTEGER NOT NULL,
    summary TEXT NOT NULL,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL,          -- 'Planned', 'In Progress', 'Completed'
    FOREIGN KEY (incident_id) REFERENCES incidents(id)
  );
`);

export default db;
