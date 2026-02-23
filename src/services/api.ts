import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  User,
  AuthTokens,
  Post,
  Comment,
  Channel,
  Message,
  Resident,
  InvitationVerification,
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  CreatePostRequest,
  CreateMessageRequest,
  UpdateProfileRequest,
  Organization,
} from '../types';

const BASE_URL = 'https://api.komun.app/api/v1';

const ACCESS_TOKEN_KEY = 'komun_access_token';
const REFRESH_TOKEN_KEY = 'komun_refresh_token';

class ApiService {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await this.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            const response = await axios.post<{ access_token: string }>(`${BASE_URL}/auth/refresh`, {
              refresh_token: refreshToken,
            });

            const { access_token } = response.data;
            await this.setAccessToken(access_token);

            this.refreshSubscribers.forEach((callback) => callback(access_token));
            this.refreshSubscribers = [];

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            await this.clearTokens();
            this.refreshSubscribers = [];
            throw refreshError;
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  }

  async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  }

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  }

  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  }

  async setTokens(tokens: AuthTokens): Promise<void> {
    await Promise.all([
      this.setAccessToken(tokens.access_token),
      this.setRefreshToken(tokens.refresh_token),
    ]);
  }

  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  }

  async hasValidToken(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.client.post<{ access_token: string; refresh_token: string; user: User }>(
      '/auth/login',
      data
    );
    const { access_token, refresh_token, user } = response.data;
    const tokens = { access_token, refresh_token };
    await this.setTokens(tokens);
    return { user, tokens };
  }

  async register(data: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.client.post<{ access_token: string; refresh_token: string; user: User }>(
      '/auth/register',
      data
    );
    const { access_token, refresh_token, user } = response.data;
    const tokens = { access_token, refresh_token };
    await this.setTokens(tokens);
    return { user, tokens };
  }

  async verifyInvitation(code: string): Promise<InvitationVerification> {
    const response = await this.client.post<InvitationVerification>('/auth/verify-invitation', { code });
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      await this.clearTokens();
    }
  }

  // Organization
  async getOrganization(): Promise<Organization> {
    const response = await this.client.get<Organization>('/organization');
    return response.data;
  }

  // Posts
  async getPosts(page = 1): Promise<ApiResponse<Post[]>> {
    const response = await this.client.get<ApiResponse<Post[]>>('/posts', { params: { page } });
    return response.data;
  }

  async getPost(id: string): Promise<Post> {
    const response = await this.client.get<Post>(`/posts/${id}`);
    return response.data;
  }

  async createPost(data: CreatePostRequest): Promise<Post> {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.image) {
      const filename = data.image.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append('image', {
        uri: data.image,
        name: filename,
        type,
      } as any);
    }

    const response = await this.client.post<Post>('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async likePost(id: string): Promise<void> {
    await this.client.post(`/posts/${id}/like`);
  }

  async unlikePost(id: string): Promise<void> {
    await this.client.delete(`/posts/${id}/like`);
  }

  // Comments
  async getComments(postId: string, page = 1): Promise<ApiResponse<Comment[]>> {
    const response = await this.client.get<ApiResponse<Comment[]>>(`/posts/${postId}/comments`, {
      params: { page },
    });
    return response.data;
  }

  async createComment(postId: string, content: string): Promise<Comment> {
    const response = await this.client.post<Comment>(`/posts/${postId}/comments`, { content });
    return response.data;
  }

  // Channels
  async getChannels(): Promise<Channel[]> {
    const response = await this.client.get<Channel[]>('/channels');
    return response.data;
  }

  async getChannel(id: string): Promise<Channel> {
    const response = await this.client.get<Channel>(`/channels/${id}`);
    return response.data;
  }

  // Messages
  async getMessages(channelId: string, page = 1): Promise<ApiResponse<Message[]>> {
    const response = await this.client.get<ApiResponse<Message[]>>(`/channels/${channelId}/messages`, {
      params: { page },
    });
    return response.data;
  }

  async sendMessage(channelId: string, data: CreateMessageRequest): Promise<Message> {
    const response = await this.client.post<Message>(`/channels/${channelId}/messages`, data);
    return response.data;
  }

  // Residents
  async getResidents(search?: string): Promise<Resident[]> {
    const response = await this.client.get<Resident[]>('/residents', {
      params: search ? { search } : undefined,
    });
    return response.data;
  }

  // Profile
  async getProfile(): Promise<User> {
    const response = await this.client.get<User>('/profile');
    return response.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const formData = new FormData();

    if (data.first_name) formData.append('first_name', data.first_name);
    if (data.last_name) formData.append('last_name', data.last_name);
    if (data.phone) formData.append('phone', data.phone);
    if (data.bio) formData.append('bio', data.bio);

    if (data.avatar) {
      const filename = data.avatar.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append('avatar', {
        uri: data.avatar,
        name: filename,
        type,
      } as any);
    }

    const response = await this.client.patch<User>('/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  // Notifications
  async getNotifications(): Promise<any[]> {
    const response = await this.client.get('/notifications');
    return response.data;
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.client.patch(`/notifications/${id}/read`);
  }
}

export const api = new ApiService();
export default api;
