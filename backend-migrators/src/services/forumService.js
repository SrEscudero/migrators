// src/services/forumService.js
import apiClient from './api.js';

const API_URL = '/api/forums';

export const fetchForums = () => {
  return apiClient.get(API_URL);
};

export const fetchThreadsByForum = (forumId) => {
  return apiClient.get(`${API_URL}/${forumId}/threads`);
};

export const fetchThreadById = (threadId) => {
  return apiClient.get(`/api/forums/threads/${threadId}`);
};