import axios from 'axios';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ProjectDomain = 'IoT' | 'ML' | 'VLSI' | 'Web';

export interface Project {
  _id: string;
  title: string;
  description: string;
  domain: ProjectDomain;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  thumbnail?: string;
  featured: boolean;
  createdAt: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  content?: string;
  tags: string[];
  publishedAt: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  receivedAt: string;
  read: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface ProjectPayload {
  title: string;
  description: string;
  domain: ProjectDomain;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  thumbnail?: string;
  featured: boolean;
}

export interface PostPayload {
  title: string;
  slug: string;
  content: string;
  tags: string[];
}

// ─── Axios instance ──────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Projects ────────────────────────────────────────────────────────────────

export const getProjects = (): Promise<Project[]> =>
  api.get<Project[]>('/api/projects').then((r) => r.data);

export const getProject = (id: string): Promise<Project> =>
  api.get<Project>(`/api/projects/${id}`).then((r) => r.data);

export const createProject = (data: ProjectPayload): Promise<Project> =>
  api.post<Project>('/api/projects', data).then((r) => r.data);

export const updateProject = (id: string, data: Partial<ProjectPayload>): Promise<Project> =>
  api.put<Project>(`/api/projects/${id}`, data).then((r) => r.data);

export const deleteProject = (id: string): Promise<void> =>
  api.delete(`/api/projects/${id}`).then(() => undefined);

export const uploadImage = (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post<{ url: string }>('/api/projects/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};

// ─── Posts ───────────────────────────────────────────────────────────────────

export const getPosts = (): Promise<Post[]> =>
  api.get<Post[]>('/api/posts').then((r) => r.data);

export const getPost = (slug: string): Promise<Post> =>
  api.get<Post>(`/api/posts/${slug}`).then((r) => r.data);

export const createPost = (data: PostPayload): Promise<Post> =>
  api.post<Post>('/api/posts', data).then((r) => r.data);

export const updatePost = (slug: string, data: Partial<PostPayload>): Promise<Post> =>
  api.put<Post>(`/api/posts/${slug}`, data).then((r) => r.data);

export const deletePost = (slug: string): Promise<void> =>
  api.delete(`/api/posts/${slug}`).then(() => undefined);

// ─── Contact ─────────────────────────────────────────────────────────────────

export const submitContact = (data: ContactPayload): Promise<{ message: string; id: string }> =>
  api.post('/api/contact', data).then((r) => r.data);

export const getMessages = (): Promise<Message[]> =>
  api.get<Message[]>('/api/contact/messages').then((r) => r.data);

export const markMessageRead = (id: string): Promise<Message> =>
  api.patch<Message>(`/api/contact/messages/${id}`, { read: true }).then((r) => r.data);

// ─── Auth ────────────────────────────────────────────────────────────────────

export const login = (email: string, password: string): Promise<LoginResponse> =>
  api.post<LoginResponse>('/api/auth/login', { email, password }).then((r) => r.data);

export const getMe = (): Promise<AuthUser> =>
  api.get<AuthUser>('/api/auth/me').then((r) => r.data);

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface DownloadStats {
  totalDownloads: number;
  downloadsPerDay: {
    date: string;
    count: number;
  }[];
}

export const logResumeDownload = (): Promise<{ success: boolean }> =>
  api.get<{ success: boolean }>('/api/analytics/resume-download').then((r) => r.data);

export const getDownloadStats = (): Promise<DownloadStats> =>
  api.get<DownloadStats>('/api/analytics/stats').then((r) => r.data);

// Helper to convert Google Drive viewer URLs to direct download/image stream links
export function getDirectImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  if (url.startsWith('/uploads/')) {
    const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
    return `${baseUrl}${url}`;
  }
  
  const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const driveMatch = url.match(driveRegex);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  
  const driveOpenRegex = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
  const driveOpenMatch = url.match(driveOpenRegex);
  if (driveOpenMatch && driveOpenMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveOpenMatch[1]}`;
  }
  
  return url;
}

export default api;
