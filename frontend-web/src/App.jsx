import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider, useProject } from './context/ProjectContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import KanbanBoard from './components/KanbanBoard';
import BacklogView from './components/BacklogView';
import ListView from './components/ListView';
import MembersView from './components/MembersView';
import DashboardView from './components/DashboardView';
import IssueModal from './components/IssueModal';
import CreateIssueModal from './components/CreateIssueModal';
import AuthModal from './components/AuthModal';
import './App.css';

function JiraMainApp() {
  const { isAuthenticated } = useAuth();
  const { currentProject, loading: projectLoading } = useProject();

  const [activeView, setActiveView] = useState('board');
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaults, setCreateDefaults] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(!isAuthenticated);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [boardRefreshKey, setBoardRefreshKey] = useState(0);

  const handleQuickCreate = (defaults) => {
    setCreateDefaults(defaults || {});
    setIsCreateOpen(true);
  };

  const handleIssueUpdated = () => {
    setBoardRefreshKey(prev => prev + 1);
  };

  return (
    <div className="jira-app-container">
      <Navbar
        onOpenCreateIssue={() => handleQuickCreate({})}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <div className="jira-workspace-layout">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        <main className="jira-main-content">
          {!isAuthenticated ? (
            <div className="unauthenticated-welcome">
              <div className="welcome-card">
                <div className="jira-logo-brand auth-logo">
                  <svg className="jira-logo-icon" viewBox="0 0 24 24" fill="#0052CC">
                    <path d="M11.53 2c0 2.4 1.97 4.35 4.4 4.35h1.72V8.1c0 2.4 1.97 4.35 4.4 4.35v-1.74c0-2.4-1.97-4.35-4.4-4.35h-1.72V4.6c0-2.4-1.97-4.35-4.4-4.35v1.75zm-5.76 5.8c0 2.4 1.97 4.35 4.4 4.35h1.72v1.75c0 2.4 1.97 4.35 4.4 4.35v-1.75c0-2.4-1.97-4.35-4.4-4.35H10.17V9.56c0-2.4-1.97-4.35-4.4-4.35v2.59zM0 13.6c0 2.4 1.97 4.35 4.4 4.35h1.72v1.75C6.12 22.1 8.09 24 10.52 24v-1.75c0-2.4-1.97-4.35-4.4-4.35H4.4V16.14C4.4 13.74 2.43 11.8 0 11.8v1.8z" />
                  </svg>
                  <span className="jira-brand-text">Jira Software</span>
                </div>
                <h2>Welcome to Jira Replica</h2>
                <p>Collaborate, plan sprints, manage issues, and track velocity with full Jira power.</p>
                <button className="btn-primary welcome-login-btn" onClick={() => setIsAuthOpen(true)}>
                  Sign In to Continue
                </button>
              </div>
            </div>
          ) : projectLoading ? (
            <div className="loading-state">Loading your projects and board...</div>
          ) : (
            <>
              {activeView === 'board' && (
                <KanbanBoard
                  key={boardRefreshKey}
                  onSelectIssue={setSelectedIssueId}
                  onQuickCreate={handleQuickCreate}
                  searchTerm={searchTerm}
                />
              )}

              {activeView === 'backlog' && (
                <BacklogView
                  key={boardRefreshKey}
                  onSelectIssue={setSelectedIssueId}
                  onOpenCreateIssue={() => handleQuickCreate({})}
                />
              )}

              {activeView === 'list' && (
                <ListView
                  key={boardRefreshKey}
                  onSelectIssue={setSelectedIssueId}
                  searchTerm={searchTerm}
                />
              )}

              {activeView === 'members' && (
                <MembersView />
              )}

              {activeView === 'dashboard' && (
                <DashboardView key={boardRefreshKey} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Detail Drawer Modal */}
      {selectedIssueId && (
        <IssueModal
          issueId={selectedIssueId}
          onClose={() => setSelectedIssueId(null)}
          onIssueUpdated={handleIssueUpdated}
        />
      )}

      {/* Create Issue Modal */}
      <CreateIssueModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onIssueCreated={handleIssueUpdated}
        defaultValues={createDefaults}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <JiraMainApp />
      </ProjectProvider>
    </AuthProvider>
  );
}
