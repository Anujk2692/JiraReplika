import React, { useState, useEffect, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { issuesApi } from '../api';

const COLUMNS = [
  { id: 'BACKLOG', title: 'BACKLOG' },
  { id: 'TO_DO', title: 'TO DO' },
  { id: 'IN_PROGRESS', title: 'IN PROGRESS' },
  { id: 'IN_REVIEW', title: 'IN REVIEW' },
  { id: 'DONE', title: 'DONE' }
];

export default function KanbanBoard({ onSelectIssue, onQuickCreate, searchTerm }) {
  const { currentProject, activeSprint } = useProject();
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [onlyMyIssues, setOnlyMyIssues] = useState(false);
  const [draggedIssueId, setDraggedIssueId] = useState(null);

  const fetchIssues = useCallback(async () => {
    if (!currentProject) return;
    try {
      setLoading(true);
      const data = await issuesApi.filter({
        projectId: currentProject.id,
        assigneeId: onlyMyIssues ? user?.id : selectedAssigneeId,
        type: selectedType || null,
        priority: selectedPriority || null,
        search: searchTerm || null
      });
      setIssues(data);
    } catch (err) {
      console.error('Failed to fetch board issues', err);
    } finally {
      setLoading(false);
    }
  }, [currentProject, onlyMyIssues, selectedAssigneeId, selectedType, selectedPriority, searchTerm, user]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Drag and Drop handlers
  const handleDragStart = (e, issueId) => {
    e.dataTransfer.setData('text/plain', issueId.toString());
    setDraggedIssueId(issueId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const issueId = Number(e.dataTransfer.getData('text/plain') || draggedIssueId);
    if (!issueId) return;

    const currentIssue = issues.find(i => i.id === issueId);
    if (!currentIssue || currentIssue.status === targetStatus) return;

    // Optimistic UI update
    setIssues(prev => prev.map(item => 
      item.id === issueId ? { ...item, status: targetStatus } : item
    ));

    try {
      await issuesApi.updateStatus(issueId, targetStatus);
    } catch (err) {
      console.error('Failed to update status', err);
      fetchIssues(); // Rollback on error
    } finally {
      setDraggedIssueId(null);
    }
  };

  // Helper icons
  const getTypeIcon = (type) => {
    switch (type) {
      case 'BUG':
        return <span className="type-icon type-bug" title="Bug">&#9679;</span>;
      case 'STORY':
        return <span className="type-icon type-story" title="Story">&#9632;</span>;
      case 'EPIC':
        return <span className="type-icon type-epic" title="Epic">&#9889;</span>;
      default:
        return <span className="type-icon type-task" title="Task">&#10003;</span>;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGHEST': return <span className="priority-highest" title="Highest Priority">&uarr;&uarr;</span>;
      case 'HIGH': return <span className="priority-high" title="High Priority">&uarr;</span>;
      case 'LOW': return <span className="priority-low" title="Low Priority">&darr;</span>;
      case 'LOWEST': return <span className="priority-lowest" title="Lowest Priority">&darr;&darr;</span>;
      default: return <span className="priority-medium" title="Medium Priority">=</span>;
    }
  };

  const clearFilters = () => {
    setSelectedAssigneeId(null);
    setSelectedType('');
    setSelectedPriority('');
    setOnlyMyIssues(false);
  };

  return (
    <div className="jira-kanban-container">
      {/* Board Header */}
      <div className="board-header">
        <div className="board-breadcrumbs">
          <span>Projects</span> / <span>{currentProject?.name}</span> / <span>Kanban board</span>
        </div>
        <div className="board-title-row">
          <h1 className="board-title">Kanban board</h1>
          {activeSprint && (
            <div className="active-sprint-badge">
              Active Sprint: <strong>{activeSprint.name}</strong>
            </div>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="board-filters-bar">
          <button 
            className={`filter-pill ${onlyMyIssues ? 'active' : ''}`}
            onClick={() => setOnlyMyIssues(!onlyMyIssues)}
          >
            Only my issues
          </button>

          <div className="assignee-avatars-filter">
            {currentProject?.members?.map(member => (
              <img
                key={member.id}
                src={member.avatarUrl}
                alt={member.name}
                title={`Filter by: ${member.name}`}
                className={`filter-avatar ${selectedAssigneeId === member.id ? 'active' : ''}`}
                onClick={() => setSelectedAssigneeId(selectedAssigneeId === member.id ? null : member.id)}
              />
            ))}
          </div>

          <select 
            className="filter-select" 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">Type: All</option>
            <option value="STORY">Story</option>
            <option value="TASK">Task</option>
            <option value="BUG">Bug</option>
            <option value="EPIC">Epic</option>
          </select>

          <select 
            className="filter-select" 
            value={selectedPriority} 
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="">Priority: All</option>
            <option value="HIGHEST">Highest</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="LOWEST">Lowest</option>
          </select>

          {(selectedAssigneeId || selectedType || selectedPriority || onlyMyIssues) && (
            <button className="filter-clear-btn" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Board Columns Grid */}
      <div className="kanban-columns-grid">
        {COLUMNS.map(col => {
          const colIssues = issues.filter(i => i.status === col.id);
          const totalPoints = colIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);

          return (
            <div 
              key={col.id} 
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="column-header">
                <span className="column-title">{col.title}</span>
                <span className="column-count-badge">
                  {colIssues.length} {totalPoints > 0 && `· ${totalPoints} pts`}
                </span>
              </div>

              <div className="column-cards-list">
                {colIssues.map(issue => (
                  <div 
                    key={issue.id} 
                    className="jira-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, issue.id)}
                    onClick={() => onSelectIssue(issue.id)}
                  >
                    <div className="card-summary">{issue.summary}</div>
                    
                    {issue.labels && issue.labels.length > 0 && (
                      <div className="card-labels-row">
                        {issue.labels.slice(0, 3).map(lbl => (
                          <span key={lbl} className="card-label-tag">{lbl}</span>
                        ))}
                      </div>
                    )}

                    <div className="card-footer">
                      <div className="card-footer-left">
                        {getTypeIcon(issue.type)}
                        <span className="card-issue-key">{issue.issueKey}</span>
                        {getPriorityIcon(issue.priority)}
                      </div>

                      <div className="card-footer-right">
                        {issue.storyPoints != null && (
                          <span className="story-points-badge">{issue.storyPoints}</span>
                        )}
                        {issue.commentsCount > 0 && (
                          <span className="card-comments-count" title={`${issue.commentsCount} comments`}>
                            💬 {issue.commentsCount}
                          </span>
                        )}
                        {issue.assignee ? (
                          <img 
                            src={issue.assignee.avatarUrl} 
                            alt={issue.assignee.name} 
                            title={`Assigned to ${issue.assignee.name}`}
                            className="card-assignee-avatar" 
                          />
                        ) : (
                          <div className="unassigned-avatar" title="Unassigned">?</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {colIssues.length === 0 && (
                  <div className="empty-column-placeholder">No issues</div>
                )}
              </div>

              <button 
                className="column-add-card-btn"
                onClick={() => onQuickCreate({ status: col.id })}
              >
                + Create issue
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
