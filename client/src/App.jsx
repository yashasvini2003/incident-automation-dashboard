// client/src/App.jsx
import { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:4000';

function formatDateTime(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString();
}

function App() {
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    serverName: ''
  });

  const [serversFromData, setServersFromData] = useState([]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats', err);
    }
  };

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.serverName) params.append('serverName', filters.serverName);

      const res = await fetch(`${API_BASE}/api/incidents?` + params.toString());
      const data = await res.json();
      setIncidents(data);

      const serverNames = Array.from(new Set(data.map(i => i.server_name))).sort();
      setServersFromData(serverNames);
    } catch (err) {
      console.error('Error fetching incidents', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchStats(), fetchIncidents()]);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [filters.status, filters.severity, filters.serverName]);

  const handleStatusChange = (id, newStatus) => async () => {
    try {
      await fetch(`${API_BASE}/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      await refreshAll();
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const incidentsPerDay = stats?.incidentsPerDay || [];
  const maxCount = incidentsPerDay.reduce(
    (max, d) => (d.count > max ? d.count : max),
    0
  );

  return (
    <div className="app-root">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="dashboard-title">
            <span>Data Centre Incident Monitor</span>
            <span className="dashboard-subtitle">
              Simulated incident automation & reporting dashboard
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="badge">
              <span className="badge-dot" />
              <span>Simulation Live</span>
            </div>
            <button className="refresh-button" onClick={refreshAll}>
              <span>⟳ Refresh</span>
            </button>
          </div>
        </header>

        {/* Stat cards */}
        <section className="grid grid-4" style={{ marginBottom: 16 }}>
          <div className="stat-card">
            <div className="stat-label">Total Incidents</div>
            <div className="stat-value">{stats?.totalIncidents ?? '—'}</div>
            <div className="stat-meta">Across all simulated servers</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Open Incidents</div>
            <div className="stat-value">{stats?.openIncidents ?? '—'}</div>
            <div className="stat-meta">
              {stats && stats.openIncidents > 0
                ? 'Focus on reducing this queue'
                : 'All clear 🚀'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Resolved Incidents</div>
            <div className="stat-value">{stats?.resolvedIncidents ?? '—'}</div>
            <div className="stat-meta">Closed by operations team</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">MTTR (hours)</div>
            <div className="stat-value">
              {stats?.mttrHours != null ? stats.mttrHours : '—'}
            </div>
            <div className="stat-meta">Mean Time To Resolve</div>
          </div>
        </section>

        {/* Filters + tiny chart */}
        <section className="grid grid-2" style={{ marginBottom: 8 }}>
          <div className="filters-card">
            <span className="filter-label">Filters</span>

            <select
              className="filter-select"
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="">Status: All</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              className="filter-select"
              value={filters.severity}
              onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value }))}
            >
              <option value="">Severity: All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>

            <select
              className="filter-select"
              value={filters.serverName}
              onChange={(e) => setFilters((f) => ({ ...f, serverName: e.target.value }))}
            >
              <option value="">Server: All</option>
              {serversFromData.map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
          </div>

          <div className="stat-card">
            <div className="stat-label">Incidents (Last 7 Days)</div>
            <div className="mini-chart">
              {incidentsPerDay.map((d) => {
                const height =
                  maxCount > 0 ? (d.count / maxCount) * 100 : 0;
                return (
                  <div
                    key={d.day}
                    className="mini-bar"
                    style={{ height: `${height || 5}%` }}
                    title={`${d.day}: ${d.count}`}
                  />
                );
              })}
            </div>
            <div className="mini-chart-xaxis">
              {incidentsPerDay.map((d) => (
                <span key={d.day}>
                  {new Date(d.day).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Incident table */}
        <section className="table-card">
          <div className="table-header">
            <div>
              <div className="table-title">Incident Queue</div>
              <div className="table-subtitle">
                View and update incidents generated by the simulator
              </div>
            </div>
            <div className="table-subtitle">
              {loading ? 'Loading…' : `${incidents.length} incidents`}
            </div>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Server</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Resolved</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc) => (
                  <tr key={inc.id}>
                    <td>{inc.id}</td>
                    <td>{inc.server_name}</td>
                    <td>
                      <span
                        className={
                          'sev-pill ' +
                          (inc.severity === 'Low'
                            ? 'sev-low'
                            : inc.severity === 'Medium'
                            ? 'sev-medium'
                            : inc.severity === 'High'
                            ? 'sev-high'
                            : 'sev-critical')
                        }
                      >
                        {inc.severity}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          'status-pill ' +
                          (inc.status === 'Open'
                            ? 'status-open'
                            : inc.status === 'In Progress'
                            ? 'status-in-progress'
                            : 'status-resolved')
                        }
                      >
                        {inc.status}
                      </span>
                    </td>
                    <td>{formatDateTime(inc.created_at)}</td>
                    <td>{formatDateTime(inc.resolved_at)}</td>
                    <td style={{ maxWidth: 260 }}>
                      {inc.description || <span style={{ color: '#6b7280' }}>–</span>}
                    </td>
                    <td className="table-actions">
                      {inc.status !== 'Open' && (
                        <button onClick={handleStatusChange(inc.id, 'Open')}>
                          Mark Open
                        </button>
                      )}
                      {inc.status !== 'In Progress' && (
                        <button onClick={handleStatusChange(inc.id, 'In Progress')}>
                          In Progress
                        </button>
                      )}
                      {inc.status !== 'Resolved' && (
                        <button onClick={handleStatusChange(inc.id, 'Resolved')}>
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {incidents.length === 0 && !loading && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '16px' }}>
                      No incidents match your filters yet. If the simulator is running,
                      new incidents will appear shortly.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
