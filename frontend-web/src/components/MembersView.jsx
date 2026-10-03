import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { authApi, projectsApi } from '../api';

export default function MembersView() {
  const { currentProject, reloadProjects } = useProject();
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authApi.getAllUsers().then(setAllUsers).catch(console.error);
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !currentProject) return;
    try {
      setLoading(true);
      await projectsApi.addMember(currentProject.id, Number(selectedUserId));
      setSelectedUserId('');
      setShowAddModal(false);
      reloadProjects();
    } catch (err) {
      alert(err.message);
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
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            + Add member
          </button>
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

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="jira-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="jira-modal-content sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Team Member</h2>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddMember} className="modal-body">
              <div className="form-group">
                <label>Select User to Add</label>
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
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading || !selectedUserId}>
                  {loading ? 'Adding...' : 'Add to project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
