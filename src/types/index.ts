export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  level: number;
  permissions: string[];
  is_active: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role_id: string;
  role?: Role;
  role_name?: string;
  role_display_name?: string;
  role_level?: number;
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface UserInvitation {
  id: string;
  email: string;
  role_id: string;
  role?: Role;
  invited_by: string;
  inviter?: User;
  invitation_token: string;
  status: 'pending' | 'accepted' | 'expired';
  pre_filled_data?: {
    full_name?: string;
    company?: string;
    [key: string]: any;
  };
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

export interface RoleUpgradeRequest {
  id: string;
  user_id: string;
  user?: User;
  current_role_id: string;
  current_role?: Role;
  requested_role_id: string;
  requested_role?: Role;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewer?: User;
  reviewed_at?: string;
  created_at: string;
}

export interface CampaignData {
  type: 'pre_order' | 'launch' | 'sale' | 'limited_time';
  original_price?: number;
  discount_price?: number;
  launch_date?: string;
  end_date?: string;
  bonus?: string;
  badge?: string;
}

export interface PageSection {
  type: 'hero' | 'parts' | 'features' | 'author_bio' | 'testimonials' | 'faq' | 'pricing' | 'gallery';
  enabled: boolean;
  data?: any;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  rating: number;
  image?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  product_type: 'book' | 'course' | 'membership' | 'digital' | 'physical';
  image_url?: string;
  features?: string[];
  is_active: boolean;
  campaign_data?: CampaignData;
  page_sections?: {
    sections: PageSection[];
  };
  archive_date?: string;
  author_bio?: string;
  testimonials?: Testimonial[];
  faqs?: FAQ[];
  stripe_payment_link?: string; // ADD THIS LINE
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface AppSetting {
  id: string;
  category: 'payment' | 'content' | 'email' | 'social' | 'app';
  key: string;
  value: string;
  is_encrypted: boolean;
  is_public: boolean;
  description: string;
  updated_by?: string;
  updated_at?: string;
  created_at?: string;
}

export interface SettingsMap {
  [key: string]: string;
}
