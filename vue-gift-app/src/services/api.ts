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

// 環境変数の設定
const AWS_API_GATEWAY_URL = 'https://jquzcc3vd0.execute-api.us-west-2.amazonaws.com/prod'
const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// 開発環境かどうかを判定
const isDevelopment = import.meta.env.DEV

// モックデータ
const mockGifts: Gift[] = [
  {
    id: '1',
    name: '総合健康診断パック',
    description: '詳細な血液検査から画像診断まで、総合的な健康状態をチェックできます。',
    price: 15400,
    category: 'health_checkup',
    partnerId: 'partner-1',
    status: 'active',
    imageUrl: '/images/health-checkup.jpg',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'パーソナルフィットネス体験',
    description: 'プロのトレーナーによる個別指導で、効率的な運動習慣を身につけます。',
    price: 12100,
    category: 'fitness',
    partnerId: 'partner-2',
    status: 'active',
    imageUrl: '/images/fitness-training.jpg',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'ウェルネス相談セッション',
    description: '専門家による健康相談で、あなたに最適な健康管理プランを作成します。',
    price: 6600,
    category: 'wellness',
    partnerId: 'partner-3',
    status: 'active',
    imageUrl: '/images/wellness-consultation.jpg',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'ヨガ・ピラティス体験',
    description: '心身のバランスを整えるヨガ・ピラティスを体験できます。',
    price: 8800,
    category: 'fitness',
    partnerId: 'partner-4',
    status: 'active',
    imageUrl: '/images/yoga-pilates.jpg',
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: '栄養カウンセリング',
    description: '管理栄養士による個別栄養相談で、健康的な食生活をサポートします。',
    price: 5500,
    category: 'nutrition',
    partnerId: 'partner-5',
    status: 'active',
    imageUrl: '/images/nutrition-counseling.jpg',
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

// AWS Lambda APIクライアント
class AwsLambdaApiClient {
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${AWS_API_GATEWAY_URL}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new ApiError(
        response.status,
        'API_ERROR',
        `API request failed: ${response.statusText}`
      )
    }

    return response.json()
  }

  // ギフト一覧取得
  async getGifts(): Promise<ApiResponse<Gift[]>> {
    try {
      const response = await this.makeRequest('/gifts')
      return response
    } catch (error) {
      throw new ApiError(500, 'FETCH_ERROR', 'ギフトの取得に失敗しました')
    }
  }

  // ギフト詳細取得
  async getGift(id: string): Promise<ApiResponse<Gift>> {
    try {
      const response = await this.makeRequest(`/gifts/${id}`)
      return response
    } catch (error) {
      throw new ApiError(500, 'FETCH_ERROR', 'ギフトの取得に失敗しました')
    }
  }

  // カテゴリ別ギフト取得
  async getGiftsByCategory(category: string): Promise<ApiResponse<Gift[]>> {
    try {
      const response = await this.makeRequest(`/gifts?category=${category}`)
      return response
    } catch (error) {
      throw new ApiError(500, 'FETCH_ERROR', 'ギフトの取得に失敗しました')
    }
  }

  // ギフト検索
  async searchGifts(query: string): Promise<ApiResponse<Gift[]>> {
    try {
      const response = await this.makeRequest(`/gifts/search?q=${encodeURIComponent(query)}`)
      return response
    } catch (error) {
      throw new ApiError(500, 'FETCH_ERROR', 'ギフトの検索に失敗しました')
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
      const response = await this.makeRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      })
      return response
    } catch (error) {
      throw new ApiError(500, 'CREATE_ERROR', '注文の作成に失敗しました')
    }
  }

  // 注文一覧取得
  async getOrders(): Promise<ApiResponse<GiftOrder[]>> {
    try {
      const response = await this.makeRequest('/orders')
      return response
    } catch (error) {
      throw new ApiError(500, 'FETCH_ERROR', '注文の取得に失敗しました')
    }
  }

  // 注文詳細取得
  async getOrder(id: string): Promise<ApiResponse<GiftOrder>> {
    try {
      const response = await this.makeRequest(`/orders/${id}`)
      return response
    } catch (error) {
      throw new ApiError(500, 'FETCH_ERROR', '注文の取得に失敗しました')
    }
  }

  // 注文キャンセル
  async cancelOrder(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.makeRequest(`/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'cancelled' }),
      })
      return response
    } catch (error) {
      throw new ApiError(500, 'UPDATE_ERROR', '注文のキャンセルに失敗しました')
    }
  }

  // ギフト相談開始
  async startConsultation(answers: ConsultationAnswers): Promise<ApiResponse<GiftConsultation>> {
    try {
      const response = await this.makeRequest('/consultation', {
        method: 'POST',
        body: JSON.stringify({ answers }),
      })
      return response
    } catch (error) {
      throw new ApiError(500, 'CONSULTATION_ERROR', 'ギフト相談の開始に失敗しました')
    }
  }

  // 相談履歴取得
  async getConsultations(): Promise<ApiResponse<GiftConsultation[]>> {
    try {
      const response = await this.makeRequest('/consultations')
      return response
    } catch (error) {
      throw new ApiError(500, 'FETCH_ERROR', '相談履歴の取得に失敗しました')
    }
  }

  // 相談詳細取得
  async getConsultation(id: string): Promise<ApiResponse<GiftConsultation>> {
    try {
      const response = await this.makeRequest(`/consultations/${id}`)
      return response
    } catch (error) {
      throw new ApiError(500, 'FETCH_ERROR', '相談の取得に失敗しました')
    }
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

      return {
        success: true,
        data: data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          partnerId: item.partner_id,
          status: item.status,
          imageUrl: item.image_url,
          createdAt: item.created_at,
        })),
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      throw new ApiError(500, 'FETCH_ERROR', 'ギフトの取得に失敗しました')
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

      return {
        success: true,
        data: {
          id: data.id,
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          partnerId: data.partner_id,
          status: data.status,
          imageUrl: data.image_url,
          createdAt: data.created_at,
        },
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      throw new ApiError(500, 'FETCH_ERROR', 'ギフトの取得に失敗しました')
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

      return {
        success: true,
        data: data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          partnerId: item.partner_id,
          status: item.status,
          imageUrl: item.image_url,
          createdAt: item.created_at,
        })),
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      throw new ApiError(500, 'FETCH_ERROR', 'ギフトの取得に失敗しました')
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

      return {
        success: true,
        data: data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          partnerId: item.partner_id,
          status: item.status,
          imageUrl: item.image_url,
          createdAt: item.created_at,
        })),
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      throw new ApiError(500, 'FETCH_ERROR', 'ギフトの検索に失敗しました')
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ユーザーが認証されていません')

      const { data, error } = await supabase
        .from('gift_orders')
        .insert({
          gifter_id: user.id,
          gift_id: orderData.giftId,
          recipient_name: orderData.recipientName,
          recipient_email: orderData.recipientEmail,
          message: orderData.message,
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        data: {
          id: data.id,
          gifterId: data.gifter_id,
          giftId: data.gift_id,
          recipientName: data.recipient_name,
          recipientEmail: data.recipient_email,
          message: data.message,
          giftUrl: data.gift_url,
          status: data.status,
          paymentStatus: data.payment_status,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      throw new ApiError(500, 'CREATE_ERROR', '注文の作成に失敗しました')
    }
  }

  // 注文一覧取得
  async getOrders(): Promise<ApiResponse<GiftOrder[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ユーザーが認証されていません')

      const { data, error } = await supabase
        .from('gift_orders')
        .select('*')
        .eq('gifter_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        success: true,
        data: data.map(item => ({
          id: item.id,
          gifterId: item.gifter_id,
          giftId: item.gift_id,
          recipientName: item.recipient_name,
          recipientEmail: item.recipient_email,
          message: item.message,
          giftUrl: item.gift_url,
          status: item.status,
          paymentStatus: item.payment_status,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        })),
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      throw new ApiError(500, 'FETCH_ERROR', '注文の取得に失敗しました')
    }
  }

  // 注文キャンセル
  async cancelOrder(id: string): Promise<ApiResponse<void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ユーザーが認証されていません')

      const { error } = await supabase
        .from('gift_orders')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('gifter_id', user.id)

      if (error) throw error

      return {
        success: true,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      throw new ApiError(500, 'UPDATE_ERROR', '注文のキャンセルに失敗しました')
    }
  }

  // ギフト相談開始
  async startConsultation(answers: ConsultationAnswers): Promise<ApiResponse<GiftConsultation>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ユーザーが認証されていません')

      const { data, error } = await supabase
        .from('consultations')
        .insert({
          user_id: user.id,
          answers: answers,
          status: 'completed',
        })
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        data: {
          id: data.id,
          userId: data.user_id,
          answers: data.answers,
          recommendations: data.recommendations || [],
          aiExplanation: data.ai_explanation,
          status: data.status,
          createdAt: data.created_at,
        },
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      throw new ApiError(500, 'CONSULTATION_ERROR', 'ギフト相談の開始に失敗しました')
    }
  }

  // 相談履歴取得
  async getConsultations(): Promise<ApiResponse<GiftConsultation[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ユーザーが認証されていません')

      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        success: true,
        data: data.map(item => ({
          id: item.id,
          userId: item.user_id,
          answers: item.answers,
          recommendations: item.recommendations || [],
          aiExplanation: item.ai_explanation,
          status: item.status,
          createdAt: item.created_at,
        })),
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      throw new ApiError(500, 'FETCH_ERROR', '相談履歴の取得に失敗しました')
    }
  }
}

// モックAPIクライアント
class MockApiClient {
  async getGifts(): Promise<ApiResponse<Gift[]>> {
    return {
      success: true,
      data: mockGifts,
      timestamp: new Date().toISOString(),
    }
  }

  async getGift(id: string): Promise<ApiResponse<Gift>> {
    const gift = mockGifts.find(g => g.id === id)
    if (!gift) {
      throw new ApiError(404, 'NOT_FOUND', 'ギフトが見つかりません')
    }
    return {
      success: true,
      data: gift,
      timestamp: new Date().toISOString(),
    }
  }

  async getGiftsByCategory(category: string): Promise<ApiResponse<Gift[]>> {
    const gifts = mockGifts.filter(g => g.category === category)
    return {
      success: true,
      data: gifts,
      timestamp: new Date().toISOString(),
    }
  }

  async searchGifts(query: string): Promise<ApiResponse<Gift[]>> {
    const gifts = mockGifts.filter(g => 
      g.name.toLowerCase().includes(query.toLowerCase()) ||
      g.description.toLowerCase().includes(query.toLowerCase())
    )
    return {
      success: true,
      data: gifts,
      timestamp: new Date().toISOString(),
    }
  }

  async createOrder(orderData: {
    giftId: string
    recipientName: string
    recipientEmail: string
    message?: string
  }): Promise<ApiResponse<GiftOrder>> {
    const gift = mockGifts.find(g => g.id === orderData.giftId)
    if (!gift) {
      throw new ApiError(404, 'NOT_FOUND', 'ギフトが見つかりません')
    }

    const order: GiftOrder = {
      id: `order_${Date.now()}`,
      gifterId: 'mock-user-id',
      giftId: orderData.giftId,
      recipientName: orderData.recipientName,
      recipientEmail: orderData.recipientEmail,
      message: orderData.message,
      giftUrl: `${window.location.origin}/gift/${Date.now()}`,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return {
      success: true,
      data: order,
      timestamp: new Date().toISOString(),
    }
  }

  async getOrders(): Promise<ApiResponse<GiftOrder[]>> {
    return {
      success: true,
      data: [],
      timestamp: new Date().toISOString(),
    }
  }

  async getOrder(id: string): Promise<ApiResponse<GiftOrder>> {
    throw new ApiError(404, 'NOT_FOUND', '注文が見つかりません')
  }

  async cancelOrder(id: string): Promise<ApiResponse<void>> {
    return {
      success: true,
      timestamp: new Date().toISOString(),
    }
  }

  async startConsultation(answers: ConsultationAnswers): Promise<ApiResponse<GiftConsultation>> {
    const consultation: GiftConsultation = {
      id: `consultation_${Date.now()}`,
      userId: 'mock-user-id',
      answers,
      recommendations: mockGifts.slice(0, 3),
      aiExplanation: 'AIが分析した結果、健康診断とフィットネス体験をおすすめします。',
      status: 'completed',
      createdAt: new Date().toISOString(),
    }

    return {
      success: true,
      data: consultation,
      timestamp: new Date().toISOString(),
    }
  }

  async getConsultations(): Promise<ApiResponse<GiftConsultation[]>> {
    return {
      success: true,
      data: [],
      timestamp: new Date().toISOString(),
    }
  }

  async getConsultation(id: string): Promise<ApiResponse<GiftConsultation>> {
    throw new ApiError(404, 'NOT_FOUND', '相談が見つかりません')
  }

  async createPaymentIntent(orderId: string): Promise<ApiResponse<PaymentIntent>> {
    return {
      success: true,
      data: {
        id: `pi_${Date.now()}`,
        orderId,
        amount: 15400,
        status: 'requires_payment_method',
        clientSecret: 'pi_secret_mock',
      },
      timestamp: new Date().toISOString(),
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<ApiResponse<void>> {
    return {
      success: true,
      timestamp: new Date().toISOString(),
    }
  }

  async getPaymentHistory(): Promise<ApiResponse<PaymentIntent[]>> {
    return {
      success: true,
      data: [],
      timestamp: new Date().toISOString(),
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return {
      success: true,
      data: {
        id: 'mock-user-id',
        email: 'mock@example.com',
        name: 'モックユーザー',
        phone: null,
        lineUserId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    }
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return {
      success: true,
      data: {
        id: 'mock-user-id',
        email: 'mock@example.com',
        name: userData.name || 'モックユーザー',
        phone: userData.phone || null,
        lineUserId: userData.lineUserId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    }
  }

  async deleteAccount(): Promise<ApiResponse<void>> {
    return {
      success: true,
      timestamp: new Date().toISOString(),
    }
  }

  async linkLineAccount(lineCode: string): Promise<ApiResponse<void>> {
    return {
      success: true,
      timestamp: new Date().toISOString(),
    }
  }

  async unlinkLineAccount(): Promise<ApiResponse<void>> {
    return {
      success: true,
      timestamp: new Date().toISOString(),
    }
  }

  async updateLineNotification(settings: {
    enabled: boolean
    types: string[]
  }): Promise<ApiResponse<void>> {
    return {
      success: true,
      timestamp: new Date().toISOString(),
    }
  }

  async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    return {
      success: true,
      data: { url: URL.createObjectURL(file) },
      timestamp: new Date().toISOString(),
    }
  }
}

// APIクライアントの選択
let apiClient: AwsLambdaApiClient | SupabaseApiClient | MockApiClient

if (AWS_API_GATEWAY_URL) {
  // AWS Lambda APIを使用
  apiClient = new AwsLambdaApiClient()
} else if (VITE_SUPABASE_URL) {
  // Supabaseを使用
  apiClient = new SupabaseApiClient()
} else {
  // モックデータを使用
  apiClient = new MockApiClient()
}

// APIエクスポート
export const giftApi = {
  getGifts: () => apiClient.getGifts(),
  getGift: (id: string) => apiClient.getGift(id),
  getGiftsByCategory: (category: string) => apiClient.getGiftsByCategory(category),
  searchGifts: (query: string) => apiClient.searchGifts(query),
}

export const orderApi = {
  createOrder: (orderData: {
    giftId: string
    recipientName: string
    recipientEmail: string
    message?: string
  }) => apiClient.createOrder(orderData),
  getOrders: () => apiClient.getOrders(),
  getOrder: (id: string) => apiClient.getOrder(id),
  cancelOrder: (id: string) => apiClient.cancelOrder(id),
}

export const consultationApi = {
  startConsultation: (answers: ConsultationAnswers) => apiClient.startConsultation(answers),
  getConsultations: () => apiClient.getConsultations(),
  getConsultation: (id: string) => apiClient.getConsultation(id),
}

export const paymentApi = {
  createPaymentIntent: (orderId: string) => apiClient.createPaymentIntent(orderId),
  confirmPayment: (paymentIntentId: string) => apiClient.confirmPayment(paymentIntentId),
  getPaymentHistory: () => apiClient.getPaymentHistory(),
}

export const userApi = {
  getProfile: () => apiClient.getProfile(),
  updateProfile: (userData: Partial<User>) => apiClient.updateProfile(userData),
  deleteAccount: () => apiClient.deleteAccount(),
  linkLineAccount: (lineCode: string) => apiClient.linkLineAccount(lineCode),
  unlinkLineAccount: () => apiClient.unlinkLineAccount(),
  updateLineNotification: (settings: { enabled: boolean; types: string[] }) => 
    apiClient.updateLineNotification(settings),
}

export const fileApi = {
  uploadImage: (file: File) => apiClient.uploadImage(file),
} 