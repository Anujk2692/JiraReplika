import React, { useState, useEffect, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import { issuesApi } from '../api';

export default function ListView({ onSelectIssue, searchTerm }) {
  const { currentProject } = useProject();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('key');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchIssues = useCallback(async () => {
    if (!currentProject) return;
    try {
      setLoading(true);
      const data = await issuesApi.filter({
        projectId: currentProject.id,
        search: searchTerm || null
      });
      setIssues(data);
    } catch (err) {
      console.error('Failed to load issues for list view', err);
    } finally {
      setLoading(false);
    }
  }, [currentProject, searchTerm]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      await issuesApi.updateStatus(issueId, newStatus);
      setIssues(prev => prev.map(i => i.id === issueId ? { ...i, status: newStatus } : i));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssigneeChange = async (issueId, assigneeId) => {
    try {
      const updated = await issuesApi.updateAssignee(issueId, assigneeId || null);
      setIssues(prev => prev.map(i => i.id === issueId ? { ...i, assignee: updated.assignee } : i));
    } catch (err) {
      alert(err.message);
    }
  };

  const sortedIssues = [...issues].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    if (sortBy === 'key') {
      aVal = a.issueKey;
      bVal = b.issueKey;
    }
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="jira-list-container">
      <div className="list-header">
        <div className="board-breadcrumbs">
          <span>Projects</span> / <span>{currentProject?.name}</span> / <span>List view</span>
        </div>
        <h1 className="board-title">Issues list ({issues.length})</h1>
      </div>

      <div className="jira-table-wrapper">
        <table className="jira-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('type')} style={{ cursor: 'pointer' }}>Type</th>
              <th onClick={() => toggleSort('key')} style={{ cursor: 'pointer' }}>Key</th>
              <th onClick={() => toggleSort('summary')} style={{ cursor: 'pointer' }}>Summary</th>
              <th onClick={() => toggleSort('status')} style={{ cursor: 'pointer' }}>Status</th>
              <th onClick={() => toggleSort('priority')} style={{ cursor: 'pointer' }}>Priority</th>
              <th>Assignee</th>
              <th onClick={() => toggleSort('storyPoints')} style={{ cursor: 'pointer' }}>Points</th>
              <th>Sprint</th>
            </tr>
          </thead>
          <tbody>
            {sortedIssues.map(issue => (
              <tr key={issue.id} onClick={() => onSelectIssue(issue.id)} className="clickable-row">
                <td>
                  <span className={`issue-type-badge ${issue.type.toLowerCase()}`}>
                    {issue.type.substring(0, 1)}
                  </span>
                </td>
                <td className="font-semibold text-primary">{issue.issueKey}</td>
                <td className="summary-cell">{issue.summary}</td>
                <td onClick={e => e.stopPropagation()}>
                  <select 
                    className={`status-select status-${issue.status.toLowerCase().replace('_', '-')}`}
                    value={issue.status}
                    onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                  >
                    <option value="BACKLOG">BACKLOG</option>
                    <option value="TO_DO">TO DO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="IN_REVIEW">IN REVIEW</option>
                    <option value="DONE">DONE</option>
                  </select>
                </td>
                <td>
                  <span className={`priority-text priority-${issue.priority.toLowerCase()}`}>
                    {issue.priority}
                  </span>
                </td>
                <td onClick={e => e.stopPropagation()}>
                  <select
                    className="assignee-select"
                    value={issue.assignee ? issue.assignee.id : ''}
                    onChange={(e) => handleAssigneeChange(issue.id, e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">Unassigned</option>
                    {currentProject?.members?.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </td>
                <td>
                  {issue.storyPoints != null ? (
                    <span className="story-points-pill">{issue.storyPoints}</span>
                  ) : '-'}
                </td>
                <td>
                  <span className="sprint-cell-text">{issue.sprintName || 'Backlog'}</span>
                </td>
              </tr>
            ))}

            {sortedIssues.length === 0 && (
              <tr>
                <td colSpan={8} className="empty-table-row">No issues found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
