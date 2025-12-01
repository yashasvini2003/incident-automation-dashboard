// server/src/index.js
import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Helper
const nowISO = () => new Date().toISOString();

/**
 * GET /api/incidents
 * Optional query params: status, severity, serverName
 */
app.get('/api/incidents', (req, res) => {
  const { status, severity, serverName } = req.query;
  let query = 'SELECT * FROM incidents WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (severity) {
    query += ' AND severity = ?';
    params.push(severity);
  }
  if (serverName) {
    query += ' AND server_name = ?';
    params.push(serverName);
  }

  query += ' ORDER BY datetime(created_at) DESC';

  const stmt = db.prepare(query);
  const incidents = stmt.all(...params);
  res.json(incidents);
});

/**
 * POST /api/incidents
 * Body: { serverName, severity, description, changeSuggested? }
 * Used by simulator or manually.
 */
app.post('/api/incidents', (req, res) => {
  const { serverName, severity, description, changeSuggested = 0 } = req.body;

  if (!serverName || !severity) {
    return res.status(400).json({ error: 'serverName and severity are required' });
  }

  const stmt = db.prepare(`
    INSERT INTO incidents (server_name, severity, status, description, created_at, change_suggested)
    VALUES (?, ?, 'Open', ?, ?, ?)
  `);

  const info = stmt.run(
    serverName,
    severity,
    description || '',
    nowISO(),
    changeSuggested ? 1 : 0
  );

  const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(incident);
});

/**
 * PATCH /api/incidents/:id
 * Body: { status }
 * If status = 'Resolved', set resolved_at
 */
app.patch('/api/incidents/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'status is required' });
  }

  const existing = db.prepare('SELECT * FROM incidents WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  let resolvedAt = existing.resolved_at;
  if (status === 'Resolved') {
    resolvedAt = nowISO();
  } else if (status === 'Open' || status === 'In Progress') {
    resolvedAt = null;
  }

  const stmt = db.prepare(`
    UPDATE incidents
    SET status = ?, resolved_at = ?
    WHERE id = ?
  `);
  stmt.run(status, resolvedAt, id);

  const updated = db.prepare('SELECT * FROM incidents WHERE id = ?').get(id);
  res.json(updated);
});

/**
 * GET /api/stats
 * Returns summary stats for dashboard
 */
app.get('/api/stats', (req, res) => {
  const totalIncidents = db.prepare('SELECT COUNT(*) as c FROM incidents').get().c;

  const openIncidents = db.prepare(
    "SELECT COUNT(*) as c FROM incidents WHERE status != 'Resolved'"
  ).get().c;

  const resolvedIncidents = db.prepare(
    "SELECT COUNT(*) as c FROM incidents WHERE status = 'Resolved'"
  ).get().c;

  const bySeverityRows = db.prepare(`
    SELECT severity, COUNT(*) as count
    FROM incidents
    GROUP BY severity
  `).all();
  const bySeverity = {};
  bySeverityRows.forEach(row => {
    bySeverity[row.severity] = row.count;
  });

  // MTTR (Mean Time To Resolve) in hours
  const mttrRows = db.prepare(`
    SELECT created_at, resolved_at
    FROM incidents
    WHERE resolved_at IS NOT NULL
  `).all();

  let mttrHours = null;
  if (mttrRows.length > 0) {
    const totalMs = mttrRows.reduce((sum, row) => {
      const created = new Date(row.created_at);
      const resolved = new Date(row.resolved_at);
      return sum + (resolved - created);
    }, 0);
    mttrHours = +(totalMs / mttrRows.length / (1000 * 60 * 60)).toFixed(2);
  }

  // Incidents per day (last 7 days)
  const incidentsPerDayRows = db.prepare(`
    SELECT DATE(created_at) as day, COUNT(*) as count
    FROM incidents
    GROUP BY DATE(created_at)
    ORDER BY day DESC
    LIMIT 7
  `).all();

  res.json({
    totalIncidents,
    openIncidents,
    resolvedIncidents,
    bySeverity,
    mttrHours,
    incidentsPerDay: incidentsPerDayRows.reverse() // oldest first
  });
});

// Basic health check
app.get('/', (req, res) => {
  res.send('Incident Dashboard API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
