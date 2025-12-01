// server/src/seed.js
import db from './db.js';

const nowISO = () => new Date().toISOString();

const clearStmt = db.prepare('DELETE FROM incidents');
clearStmt.run();

const sampleIncidents = [
  {
    server_name: 'web-1',
    severity: 'High',
    status: 'Open',
    description: 'High CPU usage detected on web-1',
    created_at: nowISO(),
    resolved_at: null,
    change_suggested: 0
  },
  {
    server_name: 'db-1',
    severity: 'Critical',
    status: 'Resolved',
    description: 'Database connection timeout spikes',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    change_suggested: 1
  },
  {
    server_name: 'cache-1',
    severity: 'Medium',
    status: 'In Progress',
    description: 'Cache miss rate elevated',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
    change_suggested: 0
  }
];

const insertStmt = db.prepare(`
  INSERT INTO incidents
  (server_name, severity, status, description, created_at, resolved_at, change_suggested)
  VALUES (@server_name, @severity, @status, @description, @created_at, @resolved_at, @change_suggested)
`);

db.transaction((rows) => {
  rows.forEach(r => insertStmt.run(r));
})(sampleIncidents);

console.log('Seeded sample incidents.');
