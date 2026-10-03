import React, { useState, useEffect, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import { dashboardApi } from '../api';

export default function DashboardView() {
  const { currentProject } = useProject();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!currentProject) return;
    try {
      setLoading(true);
      const data = await dashboardApi.getStats(currentProject.id);
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard statistics', err);
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return <div className="loading-state">Loading project analytics...</div>;
  }

  if (!stats) {
    return <div className="empty-state">No statistics available for this project.</div>;
  }

  const completionPct = stats.totalIssues > 0 
    ? Math.round((stats.completedIssues / stats.totalIssues) * 100) 
    : 0;

  const pointsPct = stats.totalStoryPoints > 0
    ? Math.round((stats.completedStoryPoints / stats.totalStoryPoints) * 100)
    : 0;

  return (
    <div className="jira-dashboard-container">
      <div className="dashboard-header">
        <div className="board-breadcrumbs">
          <span>Projects</span> / <span>{currentProject?.name}</span> / <span>Reports</span>
        </div>
        <h1 className="board-title">Project Dashboard & Analytics</h1>
      </div>

      {/* Metrics Row */}
      <div className="analytics-metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Issues</div>
          <div className="metric-value">{stats.totalIssues}</div>
          <div className="metric-subtext">Across backlog & all sprints</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Resolved / Done</div>
          <div className="metric-value text-success">{stats.completedIssues}</div>
          <div className="metric-subtext">{completionPct}% completion rate</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Total Story Points</div>
          <div className="metric-value">{stats.totalStoryPoints}</div>
          <div className="metric-subtext">{stats.completedStoryPoints} points resolved ({pointsPct}%)</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Active Sprint</div>
          <div className="metric-value text-primary">
            {stats.activeSprint ? stats.activeSprint.name : 'No active sprint'}
          </div>
          <div className="metric-subtext">
            {stats.activeSprint?.goal ? `“${stats.activeSprint.goal}”` : 'Plan next sprint in Backlog'}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="analytics-charts-grid">
        {/* Status Distribution */}
        <div className="chart-panel">
          <h3 className="chart-title">Status Breakdown</h3>
          <div className="chart-bars-list">
            {Object.entries(stats.statusDistribution || {}).map(([status, count]) => {
              const pct = stats.totalIssues > 0 ? (count / stats.totalIssues) * 100 : 0;
              return (
                <div key={status} className="chart-bar-item">
                  <div className="bar-info-row">
                    <span className="bar-label">{status.replace('_', ' ')}</span>
                    <span className="bar-val">{count} ({Math.round(pct)}%)</span>
                  </div>
                  <div className="bar-track">
                    <div 
                      className={`bar-fill status-${status.toLowerCase().replace('_', '-')}`} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="chart-panel">
          <h3 className="chart-title">Priority Breakdown</h3>
          <div className="chart-bars-list">
            {Object.entries(stats.priorityDistribution || {}).map(([priority, count]) => {
              const pct = stats.totalIssues > 0 ? (count / stats.totalIssues) * 100 : 0;
              return (
                <div key={priority} className="chart-bar-item">
                  <div className="bar-info-row">
                    <span className="bar-label">{priority}</span>
                    <span className="bar-val">{count} ({Math.round(pct)}%)</span>
                  </div>
                  <div className="bar-track">
                    <div 
                      className={`bar-fill priority-bar-${priority.toLowerCase()}`} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Member Workload Distribution */}
        <div className="chart-panel full-width">
          <h3 className="chart-title">Team Member Workload</h3>
          <div className="workload-cards-grid">
            {Object.entries(stats.assigneeWorkload || {}).map(([name, count]) => (
              <div key={name} className="workload-user-card">
                <div className="workload-user-header">
                  <div className="workload-avatar-initials">{name.substring(0, 2).toUpperCase()}</div>
                  <div className="workload-name">{name}</div>
                </div>
                <div className="workload-count-badge">
                  <strong>{count}</strong> active tasks
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
