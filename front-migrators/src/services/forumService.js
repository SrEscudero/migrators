// src/services/forumService.js

import apiClient from './api.js';

const API_URL = '/api/forums';

export const fetchForums = () => {
  return apiClient.get(API_URL);
};

export const fetchThreadsByForum = (forumId) => {
  return apiClient.get(`${API_URL}/${forumId}/threads`);
};

export const postNewThread = (forumId, threadData) => {
  // threadData es un objeto como { titulo: '...', contenido: '...' }
  return apiClient.post(`${API_URL}/${forumId}/threads`, threadData);
};

export const postNewPost = (threadId, postData) => {
  // postData es un objeto como { contenido: '...' }
  return apiClient.post(`${API_URL}/threads/${threadId}/posts`, postData);
};