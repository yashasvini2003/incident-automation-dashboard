// server/src/simulator.js
import db from './db.js';

const servers = ['web-1', 'web-2', 'db-1', 'cache-1', 'api-1'];

const severities = ['Low', 'Medium', 'High', 'Critical'];

const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const nowISO = () => new Date().toISOString();

// Generates a random incident every few seconds
function generateRandomIncident() {
  const serverName = randomElement(servers);

  // Make critical incidents less frequent but possible
  const severityRoll = Math.random();
  let severity;
  if (severityRoll < 0.5) severity = 'Low';
  else if (severityRoll < 0.8) severity = 'Medium';
  else if (severityRoll < 0.95) severity = 'High';
  else severity = 'Critical';

  const description = `Auto-generated incident on ${serverName} with severity ${severity}.`;
  const changeSuggested = severity === 'High' || severity === 'Critical' ? 1 : 0;

  const stmt = db.prepare(`
    INSERT INTO incidents (server_name, severity, status, description, created_at, change_suggested)
    VALUES (?, ?, 'Open', ?, ?, ?)
  `);

  stmt.run(serverName, severity, description, nowISO(), changeSuggested);
  console.log(`[Simulator] Created incident on ${serverName} (${severity})`);
}

// Every 8 seconds generate an incident
console.log('Starting incident simulator. Press Ctrl+C to stop.');
setInterval(generateRandomIncident, 8000);
