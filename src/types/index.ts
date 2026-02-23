export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  phone?: string;
  floor?: string;
  apartment?: string;
  bio?: string;
  building_id: string;
  organization_id: string;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface Organization {
  id: string;
  name: string;
  logo_url?: string;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  organization_id: string;
}

export interface Resident {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  floor?: string;
  apartment?: string;
  phone?: string;
  email: string;
}

export interface Post {
  id: string;
  content: string;
  image_url?: string;
  author: User;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  created_at: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  last_message?: Message;
  unread_count: number;
  created_at: string;
}

export interface Message {
  id: string;
  content: string;
  author: User;
  channel_id: string;
  created_at: string;
}

export interface InvitationVerification {
  organization_name: string;
  building_name: string;
  valid: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  invitation_code: string;
}

export interface CreatePostRequest {
  content: string;
  image?: string;
}

export interface CreateMessageRequest {
  content: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}
