import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const CLOUD_BACKEND_URL = 'https://jira-backend-ukiv.onrender.com/api';
export const LOCAL_BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080/api' : 'http://localhost:8080/api';

let currentBaseUrl = CLOUD_BACKEND_URL;

export const setServerUrl = (url) => {
  currentBaseUrl = url.endsWith('/api') ? url : `${url.replace(/\/+$/, '')}/api`;
};

export const getServerUrl = () => currentBaseUrl;

export async function request(endpoint, options = {}) {
  let token = null;
  try {
    token = (await AsyncStorage.getItem('pm_token')) || (await AsyncStorage.getItem('jira_token'));
  } catch (_) {}

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${currentBaseUrl}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    try {
      await AsyncStorage.removeItem('pm_token');
      await AsyncStorage.removeItem('pm_user');
      await AsyncStorage.removeItem('jira_token');
      await AsyncStorage.removeItem('jira_user');
    } catch (_) {}
  }

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    let errorMsg = `Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.message) errorMsg = errJson.message;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const mobileApi = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name, email, password) => request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  getMe: () => request('/auth/me'),
  getUsers: () => request('/users'),

  // Projects
  getProjects: () => request('/projects'),
  getProjectById: (id) => request(`/projects/${id}`),

  // Sprints
  getSprints: (projectId) => request(`/projects/${projectId}/sprints`),
  startSprint: (id) => request(`/sprints/${id}/start`, { method: 'POST' }),
  completeSprint: (id) => request(`/sprints/${id}/complete`, { method: 'POST' }),

  // Issues
  filterIssues: (params) => {
    const query = new URLSearchParams();
    if (params.projectId) query.append('projectId', params.projectId);
    if (params.sprintId) query.append('sprintId', params.sprintId);
    if (params.status) query.append('status', params.status);
    if (params.assigneeId) query.append('assigneeId', params.assigneeId);
    if (params.search) query.append('search', params.search);
    return request(`/issues?${query.toString()}`);
  },
  getIssueById: (id) => request(`/issues/${id}`),
  getMyIssues: () => request('/issues/my-issues'),
  createIssue: (data) => request('/issues', { method: 'POST', body: JSON.stringify(data) }),
  updateIssue: (id, data) => request(`/issues/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (id, status) => request(`/issues/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateAssignee: (id, assigneeId) => request(`/issues/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ assigneeId }) }),

  // Comments & History
  getComments: (issueId) => request(`/issues/${issueId}/comments`),
  addComment: (issueId, content) => request(`/issues/${issueId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
  getActivity: (issueId) => request(`/issues/${issueId}/activities`)
};
