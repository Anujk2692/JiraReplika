import React, { useState, useEffect, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { issuesApi, commentsApi, activityApi } from '../api';

export default function IssueModal({ issueId, onClose, onIssueUpdated }) {
  const { currentProject, sprints } = useProject();
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('comments'); // 'comments' | 'history'
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descText, setDescText] = useState('');

  const loadIssueData = useCallback(async () => {
    if (!issueId) return;
    try {
      setLoading(true);
      const data = await issuesApi.getById(issueId);
      setIssue(data);
      setSummaryText(data.summary);
      setDescText(data.description || '');

      const [cmts, acts] = await Promise.all([
        commentsApi.getByIssue(issueId),
        activityApi.getByIssue(issueId)
      ]);
      setComments(cmts);
      setActivities(acts);
    } catch (err) {
      console.error('Failed to load issue', err);
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    loadIssueData();
  }, [loadIssueData]);

  if (!issueId) return null;

  const handleSaveSummary = async () => {
    if (!summaryText.trim()) return;
    try {
      const updated = await issuesApi.update(issue.id, { summary: summaryText.trim() });
      setIssue(updated);
      setIsEditingSummary(false);
      onIssueUpdated();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveDescription = async () => {
    try {
      const updated = await issuesApi.update(issue.id, { description: descText });
      setIssue(updated);
      setIsEditingDesc(false);
      onIssueUpdated();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await issuesApi.updateStatus(issue.id, newStatus);
      setIssue(updated);
      loadIssueData();
      onIssueUpdated();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssigneeChange = async (assigneeId) => {
    try {
      const updated = await issuesApi.updateAssignee(issue.id, assigneeId ? Number(assigneeId) : null);
      setIssue(updated);
      loadIssueData();
      onIssueUpdated();
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      const updated = await issuesApi.update(issue.id, { priority: newPriority });
      setIssue(updated);
      loadIssueData();
      onIssueUpdated();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSprintChange = async (sprintId) => {
    try {
      const updated = await issuesApi.moveSprint(issue.id, sprintId ? Number(sprintId) : null);
      setIssue(updated);
      loadIssueData();
      onIssueUpdated();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStoryPointsChange = async (pts) => {
    try {
      const updated = await issuesApi.update(issue.id, { storyPoints: pts ? Number(pts) : null });
      setIssue(updated);
      onIssueUpdated();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const added = await commentsApi.add(issue.id, newComment.trim());
      setComments([...comments, added]);
      setNewComment('');
      loadIssueData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentsApi.delete(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteIssue = async () => {
    if (!confirm(`Are you sure you want to delete ${issue.issueKey}?`)) return;
    try {
      await issuesApi.delete(issue.id);
      onIssueUpdated();
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="jira-modal-backdrop" onClick={onClose}>
      <div className="jira-issue-drawer" onClick={e => e.stopPropagation()}>
        {loading || !issue ? (
          <div className="drawer-loading">Loading issue {issueId}...</div>
        ) : (
          <>
            {/* Drawer Header */}
            <div className="drawer-header">
              <div className="drawer-header-left">
                <span className={`issue-type-badge ${issue.type.toLowerCase()}`}>
                  {issue.type}
                </span>
                <span className="drawer-issue-key">{issue.issueKey}</span>
              </div>
              <div className="drawer-header-actions">
                <button 
                  className="btn-icon" 
                  title="Copy link" 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Copied link to clipboard!');
                  }}
                >
                  🔗
                </button>
                <button className="btn-icon text-danger" title="Delete issue" onClick={handleDeleteIssue}>
                  🗑️
                </button>
                <button className="btn-icon close-btn" onClick={onClose}>&times;</button>
              </div>
            </div>

            {/* Drawer Body - Split 2-Column Layout */}
            <div className="drawer-content-split">
              {/* Left Column: Details & Collaboration */}
              <div className="drawer-left-col">
                {/* Summary Title */}
                <div className="issue-summary-box">
                  {isEditingSummary ? (
                    <div className="edit-summary-form">
                      <input 
                        type="text" 
                        value={summaryText} 
                        onChange={e => setSummaryText(e.target.value)} 
                        autoFocus
                      />
                      <div className="edit-actions-row">
                        <button className="btn-primary-sm" onClick={handleSaveSummary}>Save</button>
                        <button className="btn-secondary-sm" onClick={() => setIsEditingSummary(false)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <h1 
                      className="issue-summary-heading" 
                      onClick={() => setIsEditingSummary(true)}
                      title="Click to edit summary"
                    >
                      {issue.summary}
                    </h1>
                  )}
                </div>

                {/* Description */}
                <div className="issue-section-group">
                  <div className="section-header-title">Description</div>
                  {isEditingDesc ? (
                    <div className="edit-desc-form">
                      <textarea 
                        rows={6} 
                        value={descText} 
                        onChange={e => setDescText(e.target.value)} 
                        placeholder="Add a detailed description..."
                        autoFocus
                      />
                      <div className="edit-actions-row">
                        <button className="btn-primary-sm" onClick={handleSaveDescription}>Save</button>
                        <button className="btn-secondary-sm" onClick={() => setIsEditingDesc(false)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="desc-preview-box" 
                      onClick={() => setIsEditingDesc(true)}
                      title="Click to edit description"
                    >
                      {issue.description ? (
                        <p>{issue.description}</p>
                      ) : (
                        <span className="placeholder-text">Add a description...</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Activity Section (Comments / History) */}
                <div className="issue-section-group">
                  <div className="activity-tabs-header">
                    <span className="activity-title">Activity</span>
                    <div className="activity-tab-buttons">
                      <button 
                        className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('comments')}
                      >
                        Comments ({comments.length})
                      </button>
                      <button 
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                      >
                        History ({activities.length})
                      </button>
                    </div>
                  </div>

                  {activeTab === 'comments' && (
                    <div className="comments-stream-container">
                      <form onSubmit={handleAddComment} className="new-comment-input-row">
                        <img src={user?.avatarUrl} alt={user?.name} className="comment-user-avatar" />
                        <div className="comment-textarea-wrap">
                          <textarea 
                            rows={3}
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                          />
                          {newComment && (
                            <div className="comment-btn-row">
                              <button type="submit" className="btn-primary-sm">Save</button>
                              <button type="button" className="btn-secondary-sm" onClick={() => setNewComment('')}>Cancel</button>
                            </div>
                          )}
                        </div>
                      </form>

                      <div className="comments-list">
                        {comments.map(c => (
                          <div key={c.id} className="comment-item">
                            <img src={c.author?.avatarUrl} alt={c.author?.name} className="comment-user-avatar" />
                            <div className="comment-content-box">
                              <div className="comment-meta-row">
                                <span className="comment-author-name">{c.author?.name}</span>
                                <span className="comment-timestamp">
                                  {new Date(c.createdAt).toLocaleString()}
                                </span>
                                {user?.id === c.author?.id && (
                                  <button 
                                    className="delete-comment-btn" 
                                    onClick={() => handleDeleteComment(c.id)}
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                              <div className="comment-text-body">{c.content}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'history' && (
                    <div className="activity-history-list">
                      {activities.map(act => (
                        <div key={act.id} className="history-item-row">
                          <img src={act.user?.avatarUrl} alt={act.user?.name} className="history-user-avatar" />
                          <div className="history-item-text">
                            <strong>{act.user?.name}</strong> {act.action.replace('_', ' ').toLowerCase()}:
                            {act.fieldName && <span> changed <strong>{act.fieldName}</strong></span>}
                            {act.oldValue && <span className="old-val"> from {act.oldValue}</span>}
                            {act.newValue && <span className="new-val"> to {act.newValue}</span>}
                            <span className="history-time">{new Date(act.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}

                      {activities.length === 0 && (
                        <div className="empty-history">No activity recorded yet.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Metadata & Assignment Fields */}
              <div className="drawer-right-col">
                {/* Status Field */}
                <div className="meta-field-item">
                  <label>Status</label>
                  <select 
                    className={`drawer-status-select status-${issue.status.toLowerCase().replace('_', '-')}`}
                    value={issue.status}
                    onChange={e => handleStatusChange(e.target.value)}
                  >
                    <option value="BACKLOG">BACKLOG</option>
                    <option value="TO_DO">TO DO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="IN_REVIEW">IN REVIEW</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>

                {/* Assignee Field */}
                <div className="meta-field-item">
                  <label>Assignee</label>
                  <select 
                    className="drawer-select"
                    value={issue.assignee ? issue.assignee.id : ''}
                    onChange={e => handleAssigneeChange(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {currentProject?.members?.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  {issue.assignee && (
                    <div className="assignee-preview-badge">
                      <img src={issue.assignee.avatarUrl} alt={issue.assignee.name} className="assignee-sm-avatar" />
                      <span>{issue.assignee.name}</span>
                    </div>
                  )}
                </div>

                {/* Reporter Field */}
                <div className="meta-field-item">
                  <label>Reporter</label>
                  <div className="reporter-preview-badge">
                    <img src={issue.reporter?.avatarUrl} alt={issue.reporter?.name} className="assignee-sm-avatar" />
                    <span>{issue.reporter?.name}</span>
                  </div>
                </div>

                {/* Priority Field */}
                <div className="meta-field-item">
                  <label>Priority</label>
                  <select 
                    className="drawer-select"
                    value={issue.priority}
                    onChange={e => handlePriorityChange(e.target.value)}
                  >
                    <option value="HIGHEST">Highest</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                    <option value="LOWEST">Lowest</option>
                  </select>
                </div>

                {/* Sprint Field */}
                <div className="meta-field-item">
                  <label>Sprint</label>
                  <select 
                    className="drawer-select"
                    value={issue.sprintId || ''}
                    onChange={e => handleSprintChange(e.target.value)}
                  >
                    <option value="">Backlog</option>
                    {sprints.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                    ))}
                  </select>
                </div>

                {/* Story Points Field */}
                <div className="meta-field-item">
                  <label>Story Points</label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    placeholder="Points (e.g. 1, 2, 3, 5, 8)"
                    value={issue.storyPoints ?? ''}
                    onChange={e => handleStoryPointsChange(e.target.value)}
                  />
                </div>

                {/* Due Date */}
                <div className="meta-field-item">
                  <label>Due Date</label>
                  <input 
                    type="date"
                    value={issue.dueDate || ''}
                    onChange={e => {
                      issuesApi.update(issue.id, { dueDate: e.target.value || null })
                        .then(updated => {
                          setIssue(updated);
                          onIssueUpdated();
                        });
                    }}
                  />
                </div>

                {/* Timestamps */}
                <div className="meta-timestamps">
                  <div>Created: {new Date(issue.createdAt).toLocaleDateString()}</div>
                  <div>Updated: {new Date(issue.updatedAt).toLocaleDateString()}</div>
                  {issue.resolvedAt && (
                    <div className="text-success">Resolved: {new Date(issue.resolvedAt).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
