import { API_URL } from './config';
import { getToken, clearToken } from './authStorage';

async function request(path, options = {}) {
  const token = await getToken();
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    await clearToken();
    const err = new Error('UNAUTHORIZED');
    err.code = 'UNAUTHORIZED';
    throw err;
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || res.statusText);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  register: (username, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  getMe: () => request('/users/me'),

  patchMe: body =>
    request('/users/me', { method: 'PATCH', body: JSON.stringify(body) }),

  deleteMe: () => request('/users/me', { method: 'DELETE' }),

  getUser: id => request(`/users/${id}`),

  getChats: () => request('/chats'),

  getChat: id => request(`/chats/${id}`),

  sendMessage: (id, text) =>
    request(`/chats/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text })
    }),

  deleteChat: id => request(`/chats/${id}`, { method: 'DELETE' }),

  requestRevealChat: id => request(`/chats/${id}/reveal-request`, { method: 'POST' }),

  respondRevealChat: (id, accept) =>
    request(`/chats/${id}/reveal-response`, {
      method: 'POST',
      body: JSON.stringify({ accept })
    }),

  decideAnonymousAfterReject: (id, continueAnonymous) =>
    request(`/chats/${id}/anonymous-decision`, {
      method: 'POST',
      body: JSON.stringify({ continueAnonymous })
    }),

  createChat: (targetUserId, anonymous = false) =>
    request('/chats', {
      method: 'POST',
      body: JSON.stringify({ targetUserId, anonymous })
    }),

  searchRecommendations: () => request('/search/recommendations'),

  searchUsers: payload =>
    request('/search/users', {
      method: 'POST',
      body: JSON.stringify(payload || {})
    }),

  anonymousMatch: payload =>
    request('/search/anonymous-match', {
      method: 'POST',
      body: JSON.stringify(payload || {})
    })
};
