// Env type bindings for Cloudflare Workers

export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  KV: KVNamespace;
  APP_URL: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  JWT_SECRET: string;
  __STATIC_CONTENT?: KVNamespace;
  __STATIC_CONTENT_MANIFEST?: string;
}

export interface Variables {
  user?: User;
  storeUser?: User;
  book?: Book;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string | null;
  avatar_url: string;
  plan: string;
  store_name: string;
  store_logo_url: string;
  store_logo_key: string;
  store_settings: string;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  type: 'pdf' | 'epub' | 'doc' | 'docx' | 'ppt' | 'pptx';
  file_key: string;
  cover_url: string;
  cover_key: string;
  file_size_bytes: number;
  view_count: number;
  max_views: number;
  is_public: number;
  password: string | null;
  custom_domain: string | null;
  settings: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: string;
  status: string;
  current_period_end: string | null;
  created_at: string;
}
