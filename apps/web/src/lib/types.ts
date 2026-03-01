// Env type bindings for Cloudflare Workers

export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  KV: KVNamespace;
  APP_URL: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  JWT_SECRET: string;
  RESEND_API_KEY: string;
  EMAIL: SendEmail;
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
  store_handle: string;
  password_hash: string | null;
  avatar_url: string;
  plan: string;
  store_name: string;
  store_logo_url: string;
  store_logo_key: string;
  store_hero_url: string;
  store_hero_key: string;
  store_settings: string;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  type: 'pdf' | 'epub' | 'doc' | 'docx' | 'odt' | 'ods' | 'odp' | 'ppt' | 'pptx' | 'xlsx' | 'csv' | 'tsv' | 'txt' | 'md' | 'rtf' | 'html' | 'image' | 'audio' | 'video';
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
  categories?: string;
  created_at: string;
  updated_at: string;
  avg_rating?: number;
  review_count?: number;
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

export interface StoreMember {
  id: string;
  store_owner_id: string;
  email: string;
  name: string;
  access_key: string;
  is_verified: number;
  verification_token: string | null;
  verification_expires_at: string | null;
  is_active: number;
  is_archived: number;
  created_at: string;
  updated_at: string;
}

export interface SharedBook {
  id: string;
  book_id: string;
  owner_id: string;
  shared_with_email: string;
  shared_with_user_id: string | null;
  can_view: number;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
