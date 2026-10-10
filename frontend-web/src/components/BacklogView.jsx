import React, { useState, useEffect, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import { sprintsApi, issuesApi } from '../api';

export default function BacklogView({ onSelectIssue, onOpenCreateIssue }) {
  const { currentProject, sprints, reloadSprints } = useProject();
  const [allIssues, setAllIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateSprintModal, setShowCreateSprintModal] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');
  const [newSprintGoal, setNewSprintGoal] = useState('');

  const fetchIssues = useCallback(async () => {
    if (!currentProject) return;
    try {
      setLoading(true);
      const data = await issuesApi.filter({ projectId: currentProject.id });
      setAllIssues(data);
    } catch (err) {
      console.error('Failed to load issues for backlog', err);
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    if (!newSprintName.trim() || !currentProject) return;
    try {
      await sprintsApi.create(currentProject.id, {
        name: newSprintName.trim(),
        goal: newSprintGoal.trim()
      });
      setNewSprintName('');
      setNewSprintGoal('');
      setShowCreateSprintModal(false);
      reloadSprints();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStartSprint = async (sprintId) => {
    try {
      await sprintsApi.start(sprintId);
      reloadSprints();
      fetchIssues();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCompleteSprint = async (sprintId) => {
    if (!confirm('Are you sure you want to complete this sprint? Incomplete issues will move to the backlog.')) return;
    try {
      await sprintsApi.complete(sprintId);
      reloadSprints();
      fetchIssues();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMoveIssue = async (issueId, targetSprintId) => {
    try {
      await issuesApi.moveSprint(issueId, targetSprintId);
      fetchIssues();
      reloadSprints();
    } catch (err) {
      alert(err.message);
    }
  };

  const backlogIssues = allIssues.filter(i => !i.sprintId);

  return (
    <div className="jira-backlog-container">
      <div className="backlog-header">
        <div className="board-breadcrumbs">
          <span>Projects</span> / <span>{currentProject?.name}</span> / <span>Backlog</span>
        </div>
        <div className="board-title-row">
          <h1 className="board-title">Backlog & Sprints</h1>
          <button className="btn-secondary" onClick={() => setShowCreateSprintModal(true)}>
            Create sprint
          </button>
        </div>
      </div>

      {/* Sprints Sections */}
      <div className="sprints-list-wrapper">
        {sprints.map(sprint => {
          const sprintIssues = allIssues.filter(i => i.sprintId === sprint.id);
          const points = sprintIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);

          return (
            <div key={sprint.id} className={`sprint-card-box ${sprint.status.toLowerCase()}`}>
              <div className="sprint-header">
                <div className="sprint-header-left">
                  <h3 className="sprint-title">{sprint.name}</h3>
                  <span className={`sprint-status-tag ${sprint.status.toLowerCase()}`}>
                    {sprint.status}
                  </span>
                  {sprint.goal && <span className="sprint-goal-text">“{sprint.goal}”</span>}
                </div>

                <div className="sprint-header-right">
                  <span className="sprint-issue-count">
                    {sprintIssues.length} issues · {points} pts
                  </span>
                  {onOpenCreateIssue && (
                    <button 
                      className="btn-secondary-sm" 
                      onClick={() => onOpenCreateIssue({ sprintId: sprint.id, status: 'TO_DO' })}
                      title="Create issue in this sprint"
                    >
                      + Create issue
                    </button>
                  )}
                  {sprint.status === 'FUTURE' && (
                    <button className="btn-primary-sm" onClick={() => handleStartSprint(sprint.id)}>
                      Start sprint
                    </button>
                  )}
                  {sprint.status === 'ACTIVE' && (
                    <button className="btn-success-sm" onClick={() => handleCompleteSprint(sprint.id)}>
                      Complete sprint
                    </button>
                  )}
                </div>
              </div>

              <div className="sprint-issues-table">
                {sprintIssues.map(issue => (
                  <div key={issue.id} className="backlog-issue-row" onClick={() => onSelectIssue(issue.id)}>
                    <div className="row-left">
                      <span className={`issue-type-badge ${issue.type.toLowerCase()}`}>
                        {issue.type.substring(0, 1)}
                      </span>
                      <span className="row-key">{issue.issueKey}</span>
                      <span className="row-summary">{issue.summary}</span>
                    </div>

                    <div className="row-right" onClick={(e) => e.stopPropagation()}>
                      <span className={`status-badge status-${issue.status.toLowerCase().replace('_', '-')}`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                      {issue.storyPoints != null && (
                        <span className="story-points-pill">{issue.storyPoints}</span>
                      )}
                      {issue.assignee ? (
                        <img src={issue.assignee.avatarUrl} alt={issue.assignee.name} className="assignee-sm-avatar" />
                      ) : (
                        <span className="unassigned-sm">?</span>
                      )}
                      <select 
                        className="move-sprint-select"
                        value={sprint.id}
                        onChange={(e) => handleMoveIssue(issue.id, e.target.value === 'backlog' ? null : Number(e.target.value))}
                      >
                        <option value={sprint.id}>Current Sprint</option>
                        <option value="backlog">Move to Backlog</option>
                        {sprints.filter(s => s.id !== sprint.id).map(s => (
                          <option key={s.id} value={s.id}>Move to {s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {sprintIssues.length === 0 && (
                  <div className="sprint-empty-state">
                    Plan a sprint by dragging issues here from the backlog or moving them.
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Backlog Section */}
        <div className="backlog-section-box">
          <div className="sprint-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="sprint-header-left">
              <h3 className="sprint-title">Backlog</h3>
              <span className="sprint-issue-count">({backlogIssues.length} issues)</span>
            </div>
            {onOpenCreateIssue && (
              <button 
                className="btn-secondary-sm" 
                onClick={() => onOpenCreateIssue({ sprintId: null, status: 'BACKLOG' })}
                title="Create issue in backlog"
              >
                + Create issue
              </button>
            )}
          </div>

          <div className="sprint-issues-table">
            {backlogIssues.map(issue => (
              <div key={issue.id} className="backlog-issue-row" onClick={() => onSelectIssue(issue.id)}>
                <div className="row-left">
                  <span className={`issue-type-badge ${issue.type.toLowerCase()}`}>
                    {issue.type.substring(0, 1)}
                  </span>
                  <span className="row-key">{issue.issueKey}</span>
                  <span className="row-summary">{issue.summary}</span>
                </div>

                <div className="row-right" onClick={(e) => e.stopPropagation()}>
                  <span className={`status-badge status-${issue.status.toLowerCase().replace('_', '-')}`}>
                    {issue.status.replace('_', ' ')}
                  </span>
                  {issue.storyPoints != null && (
                    <span className="story-points-pill">{issue.storyPoints}</span>
                  )}
                  {issue.assignee ? (
                    <img src={issue.assignee.avatarUrl} alt={issue.assignee.name} className="assignee-sm-avatar" />
                  ) : (
                    <span className="unassigned-sm">?</span>
                  )}
                  {sprints.length > 0 && (
                    <select 
                      className="move-sprint-select"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) handleMoveIssue(issue.id, Number(e.target.value));
                      }}
                    >
                      <option value="" disabled>Move to sprint...</option>
                      {sprints.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ))}

            {backlogIssues.length === 0 && (
              <div className="sprint-empty-state">Your backlog is empty.</div>
            )}
          </div>
        </div>
      </div>

      {/* Create Sprint Modal */}
      {showCreateSprintModal && (
        <div className="jira-modal-backdrop" onClick={() => setShowCreateSprintModal(false)}>
          <div className="jira-modal-content sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Sprint</h2>
              <button className="modal-close-btn" onClick={() => setShowCreateSprintModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateSprint} className="modal-body">
              <div className="form-group">
                <label>Sprint Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Sprint 4 - Performance & Security"
                  value={newSprintName}
                  onChange={e => setNewSprintName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Sprint Goal</label>
                <textarea 
                  rows={3} 
                  placeholder="What is the team committing to achieve?"
                  value={newSprintGoal}
                  onChange={e => setNewSprintGoal(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateSprintModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Sprint</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
