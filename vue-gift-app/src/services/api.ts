import type { 
  ApiResponse, 
  Gift, 
  GiftOrder, 
  User, 
  ConsultationAnswers,
  GiftConsultation,
  PaymentIntent,
  AppError 
} from '@/types'
import { supabase } from './supabase'

// API設定
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// 開発環境かどうかを判定
const isDevelopment = import.meta.env.DEV

// モックデータ
const mockGifts: Gift[] = [
  {
    id: '1',
    name: '健康管理アプリ',
    description: '日々の健康状態を記録・管理できるアプリ',
    price: 3000,
    category: 'health_checkup',
    partnerId: 'partner-1',
    status: 'active',
    imageUrl: '/images/health-app.jpg',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'フィットネストラッカー',
    description: '歩数、心拍数、睡眠を記録するスマートウォッチ',
    price: 15000,
    category: 'fitness',
    partnerId: 'partner-2',
    status: 'active',
    imageUrl: '/images/fitness-tracker.jpg',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: '栄養サプリメントセット',
    description: 'ビタミン・ミネラルがバランス良く配合されたサプリ',
    price: 5000,
    category: 'nutrition',
    partnerId: 'partner-3',
    status: 'active',
    imageUrl: '/images/supplements.jpg',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'ヨガマット',
    description: '滑り止め加工された高品質なヨガマット',
    price: 8000,
    category: 'fitness',
    partnerId: 'partner-4',
    status: 'active',
    imageUrl: '/images/yoga-mat.jpg',
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: '有機緑茶セット',
    description: '抗酸化作用のある有機栽培の緑茶',
    price: 4000,
    category: 'nutrition',
    partnerId: 'partner-5',
    status: 'active',
    imageUrl: '/images/green-tea.jpg',
    createdAt: new Date().toISOString()
  }
]

// エラーハンドリング用のカスタムエラークラス
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Supabase APIクライアント
class SupabaseApiClient {
  // ギフト一覧取得
  async getGifts(): Promise<ApiResponse<Gift[]>> {
    try {
      const { data, error } = await supabase
        .from('gifts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error

      const gifts: Gift[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        imageUrl: item.image_url || '',
        rating: 4.0, // デフォルト値
        reviews: 0, // デフォルト値
        inStock: true
      }))

      return {
        success: true,
        data: gifts,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Supabase error:', error)
      return {
        success: false,
        error: 'ギフトの取得に失敗しました',
        data: [],
        timestamp: new Date().toISOString()
      }
    }
  }

  // ギフト詳細取得
  async getGift(id: string): Promise<ApiResponse<Gift>> {
    try {
      const { data, error } = await supabase
        .from('gifts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      const gift: Gift = {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        imageUrl: data.image_url || '',
        rating: 4.0,
        reviews: 0,
        inStock: true
      }

      return {
        success: true,
        data: gift,
        message: 'ギフト詳細を取得しました'
      }
    } catch (error) {
      console.error('Supabase error:', error)
      return {
        success: false,
        error: 'ギフトの取得に失敗しました'
      }
    }
  }

  // カテゴリ別ギフト取得
  async getGiftsByCategory(category: string): Promise<ApiResponse<Gift[]>> {
    try {
      const { data, error } = await supabase
        .from('gifts')
        .select('*')
        .eq('status', 'active')
        .eq('category', category)
        .order('created_at', { ascending: false })

      if (error) throw error

      const gifts: Gift[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        imageUrl: item.image_url || '',
        rating: 4.0,
        reviews: 0,
        inStock: true
      }))

      return {
        success: true,
        data: gifts,
        message: 'カテゴリ別ギフトを取得しました'
      }
    } catch (error) {
      console.error('Supabase error:', error)
      return {
        success: false,
        error: 'ギフトの取得に失敗しました',
        data: []
      }
    }
  }

  // ギフト検索
  async searchGifts(query: string): Promise<ApiResponse<Gift[]>> {
    try {
      const { data, error } = await supabase
        .from('gifts')
        .select('*')
        .eq('status', 'active')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      const gifts: Gift[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        imageUrl: item.image_url || '',
        rating: 4.0,
        reviews: 0,
        inStock: true
      }))

      return {
        success: true,
        data: gifts,
        message: '検索結果を取得しました'
      }
    } catch (error) {
      console.error('Supabase error:', error)
      return {
        success: false,
        error: 'ギフトの検索に失敗しました',
        data: []
      }
    }
  }

  // 注文作成
  async createOrder(orderData: {
    giftId: string
    recipientName: string
    recipientEmail: string
    message?: string
  }): Promise<ApiResponse<GiftOrder>> {
    try {
      // 現在のユーザーを取得（認証が必要）
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('認証が必要です')
      }

      const giftUrl = `https://gift-app.com/gift/${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const { data, error } = await supabase
        .from('gift_orders')
        .insert({
          gifter_id: user.id,
          gift_id: orderData.giftId,
          recipient_name: orderData.recipientName,
          recipient_email: orderData.recipientEmail,
          message: orderData.message,
          gift_url: giftUrl,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      const order: GiftOrder = {
        id: data.id,
        giftId: data.gift_id,
        gifterId: data.gifter_id,
        recipientName: data.recipient_name,
        recipientEmail: data.recipient_email,
        message: data.message,
        giftUrl: data.gift_url,
        status: data.status,
        paymentStatus: data.payment_status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return {
        success: true,
        data: order,
        message: '注文を作成しました'
      }
    } catch (error) {
      console.error('Supabase error:', error)
      return {
        success: false,
        error: '注文の作成に失敗しました'
      }
    }
  }

  // 注文一覧取得
  async getOrders(): Promise<ApiResponse<GiftOrder[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('認証が必要です')
      }

      const { data, error } = await supabase
        .from('gift_orders')
        .select('*')
        .eq('gifter_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const orders: GiftOrder[] = data.map(item => ({
        id: item.id,
        giftId: item.gift_id,
        gifterId: item.gifter_id,
        recipientName: item.recipient_name,
        recipientEmail: item.recipient_email,
        message: item.message,
        giftUrl: item.gift_url,
        status: item.status,
        paymentStatus: item.payment_status,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }))

      return {
        success: true,
        data: orders,
        message: '注文一覧を取得しました'
      }
    } catch (error) {
      console.error('Supabase error:', error)
      return {
        success: false,
        error: '注文の取得に失敗しました',
        data: []
      }
    }
  }

  // 注文キャンセル
  async cancelOrder(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('gift_orders')
        .update({ status: 'cancelled' })
        .eq('id', id)

      if (error) throw error

      return {
        success: true,
        message: '注文をキャンセルしました'
      }
    } catch (error) {
      console.error('Supabase error:', error)
      return {
        success: false,
        error: '注文のキャンセルに失敗しました'
      }
    }
  }

  // 相談開始
  async startConsultation(answers: ConsultationAnswers): Promise<ApiResponse<GiftConsultation>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('認証が必要です')
      }

      // ギフト推薦を生成（簡易版）
      const recommendations = mockGifts.slice(0, 3).map(gift => ({
        id: gift.id,
        name: gift.name,
        description: gift.description,
        price: gift.price,
        category: gift.category,
        reason: `${gift.category}カテゴリで人気の商品です`
      }))

      const { data, error } = await supabase
        .from('consultations')
        .insert({
          user_id: user.id,
          answers: answers,
          recommendations: recommendations
        })
        .select()
        .single()

      if (error) throw error

      const consultation: GiftConsultation = {
        id: data.id,
        userId: data.user_id,
        answers: data.answers,
        recommendations: data.recommendations,
        createdAt: data.created_at
      }

      return {
        success: true,
        data: consultation,
        message: '相談が完了しました'
      }
    } catch (error) {
      console.error('Supabase error:', error)
      return {
        success: false,
        error: '相談の開始に失敗しました'
      }
    }
  }

  // 相談履歴取得
  async getConsultations(): Promise<ApiResponse<GiftConsultation[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('認証が必要です')
      }

      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const consultations: GiftConsultation[] = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        answers: item.answers,
        recommendations: item.recommendations,
        createdAt: item.created_at
      }))

      return {
        success: true,
        data: consultations,
        message: '相談履歴を取得しました'
      }
    } catch (error) {
      console.error('Supabase error:', error)
      return {
        success: false,
        error: '相談履歴の取得に失敗しました',
        data: []
      }
    }
  }
}

// 開発環境ではモッククライアント、本番環境ではSupabaseクライアントを使用
const client = isDevelopment ? new SupabaseApiClient() : new SupabaseApiClient()

// ギフト関連API
export const giftApi = {
  // ギフト一覧取得
  async getGifts(): Promise<ApiResponse<Gift[]>> {
    return client.getGifts()
  },

  // ギフト詳細取得
  async getGift(id: string): Promise<ApiResponse<Gift>> {
    return client.getGift(id)
  },

  // カテゴリ別ギフト取得
  async getGiftsByCategory(category: string): Promise<ApiResponse<Gift[]>> {
    return client.getGiftsByCategory(category)
  },

  // ギフト検索
  async searchGifts(query: string): Promise<ApiResponse<Gift[]>> {
    return client.searchGifts(query)
  }
}

// ギフト注文関連API
export const orderApi = {
  // 注文作成
  async createOrder(orderData: {
    giftId: string
    recipientName: string
    recipientEmail: string
    message?: string
  }): Promise<ApiResponse<GiftOrder>> {
    return client.createOrder(orderData)
  },

  // 注文一覧取得
  async getOrders(): Promise<ApiResponse<GiftOrder[]>> {
    return client.getOrders()
  },

  // 注文詳細取得
  async getOrder(id: string): Promise<ApiResponse<GiftOrder>> {
    // 実装予定
    return {
      success: false,
      error: '未実装'
    }
  },

  // 注文キャンセル
  async cancelOrder(id: string): Promise<ApiResponse<void>> {
    return client.cancelOrder(id)
  }
}

// ギフト相談関連API
export const consultationApi = {
  // 相談開始
  async startConsultation(answers: ConsultationAnswers): Promise<ApiResponse<GiftConsultation>> {
    return client.startConsultation(answers)
  },

  // 相談履歴取得
  async getConsultations(): Promise<ApiResponse<GiftConsultation[]>> {
    return client.getConsultations()
  },

  // 相談詳細取得
  async getConsultation(id: string): Promise<ApiResponse<GiftConsultation>> {
    // 実装予定
    return {
      success: false,
      error: '未実装'
    }
  }
}

// 決済関連API
export const paymentApi = {
  // 決済意図作成
  async createPaymentIntent(orderId: string): Promise<ApiResponse<PaymentIntent>> {
    return {
      success: false,
      error: '未実装'
    }
  },

  // 決済確認
  async confirmPayment(paymentIntentId: string): Promise<ApiResponse<void>> {
    return {
      success: false,
      error: '未実装'
    }
  },

  // 決済履歴取得
  async getPaymentHistory(): Promise<ApiResponse<PaymentIntent[]>> {
    return {
      success: false,
      error: '未実装',
      data: []
    }
  }
}

// ユーザー関連API
export const userApi = {
  // ユーザー情報取得
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('認証が必要です')
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      const userProfile: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone
      }

      return {
        success: true,
        data: userProfile,
        message: 'ユーザー情報を取得しました'
      }
    } catch (error) {
      console.error('Supabase error:', error)
      return {
        success: false,
        error: 'ユーザー情報の取得に失敗しました'
      }
    }
  },

  // ユーザー情報更新
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('認証が必要です')
      }

      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      const userProfile: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone
      }

      return {
        success: true,
        data: userProfile,
        message: 'ユーザー情報を更新しました'
      }
    } catch (error) {
      console.error('Supabase error:', error)
      return {
        success: false,
        error: 'ユーザー情報の更新に失敗しました'
      }
    }
  },

  // ユーザー削除
  async deleteAccount(): Promise<ApiResponse<void>> {
    return {
      success: false,
      error: '未実装'
    }
  }
}

// LINE連携API
export const lineApi = {
  // LINE連携開始
  async linkLineAccount(lineCode: string): Promise<ApiResponse<void>> {
    return {
      success: false,
      error: '未実装'
    }
  },

  // LINE連携解除
  async unlinkLineAccount(): Promise<ApiResponse<void>> {
    return {
      success: false,
      error: '未実装'
    }
  },

  // LINE通知設定
  async updateLineNotification(settings: {
    enabled: boolean
    types: string[]
  }): Promise<ApiResponse<void>> {
    return {
      success: false,
      error: '未実装'
    }
  }
}

// ファイルアップロードAPI
export const uploadApi = {
  // 画像アップロード
  async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('gift-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('gift-images')
        .getPublicUrl(filePath)

      return {
        success: true,
        data: { url: data.publicUrl },
        message: '画像をアップロードしました'
      }
    } catch (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: '画像のアップロードに失敗しました'
      }
    }
  }
}

// エクスポート
export default {
  gift: giftApi,
  order: orderApi,
  consultation: consultationApi,
  payment: paymentApi,
  user: userApi,
  line: lineApi,
  upload: uploadApi,
} 