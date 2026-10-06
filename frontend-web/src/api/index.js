import { request } from './client';

export const authApi = {
  login: (email, password) => 
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (name, email, password, avatarUrl, role) => 
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, avatarUrl, role: role || 'ROLE_MEMBER' })
    }),

  getCurrentUser: () => request('/auth/me'),

  getAllUsers: () => request('/users'),
  
  searchUsers: (query) => request(`/users/search?query=${encodeURIComponent(query || '')}`)
};

export const projectsApi = {
  getAll: () => request('/projects'),
  getById: (id) => request(`/projects/${id}`),
  getByKey: (key) => request(`/projects/key/${key}`),
  create: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  addMember: (projectId, userId) => request(`/projects/${projectId}/members/${userId}`, { method: 'POST' }),
  removeMember: (projectId, userId) => request(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' }),
  delete: (id) => request(`/projects/${id}`, { method: 'DELETE' })
};

export const sprintsApi = {
  getByProject: (projectId) => request(`/projects/${projectId}/sprints`),
  getById: (id) => request(`/sprints/${id}`),
  create: (projectId, data) => request(`/projects/${projectId}/sprints`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/sprints/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  start: (id) => request(`/sprints/${id}/start`, { method: 'POST' }),
  complete: (id) => request(`/sprints/${id}/complete`, { method: 'POST' }),
  delete: (id) => request(`/sprints/${id}`, { method: 'DELETE' })
};

export const issuesApi = {
  filter: (params) => {
    const query = new URLSearchParams();
    if (params.projectId) query.append('projectId', params.projectId);
    if (params.sprintId) query.append('sprintId', params.sprintId);
    if (params.status) query.append('status', params.status);
    if (params.assigneeId) query.append('assigneeId', params.assigneeId);
    if (params.priority) query.append('priority', params.priority);
    if (params.type) query.append('type', params.type);
    if (params.search) query.append('search', params.search);
    return request(`/issues?${query.toString()}`);
  },
  getById: (id) => request(`/issues/${id}`),
  getByKey: (key) => request(`/issues/key/${key}`),
  getBacklog: (projectId) => request(`/issues/backlog?projectId=${projectId}`),
  getMyIssues: () => request('/issues/my-issues'),
  create: (data) => request('/issues', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/issues/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (id, status, orderIndex) => 
    request(`/issues/${id}/status`, { 
      method: 'PATCH', 
      body: JSON.stringify({ status, orderIndex }) 
    }),
  updateAssignee: (id, assigneeId) => 
    request(`/issues/${id}/assign`, { 
      method: 'PATCH', 
      body: JSON.stringify({ assigneeId }) 
    }),
  moveSprint: (id, sprintId) => 
    request(`/issues/${id}/move-sprint`, { 
      method: 'PATCH', 
      body: JSON.stringify({ sprintId }) 
    }),
  delete: (id) => request(`/issues/${id}`, { method: 'DELETE' })
};

export const commentsApi = {
  getByIssue: (issueId) => request(`/issues/${issueId}/comments`),
  add: (issueId, content) => 
    request(`/issues/${issueId}/comments`, { 
      method: 'POST', 
      body: JSON.stringify({ content }) 
    }),
  delete: (id) => request(`/comments/${id}`, { method: 'DELETE' })
};

export const activityApi = {
  getByIssue: (issueId) => request(`/issues/${issueId}/activities`)
};

export const dashboardApi = {
  getStats: (projectId) => request(`/projects/${projectId}/dashboard`)
};
