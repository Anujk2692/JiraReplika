import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { issuesApi } from '../api';

export default function CreateIssueModal({ isOpen, onClose, onIssueCreated, defaultValues = {} }) {
  const { projects, currentProject, sprints } = useProject();
  const [projectId, setProjectId] = useState(defaultValues.projectId || currentProject?.id || '');
  const [type, setType] = useState(defaultValues.type || 'TASK');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState(defaultValues.status || 'TO_DO');
  const [assigneeId, setAssigneeId] = useState('');
  const [sprintId, setSprintId] = useState(defaultValues.sprintId || '');
  const [storyPoints, setStoryPoints] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!summary.trim() || !projectId) return;

    try {
      setLoading(true);
      const labelArray = labels
        .split(',')
        .map(l => l.trim())
        .filter(Boolean);

      await issuesApi.create({
        projectId: Number(projectId),
        summary: summary.trim(),
        description: description.trim() || null,
        type,
        priority,
        status,
        assigneeId: assigneeId ? Number(assigneeId) : null,
        sprintId: sprintId ? Number(sprintId) : null,
        storyPoints: storyPoints ? Number(storyPoints) : null,
        dueDate: dueDate || null,
        labels: labelArray
      });

      onIssueCreated();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeProject = projects.find(p => p.id === Number(projectId)) || currentProject;

  return (
    <div className="jira-modal-backdrop" onClick={onClose}>
      <div className="jira-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create issue</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row-2">
            <div className="form-group">
              <label>Project *</label>
              <select 
                value={projectId} 
                onChange={e => setProjectId(e.target.value)}
                required
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.key})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Issue type *</label>
              <select value={type} onChange={e => setType(e.target.value)} required>
                <option value="TASK">Task</option>
                <option value="STORY">Story</option>
                <option value="BUG">Bug</option>
                <option value="EPIC">Epic</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Summary *</label>
            <input 
              type="text" 
              required
              placeholder="What needs to be done?"
              value={summary}
              onChange={e => setSummary(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              rows={4}
              placeholder="Add additional context, acceptance criteria or steps to reproduce..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="HIGHEST">Highest</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                <option value="LOWEST">Lowest</option>
              </select>
            </div>

            <div className="form-group">
              <label>Assignee</label>
              <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                <option value="">Unassigned</option>
                {activeProject?.members?.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Sprint</label>
              <select value={sprintId} onChange={e => setSprintId(e.target.value)}>
                <option value="">Backlog</option>
                {sprints.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label>Story Points</label>
              <input 
                type="number" 
                min="0"
                placeholder="e.g. 3, 5, 8"
                value={storyPoints}
                onChange={e => setStoryPoints(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input 
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Labels (comma separated)</label>
              <input 
                type="text" 
                placeholder="frontend, api, release"
                value={labels}
                onChange={e => setLabels(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading || !summary.trim()}>
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
