import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { issuesApi, sprintsApi } from '../api';

export default function CreateIssueModal({ isOpen, onClose, onIssueCreated, defaultValues = {} }) {
  const { projects, currentProject, setCurrentProject, sprints } = useProject();

  const getInitialProjectId = () => {
    if (defaultValues?.projectId) return String(defaultValues.projectId);
    if (currentProject?.id) return String(currentProject.id);
    if (projects?.length > 0) return String(projects[0].id);
    return '';
  };

  const [projectId, setProjectId] = useState(getInitialProjectId());
  const [type, setType] = useState(defaultValues?.type || 'TASK');
  const [summary, setSummary] = useState(defaultValues?.summary || '');
  const [description, setDescription] = useState(defaultValues?.description || '');
  const [priority, setPriority] = useState(defaultValues?.priority || 'MEDIUM');
  const [status, setStatus] = useState(defaultValues?.status || 'TO_DO');
  const [assigneeId, setAssigneeId] = useState(defaultValues?.assigneeId ? String(defaultValues.assigneeId) : '');
  const [sprintId, setSprintId] = useState(defaultValues?.sprintId ? String(defaultValues.sprintId) : '');
  const [storyPoints, setStoryPoints] = useState(defaultValues?.storyPoints !== undefined ? String(defaultValues.storyPoints) : '');
  const [dueDate, setDueDate] = useState(defaultValues?.dueDate || '');
  const [labels, setLabels] = useState(
    defaultValues?.labels ? (Array.isArray(defaultValues.labels) ? defaultValues.labels.join(', ') : defaultValues.labels) : ''
  );
  const [availableSprints, setAvailableSprints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Synchronize state whenever modal opens or defaultValues change
  useEffect(() => {
    if (!isOpen) return;

    const initialPid = defaultValues?.projectId 
      ? String(defaultValues.projectId) 
      : currentProject?.id 
        ? String(currentProject.id) 
        : projects?.length > 0 
          ? String(projects[0].id) 
          : '';

    setProjectId(initialPid);
    setType(defaultValues?.type || 'TASK');
    setSummary(defaultValues?.summary || '');
    setDescription(defaultValues?.description || '');
    setPriority(defaultValues?.priority || 'MEDIUM');
    setStatus(defaultValues?.status || 'TO_DO');
    setAssigneeId(defaultValues?.assigneeId ? String(defaultValues.assigneeId) : '');
    setSprintId(defaultValues?.sprintId ? String(defaultValues.sprintId) : '');
    setStoryPoints(defaultValues?.storyPoints !== undefined ? String(defaultValues.storyPoints) : '');
    setDueDate(defaultValues?.dueDate || '');
    setLabels(
      defaultValues?.labels ? (Array.isArray(defaultValues.labels) ? defaultValues.labels.join(', ') : defaultValues.labels) : ''
    );
    setError(null);
  }, [isOpen, defaultValues, currentProject, projects]);

  // Load sprints dynamically when projectId changes
  useEffect(() => {
    if (!projectId) {
      setAvailableSprints([]);
      return;
    }

    const numPid = Number(projectId);
    if (currentProject && currentProject.id === numPid) {
      setAvailableSprints(sprints || []);
    } else {
      sprintsApi.getByProject(numPid)
        .then(data => setAvailableSprints(data || []))
        .catch(() => setAvailableSprints([]));
    }
  }, [projectId, currentProject, sprints]);

  if (!isOpen) return null;

  const activeProject = projects.find(p => p.id === Number(projectId)) || currentProject;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const effectiveProjectId = projectId || currentProject?.id || (projects.length > 0 ? projects[0].id : null);
    if (!effectiveProjectId) {
      setError('Please select or create a project before creating an issue.');
      return;
    }

    if (!summary.trim()) {
      setError('Issue summary cannot be empty.');
      return;
    }

    try {
      setLoading(true);
      const labelArray = labels
        .split(',')
        .map(l => l.trim())
        .filter(Boolean);

      const payload = {
        projectId: Number(effectiveProjectId),
        summary: summary.trim(),
        description: description.trim() || null,
        type,
        priority,
        status,
        assigneeId: assigneeId ? Number(assigneeId) : null,
        sprintId: sprintId ? Number(sprintId) : null,
        storyPoints: storyPoints !== '' && !isNaN(Number(storyPoints)) ? Number(storyPoints) : null,
        dueDate: dueDate || null,
        labels: labelArray
      };

      const created = await issuesApi.create(payload);

      // If user created an issue in a project different than current, switch active project
      if (currentProject && Number(effectiveProjectId) !== currentProject.id && setCurrentProject) {
        const targetProj = projects.find(p => p.id === Number(effectiveProjectId));
        if (targetProj) setCurrentProject(targetProj);
      }

      if (onIssueCreated) {
        onIssueCreated(created);
      }
      onClose();
    } catch (err) {
      console.error('Failed to create issue:', err);
      setError(err.message || 'Failed to create issue. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="jira-modal-backdrop" onClick={onClose}>
      <div className="jira-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create issue</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div 
              className="modal-error-banner" 
              style={{ 
                background: '#FFEBE6', 
                color: '#BF2600', 
                padding: '10px 14px', 
                borderRadius: '4px', 
                fontSize: '13px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="form-row-2">
            <div className="form-group">
              <label>Project *</label>
              <select 
                value={projectId} 
                onChange={e => {
                  setProjectId(e.target.value);
                  setSprintId('');
                  setAssigneeId('');
                }}
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
              <label>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="BACKLOG">Backlog</option>
                <option value="TO_DO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

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
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label>Sprint</label>
              <select value={sprintId} onChange={e => setSprintId(e.target.value)}>
                <option value="">Backlog</option>
                {availableSprints.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Story Points</label>
              <input 
                type="number" 
                min="0"
                placeholder="e.g. 1, 2, 3, 5, 8"
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
