import React from 'react';
import { useProject } from '../context/ProjectContext';

export default function Sidebar({ activeView, setActiveView, isCollapsed, setIsCollapsed }) {
  const { currentProject } = useProject();

  const navItems = [
    {
      id: 'board',
      label: 'Kanban board',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h4v16H4V4zm6 0h4v10h-4V4zm6 0h4v14h-4V4z"/>
        </svg>
      )
    },
    {
      id: 'backlog',
      label: 'Backlog & Sprints',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
        </svg>
      )
    },
    {
      id: 'list',
      label: 'List view',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
        </svg>
      )
    },
    {
      id: 'members',
      label: 'Project members',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 7s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
      )
    },
    {
      id: 'dashboard',
      label: 'Reports & Dashboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
      )
    }
  ];

  return (
    <aside className={`jira-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-project-header">
        <div className="project-icon-box">
          {currentProject?.key?.substring(0, 2) || 'PR'}
        </div>
        {!isCollapsed && (
          <div className="project-header-meta">
            <h2 className="project-title">{currentProject?.name || 'Select Project'}</h2>
            <span className="project-type-tag">Software project</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-group-title">{!isCollapsed && 'PLANNING'}</div>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => setActiveView(item.id)}
            title={item.label}
          >
            <span className="nav-item-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-item-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button 
          className="sidebar-collapse-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            {isCollapsed ? (
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            ) : (
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            )}
          </svg>
        </button>
      </div>
    </aside>
  );
}
