import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 環境変数の検証を強化
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing')
  
  if (import.meta.env.DEV) {
    console.warn('Please create a .env.local file with your Supabase credentials')
    console.warn('See .env.example for the required format')
  }
  
  throw new Error('Missing Supabase environment variables. Check console for details.')
}

// URLの形式を検証
if (!supabaseUrl.includes('supabase.co')) {
  console.warn('Supabase URL format may be incorrect:', supabaseUrl)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// データベース型定義
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone?: string
          line_user_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string
          line_user_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string
          line_user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      gifts: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          category: string
          partner_id?: string
          status: string
          image_url?: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          category: string
          partner_id?: string
          status?: string
          image_url?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          category?: string
          partner_id?: string
          status?: string
          image_url?: string
          created_at?: string
        }
      }
      gift_orders: {
        Row: {
          id: string
          gifter_id: string
          gift_id: string
          recipient_name: string
          recipient_email: string
          message?: string
          gift_url: string
          status: string
          payment_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          gifter_id: string
          gift_id: string
          recipient_name: string
          recipient_email: string
          message?: string
          gift_url: string
          status?: string
          payment_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          gifter_id?: string
          gift_id?: string
          recipient_name?: string
          recipient_email?: string
          message?: string
          gift_url?: string
          status?: string
          payment_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      consultations: {
        Row: {
          id: string
          user_id: string
          answers: any
          recommendations: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          answers: any
          recommendations: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          answers?: any
          recommendations?: any
          created_at?: string
        }
      }
      facilities: {
        Row: {
          id: string
          name: string
          address: string
          phone: string
          category: string
          latitude: number
          longitude: number
          status: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          phone: string
          category: string
          latitude: number
          longitude: number
          status?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string
          category?: string
          latitude?: number
          longitude?: number
          status?: string
        }
      }
      partners: {
        Row: {
          id: string
          name: string
          category: string
          api_key?: string
          status: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          api_key?: string
          status?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          api_key?: string
          status?: string
        }
      }
    }
  }
} 