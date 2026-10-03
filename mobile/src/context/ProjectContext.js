import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mobileApi } from '../api/client';
import { useAuth } from './AuthContext';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [activeSprint, setActiveSprint] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await mobileApi.getProjects();
      setProjects(data);
      if (data.length > 0) {
        setCurrentProject(prev => prev ? (data.find(p => p.id === prev.id) || data[0]) : data[0]);
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchSprints = useCallback(async (projectId) => {
    if (!projectId) return;
    try {
      const data = await mobileApi.getSprints(projectId);
      setSprints(data);
      const active = data.find(s => s.status === 'ACTIVE');
      setActiveSprint(active || null);
    } catch (err) {
      console.error('Failed to load sprints', err);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (currentProject) {
      fetchSprints(currentProject.id);
    }
  }, [currentProject, fetchSprints]);

  return (
    <ProjectContext.Provider value={{
      projects,
      currentProject,
      setCurrentProject,
      sprints,
      activeSprint,
      loading,
      reloadProjects: fetchProjects,
      reloadSprints: () => fetchSprints(currentProject?.id)
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within ProjectProvider');
  return context;
}
