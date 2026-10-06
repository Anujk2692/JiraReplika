import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { authApi, projectsApi } from '../api';

export default function MembersView() {
  const { currentProject, reloadProjects } = useProject();
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTab, setModalTab] = useState('existing'); // 'existing' | 'new'
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('Password123!');
  const [newRole, setNewRole] = useState('ROLE_MEMBER');
  const [modalError, setModalError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = () => {
    authApi.getAllUsers().then(setAllUsers).catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!selectedUserId || !currentProject) return;
    try {
      setLoading(true);
      await projectsApi.addMember(currentProject.id, Number(selectedUserId));
      setSelectedUserId('');
      setShowAddModal(false);
      reloadProjects();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAndAddMember = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim() || !currentProject) return;
    try {
      setLoading(true);
      const regRes = await authApi.register(newName.trim(), newEmail.trim().toLowerCase(), newPassword.trim(), null, newRole);
      const newUserId = regRes.user.id;
      await projectsApi.addMember(currentProject.id, newUserId);
      setNewName('');
      setNewEmail('');
      setNewPassword('Password123!');
      setShowAddModal(false);
      fetchUsers();
      reloadProjects();
    } catch (err) {
      setModalError(err.message || 'Failed to register and add user');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Are you sure you want to remove this member from the project?')) return;
    try {
      await projectsApi.removeMember(currentProject.id, userId);
      reloadProjects();
    } catch (err) {
      alert(err.message);
    }
  };

  const existingMemberIds = new Set(currentProject?.members?.map(m => m.id) || []);
  const availableUsers = allUsers.filter(u => !existingMemberIds.has(u.id));

  return (
    <div className="jira-members-container">
      <div className="members-header">
        <div className="board-breadcrumbs">
          <span>Projects</span> / <span>{currentProject?.name}</span> / <span>Members</span>
        </div>
        <div className="board-title-row">
          <h1 className="board-title">Project Members & Access</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-secondary" onClick={() => { setModalTab('existing'); setModalError(''); setShowAddModal(true); }}>
              + Add Existing User
            </button>
            <button className="btn-primary" onClick={() => { setModalTab('new'); setModalError(''); setShowAddModal(true); }}>
              + Register New Member
            </button>
          </div>
        </div>
      </div>

      <div className="members-content-box">
        {/* Project Lead Card */}
        <div className="lead-highlight-box">
          <div className="lead-badge">PROJECT LEAD</div>
          <div className="lead-info-row">
            <img src={currentProject?.lead?.avatarUrl} alt={currentProject?.lead?.name} className="lead-avatar" />
            <div>
              <div className="lead-name">{currentProject?.lead?.name}</div>
              <div className="lead-email">{currentProject?.lead?.email}</div>
            </div>
          </div>
        </div>

        {/* Members List Table */}
        <h3 className="section-subtitle">All Team Members ({currentProject?.members?.length || 0})</h3>
        <table className="jira-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentProject?.members?.map(member => {
              const isLead = member.id === currentProject?.lead?.id;
              return (
                <tr key={member.id}>
                  <td className="member-cell">
                    <img src={member.avatarUrl} alt={member.name} className="member-table-avatar" />
                    <span className="member-name-text">{member.name}</span>
                    {isLead && <span className="lead-tag">Lead</span>}
                  </td>
                  <td>{member.email}</td>
                  <td>
                    <span className="role-tag">{member.role?.replace('ROLE_', '')}</span>
                  </td>
                  <td>
                    {!isLead && (
                      <button 
                        className="btn-danger-sm" 
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Register Member Modal */}
      {showAddModal && (
        <div className="jira-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="jira-modal-content sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalTab === 'existing' ? 'Add Existing Member' : 'Register New Team Member'}</h2>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #DFE1E6', padding: '0 24px' }}>
              <button
                type="button"
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  background: 'none',
                  borderBottom: modalTab === 'existing' ? '2px solid #0052CC' : '2px solid transparent',
                  color: modalTab === 'existing' ? '#0052CC' : '#42526E',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                onClick={() => { setModalTab('existing'); setModalError(''); }}
              >
                Existing Users ({availableUsers.length})
              </button>
              <button
                type="button"
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  background: 'none',
                  borderBottom: modalTab === 'new' ? '2px solid #0052CC' : '2px solid transparent',
                  color: modalTab === 'new' ? '#0052CC' : '#42526E',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                onClick={() => { setModalTab('new'); setModalError(''); }}
              >
                + Register New Colleague
              </button>
            </div>

            {modalError && (
              <div className="auth-error-alert" style={{ margin: '12px 24px 0' }}>
                {modalError}
              </div>
            )}

            {modalTab === 'existing' ? (
              <form onSubmit={handleAddMember} className="modal-body">
                <div className="form-group">
                  <label>Select Workspace User</label>
                  <select 
                    required 
                    value={selectedUserId} 
                    onChange={e => setSelectedUserId(e.target.value)}
                  >
                    <option value="">Choose a user...</option>
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email}) - {user.role?.replace('ROLE_', '')}
                      </option>
                    ))}
                  </select>
                  {availableUsers.length === 0 && (
                    <span className="field-hint" style={{ color: '#0052CC', marginTop: 6 }}>
                      All registered users are already members of this project. Click the "Register New Colleague" tab to add someone new.
                    </span>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={loading || !selectedUserId}>
                    {loading ? 'Adding...' : 'Add to project'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterAndAddMember} className="modal-body">
                <div className="form-group">
                  <label>Full Name <span style={{ color: 'red' }}>*</span></label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Rachel Zane" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label>Work Email <span style={{ color: 'red' }}>*</span></label>
                  <input 
                    type="email" 
                    required 
                    placeholder="rachel@company.com" 
                    value={newEmail} 
                    onChange={e => setNewEmail(e.target.value)} 
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Initial Password <span style={{ color: 'red' }}>*</span></label>
                    <input 
                      type="password" 
                      required 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label>System Role</label>
                    <select value={newRole} onChange={e => setNewRole(e.target.value)}>
                      <option value="ROLE_MEMBER">Member (Developer / Contributor)</option>
                      <option value="ROLE_PROJECT_LEAD">Project Lead</option>
                      <option value="ROLE_ADMIN">Administrator</option>
                      <option value="ROLE_VIEWER">Viewer (Read-only)</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Registering...' : 'Register & Add to Project'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
