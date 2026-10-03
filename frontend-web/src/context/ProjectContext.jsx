import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { projectsApi, sprintsApi } from '../api';
import { useAuth } from './AuthContext';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [activeSprint, setActiveSprint] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    if (!isAuthenticated) {
      setProjects([]);
      setCurrentProject(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const list = await projectsApi.getAll();
      setProjects(list);
      if (list.length > 0) {
        // Retain current project or default to first
        setCurrentProject(prev => {
          if (prev) {
            const found = list.find(p => p.id === prev.id);
            return found || list[0];
          }
          return list[0];
        });
      } else {
        setCurrentProject(null);
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadSprints = useCallback(async (projectId) => {
    if (!projectId) return;
    try {
      const list = await sprintsApi.getByProject(projectId);
      setSprints(list);
      const active = list.find(s => s.status === 'ACTIVE');
      setActiveSprint(active || null);
    } catch (err) {
      console.error('Failed to load sprints', err);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (currentProject) {
      loadSprints(currentProject.id);
    } else {
      setSprints([]);
      setActiveSprint(null);
    }
  }, [currentProject, loadSprints]);

  return (
    <ProjectContext.Provider value={{
      projects,
      currentProject,
      setCurrentProject,
      sprints,
      activeSprint,
      loading,
      reloadProjects: loadProjects,
      reloadSprints: () => loadSprints(currentProject?.id)
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
}
