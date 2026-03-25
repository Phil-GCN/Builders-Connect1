// User types
export type UserRole = 'SUPER_ADMIN' | 'CONTENT_MANAGER' | 'MODERATOR' | 'MEMBER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  slug: string;
  subtitle?: string;
  description: string;
  price: number;
  pre_order_price?: number;
  category: 'book' | 'course' | 'template' | 'tool';
  format: 'digital' | 'physical' | 'both';
  image_url?: string;
  features: string[];
  is_pre_order: boolean;
  pre_order_launch_date?: string;
  pre_order_bonus?: string;
  is_active: boolean;
  stock_quantity?: number;
  created_at: string;
}

// Order types
export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  product_id: string;
  stripe_payment_intent_id?: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  customer_email: string;
  customer_name?: string;
  delivery_format?: string;
  is_delivered: boolean;
  delivered_at?: string;
  created_at: string;
}

// Blog post types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  author_id: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  seo_title?: string;
  seo_description?: string;
  published_at?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}

// Community post types
export interface CommunityPost {
  id: string;
  author_id: string;
  title: string;
  content: string;
  category?: string;
  likes_count: number;
  replies_count: number;
  is_pinned: boolean;
  is_featured: boolean;
  is_flagged: boolean;
  status: 'active' | 'hidden' | 'deleted';
  created_at: string;
  updated_at: string;
}

// Comment types
export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_comment_id?: string;
  likes_count: number;
  is_flagged: boolean;
  status: 'active' | 'hidden' | 'deleted';
  created_at: string;
}

// Contact request types
export type RequestType = 
  | 'speaking' 
  | 'podcast_guest' 
  | 'podcast_invite' 
  | 'press' 
  | 'partnership' 
  | 'general';

export interface ContactRequest {
  id: string;
  request_type: RequestType;
  name: string;
  email: string;
  company?: string;
  message: string;
  additional_data?: Record<string, any>;
  status: 'new' | 'reviewing' | 'accepted' | 'declined' | 'archived';
  assigned_to?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

// Affiliate link types
export interface AffiliateLink {
  id: string;
  name: string;
  description?: string;
  url: string;
  category?: string;
  commission_rate?: string;
  click_count: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

// Newsletter subscriber types
export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  status: 'active' | 'unsubscribed';
  source?: string;
  subscribed_at: string;
  unsubscribed_at?: string;
}

// Podcast episode types
export interface PodcastEpisode {
  id: string;
  episode_id: string;
  title: string;
  description?: string;
  audio_url: string;
  duration?: number;
  published_at: string;
  cover_image?: string;
  show_notes?: string;
  transcript?: string;
  youtube_url?: string;
  spotify_url?: string;
  apple_url?: string;
  view_count: number;
  created_at: string;
}
