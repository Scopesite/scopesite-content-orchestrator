import { config } from '../config';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Workspaces
  async getWorkspaces() {
    return this.get<any>('/workspaces');
  }

  // Accounts
  async getAccounts(workspaceId: string) {
    return this.get<any>(`/accounts?workspace=${workspaceId}`);
  }

  // Posts
  async bulkSchedulePosts(data: any) {
    return this.post<any>('/posts/bulk', data);
  }

  async getPosts(workspaceId: string) {
    return this.get<any>(`/posts?workspace=${workspaceId}`);
  }

  // Drafts
  async getDrafts(workspaceId: string, status?: string) {
    const query = status ? `?workspace=${workspaceId}&status=${status}` : `?workspace=${workspaceId}`;
    return this.get<any>(`/drafts${query}`);
  }

  async createDraft(data: any) {
    return this.post<any>('/drafts', data);
  }

  async updateDraft(id: string, data: any) {
    return this.patch<any>(`/drafts/${id}`, data);
  }

  async deleteDraft(id: string) {
    return this.delete<any>(`/drafts/${id}`);
  }

  async approveDraft(id: string, approvedBy: string, notes?: string) {
    return this.post<any>(`/drafts/${id}/approve`, { approved_by: approvedBy, notes });
  }

  async rejectDraft(id: string, reason: string) {
    return this.post<any>(`/drafts/${id}/reject`, { rejected_reason: reason });
  }

  // Hashtags
  async getHashtagSets(workspaceId: string) {
    return this.get<any>(`/hashtags/sets?workspace=${workspaceId}`);
  }

  async createHashtagSet(data: any) {
    return this.post<any>('/hashtags/sets', data);
  }

  async updateHashtagSet(id: string, data: any) {
    return this.patch<any>(`/hashtags/sets/${id}`, data);
  }

  async deleteHashtagSet(id: string) {
    return this.delete<any>(`/hashtags/sets/${id}`);
  }

  async getHashtagAnalytics(workspaceId: string) {
    return this.get<any>(`/hashtags/analytics?workspace=${workspaceId}`);
  }

  // Media
  async getMedia(workspaceId: string, folder?: string, tags?: string[]) {
    let query = `?workspace=${workspaceId}`;
    if (folder) query += `&folder=${folder}`;
    if (tags && tags.length) query += `&tags=${tags.join(',')}`;
    return this.get<any>(`/media${query}`);
  }

  async createMedia(data: any) {
    return this.post<any>('/media', data);
  }

  async updateMedia(id: string, data: any) {
    return this.patch<any>(`/media/${id}`, data);
  }

  async deleteMedia(id: string) {
    return this.delete<any>(`/media/${id}`);
  }

  async getMediaFolders(workspaceId: string) {
    return this.get<any>(`/media/folders?workspace=${workspaceId}`);
  }

  // Templates
  async getTemplates(workspaceId: string, category?: string) {
    const query = category ? `?workspace=${workspaceId}&category=${category}` : `?workspace=${workspaceId}`;
    return this.get<any>(`/templates${query}`);
  }

  async createTemplate(data: any) {
    return this.post<any>('/templates', data);
  }

  async updateTemplate(id: string, data: any) {
    return this.patch<any>(`/templates/${id}`, data);
  }

  async deleteTemplate(id: string) {
    return this.delete<any>(`/templates/${id}`);
  }

  async useTemplate(id: string) {
    return this.post<any>(`/templates/${id}/use`, {});
  }

  // Posting Windows
  async getPostingWindows(workspaceId: string) {
    return this.get<any>(`/windows?workspace=${workspaceId}`);
  }

  async createPostingWindow(data: any) {
    return this.post<any>('/windows', data);
  }

  async updatePostingWindow(id: string, data: any) {
    return this.patch<any>(`/windows/${id}`, data);
  }

  async deletePostingWindow(id: string) {
    return this.delete<any>(`/windows/${id}`);
  }

  // Account Mappings
  async getAccountMappings(workspaceId: string) {
    return this.get<any>(`/mappings?workspace=${workspaceId}`);
  }

  async saveAccountMapping(data: any) {
    return this.post<any>('/mappings', data);
  }

  async bulkSaveAccountMappings(workspaceId: string, mappings: any) {
    return this.post<any>('/mappings/bulk', { workspace_id: workspaceId, mappings });
  }

  async deleteAccountMapping(id: string) {
    return this.delete<any>(`/mappings/${id}`);
  }

  // Calendar Events
  async getCalendarEvents(workspaceId: string, startDate?: string, endDate?: string) {
    let query = `?workspace=${workspaceId}`;
    if (startDate) query += `&start_date=${startDate}`;
    if (endDate) query += `&end_date=${endDate}`;
    return this.get<any>(`/calendar${query}`);
  }

  async createCalendarEvent(data: any) {
    return this.post<any>('/calendar', data);
  }

  async updateCalendarEvent(id: string, data: any) {
    return this.patch<any>(`/calendar/${id}`, data);
  }

  async deleteCalendarEvent(id: string) {
    return this.delete<any>(`/calendar/${id}`);
  }

  // Health
  async health() {
    return this.get<any>('/health');
  }
}

export const api = new ApiClient(config.apiBase);

