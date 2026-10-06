import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { authApi, projectsApi } from '../api';

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
  const { user } = useAuth();
  const { reloadProjects } = useProject();

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [keyTouched, setKeyTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('SOFTWARE');
  const [leadId, setLeadId] = useState(user?.id || '');
  const [selectedMembers, setSelectedMembers] = useState(new Set());
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      authApi.getAllUsers()
        .then(users => {
          setAllUsers(users);
          if (!leadId && user) {
            setLeadId(user.id);
          }
        })
        .catch(console.error);
    }
  }, [isOpen, user, leadId]);

  if (!isOpen) return null;

  const handleNameChange = (val) => {
    setName(val);
    if (!keyTouched) {
      // Generate key: e.g. "Mobile Banking App" -> "MBA"
      const words = val.trim().split(/\s+/).filter(Boolean);
      let suggested = '';
      if (words.length === 1) {
        suggested = words[0].substring(0, 4).toUpperCase();
      } else {
        suggested = words.map(w => w[0]).join('').substring(0, 6).toUpperCase();
      }
      setKey(suggested.replace(/[^A-Z0-9]/g, ''));
    }
  };

  const toggleMember = (userId) => {
    setSelectedMembers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanKey = key.trim().toUpperCase();

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    if (!cleanKey || cleanKey.length < 2 || cleanKey.length > 10) {
      setError('Project key must be between 2 and 10 uppercase alphanumeric characters (e.g. PROJ)');
      return;
    }

    try {
      setLoading(true);
      const memberIdsArray = Array.from(selectedMembers);
      if (leadId && !memberIdsArray.includes(Number(leadId))) {
        memberIdsArray.push(Number(leadId));
      }

      const newProj = await projectsApi.create({
        name: name.trim(),
        key: cleanKey,
        description: description.trim() || null,
        category,
        leadId: leadId ? Number(leadId) : null,
        memberIds: memberIdsArray
      });

      setName('');
      setKey('');
      setKeyTouched(false);
      setDescription('');
      setSelectedMembers(new Set());
      
      await reloadProjects(newProj.id);
      if (onProjectCreated) onProjectCreated(newProj);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="jira-modal-backdrop" onClick={onClose}>
      <div className="jira-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Project</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="auth-error-alert" style={{ margin: '12px 24px 0' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Project Name <span style={{ color: 'red' }}>*</span></label>
            <input 
              type="text" 
              required
              placeholder="e.g. Mobile Application V2" 
              value={name} 
              onChange={e => handleNameChange(e.target.value)} 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Project Key <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text" 
                required
                maxLength={10}
                placeholder="e.g. MAV" 
                value={key} 
                onChange={e => {
                  setKeyTouched(true);
                  setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                }} 
              />
              <span className="field-hint">Used as issue prefix (e.g. {key || 'KEY'}-1)</span>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="SOFTWARE">Software Development</option>
                <option value="MARKETING">Marketing & Growth</option>
                <option value="BUSINESS">Business & Operations</option>
                <option value="INFRASTRUCTURE">Cloud & Infrastructure</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Project Lead</label>
            <select value={leadId} onChange={e => setLeadId(e.target.value)}>
              {allUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              rows={3} 
              placeholder="Describe the scope, objectives, and deliverables for this project..." 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Initial Team Members</label>
            <div className="members-selection-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 8,
              maxHeight: 140,
              overflowY: 'auto',
              padding: 8,
              backgroundColor: '#FAFBFC',
              borderRadius: 6,
              border: '1px solid #DFE1E6'
            }}>
              {allUsers.map(u => (
                <label 
                  key={u.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    fontSize: 13,
                    padding: 4,
                    borderRadius: 4
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedMembers.has(u.id) || Number(leadId) === u.id}
                    disabled={Number(leadId) === u.id}
                    onChange={() => toggleMember(u.id)}
                  />
                  <span>{u.name}</span>
                </label>
              ))}
            </div>
            <span className="field-hint">You can always add or remove team members later from the Members tab.</span>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating Project...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
