// Author simplifié utilisé dans les posts, comments, messages
export interface Author {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  apartment_number?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  phone?: string;
  floor?: number | string;
  apartment?: string;
  apartment_number?: string;
  bio?: string;
  building_id?: string;
  organization_id?: string;
  role?: string;
  created_at?: string;
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
  floor?: number | string;
  apartment?: string;
  apartment_number?: string;
  phone?: string | null;
  email?: string;
  role?: string;
}

export interface Post {
  id: string;
  title?: string;
  content: string;
  image_url?: string | null;
  author: Author;
  likes_count: number;
  comments_count: number;
  liked?: boolean;
  liked_by_me?: boolean;
  category?: string;
  created_at: string;
  updated_at?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: Author;
  post_id?: string;
  created_at: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  last_message?: string | Message;
  last_message_at?: string;
  unread_count: number;
  members_count?: number;
  icon?: string;
  created_at?: string;
}

export interface Message {
  id: string;
  content: string;
  author: Author;
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
