export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'WRITER';
  bio?: string;
  profile_image?: string;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: any; // JSON content
  banner_image_id: string;
  author_id: string;
  status: 'DRAFT' | 'PUBLISHED';
  seo_title: string;
  seo_description: string;
  canonical_url: string;
  published_at: string;
  created_at: string;
  author?: User;
  categories?: Category[];
  banner_image?: Image;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  post_count?: number;
}

export interface Image {
  id: string;
  url: string;
  alt_text: string;
  title: string;
  caption: string;
  width: number;
  height: number;
  created_at: string;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}