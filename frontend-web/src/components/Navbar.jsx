import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';

export default function Navbar({ onOpenCreateIssue, onOpenCreateProject, searchTerm, setSearchTerm, onOpenAuth }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { projects, currentProject, setCurrentProject } = useProject();
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="jira-navbar">
      <div className="navbar-left">
        <div className="jira-logo-brand">
          <svg className="jira-logo-icon" viewBox="0 0 24 24" fill="#0052CC">
            <path d="M11.53 2c0 2.4 1.97 4.35 4.4 4.35h1.72V8.1c0 2.4 1.97 4.35 4.4 4.35v-1.74c0-2.4-1.97-4.35-4.4-4.35h-1.72V4.6c0-2.4-1.97-4.35-4.4-4.35v1.75zm-5.76 5.8c0 2.4 1.97 4.35 4.4 4.35h1.72v1.75c0 2.4 1.97 4.35 4.4 4.35v-1.75c0-2.4-1.97-4.35-4.4-4.35H10.17V9.56c0-2.4-1.97-4.35-4.4-4.35v2.59zM0 13.6c0 2.4 1.97 4.35 4.4 4.35h1.72v1.75C6.12 22.1 8.09 24 10.52 24v-1.75c0-2.4-1.97-4.35-4.4-4.35H4.4V16.14C4.4 13.74 2.43 11.8 0 11.8v1.8z" />
          </svg>
          <span className="jira-brand-text">Project Management</span>
        </div>

        {isAuthenticated && (
          <div className="nav-dropdown-wrapper">
            <button 
              className="nav-btn dropdown-toggle" 
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            >
              Projects
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>

            {showProjectDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-header">RECENT PROJECTS</div>
                {projects.map(p => (
                  <div 
                    key={p.id} 
                    className={`dropdown-item ${currentProject?.id === p.id ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentProject(p);
                      setShowProjectDropdown(false);
                    }}
                  >
                    <div className="project-avatar-badge">{p.key.substring(0, 2)}</div>
                    <div className="project-item-info">
                      <div className="project-item-name">{p.name}</div>
                      <div className="project-item-key">{p.key} &bull; Software project</div>
                    </div>
                  </div>
                ))}
                <div className="dropdown-divider" />
                <button 
                  className="dropdown-item" 
                  style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0052CC', fontWeight: '600' }}
                  onClick={() => {
                    setShowProjectDropdown(false);
                    if (onOpenCreateProject) onOpenCreateProject();
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  Create project
                </button>
              </div>
            )}
          </div>
        )}

        {isAuthenticated && (
          <button className="btn-create-issue" onClick={onOpenCreateIssue}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Create
          </button>
        )}
      </div>

      <div className="navbar-right">
        {isAuthenticated && (
          <div className="nav-search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search issues, keys, labels..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {isAuthenticated ? (
          <div className="user-profile-wrapper">
            <button 
              className="user-profile-btn" 
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <img 
                src={user?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"} 
                alt={user?.name} 
                className="user-avatar"
              />
            </button>

            {showUserDropdown && (
              <div className="dropdown-menu user-menu">
                <div className="user-menu-header">
                  <div className="user-menu-name">{user?.name}</div>
                  <div className="user-menu-email">{user?.email}</div>
                  <div className="user-menu-role">{user?.role?.replace('ROLE_', '')}</div>
                </div>
                <div className="dropdown-divider" />
                <button 
                  className="dropdown-item text-danger" 
                  onClick={() => {
                    logout();
                    setShowUserDropdown(false);
                  }}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="btn-primary" onClick={onOpenAuth}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
