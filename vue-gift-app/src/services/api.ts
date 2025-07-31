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

// API設定
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.gift-app.com'

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

// HTTPクライアント
class HttpClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // 認証トークンを追加
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          response.status,
          errorData.code || 'UNKNOWN_ERROR',
          errorData.message || `HTTP ${response.status}`,
          errorData.details
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(0, 'NETWORK_ERROR', 'Network error occurred')
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

const httpClient = new HttpClient()

// ギフト関連API
export const giftApi = {
  // ギフト一覧取得
  async getGifts(): Promise<ApiResponse<Gift[]>> {
    return httpClient.get<ApiResponse<Gift[]>>('/gifts')
  },

  // ギフト詳細取得
  async getGift(id: string): Promise<ApiResponse<Gift>> {
    return httpClient.get<ApiResponse<Gift>>(`/gifts/${id}`)
  },

  // カテゴリ別ギフト取得
  async getGiftsByCategory(category: string): Promise<ApiResponse<Gift[]>> {
    return httpClient.get<ApiResponse<Gift[]>>(`/gifts?category=${category}`)
  },

  // ギフト検索
  async searchGifts(query: string): Promise<ApiResponse<Gift[]>> {
    return httpClient.get<ApiResponse<Gift[]>>(`/gifts/search?q=${encodeURIComponent(query)}`)
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
    return httpClient.post<ApiResponse<GiftOrder>>('/orders', orderData)
  },

  // 注文一覧取得
  async getOrders(): Promise<ApiResponse<GiftOrder[]>> {
    return httpClient.get<ApiResponse<GiftOrder[]>>('/orders')
  },

  // 注文詳細取得
  async getOrder(id: string): Promise<ApiResponse<GiftOrder>> {
    return httpClient.get<ApiResponse<GiftOrder>>(`/orders/${id}`)
  },

  // 注文キャンセル
  async cancelOrder(id: string): Promise<ApiResponse<void>> {
    return httpClient.put<ApiResponse<void>>(`/orders/${id}/cancel`)
  }
}

// ギフト相談関連API
export const consultationApi = {
  // 相談開始
  async startConsultation(answers: ConsultationAnswers): Promise<ApiResponse<GiftConsultation>> {
    return httpClient.post<ApiResponse<GiftConsultation>>('/consultations', { answers })
  },

  // 相談履歴取得
  async getConsultations(): Promise<ApiResponse<GiftConsultation[]>> {
    return httpClient.get<ApiResponse<GiftConsultation[]>>('/consultations')
  },

  // 相談詳細取得
  async getConsultation(id: string): Promise<ApiResponse<GiftConsultation>> {
    return httpClient.get<ApiResponse<GiftConsultation>>(`/consultations/${id}`)
  }
}

// 決済関連API
export const paymentApi = {
  // 決済意図作成
  async createPaymentIntent(orderId: string): Promise<ApiResponse<PaymentIntent>> {
    return httpClient.post<ApiResponse<PaymentIntent>>('/payments/intent', { orderId })
  },

  // 決済確認
  async confirmPayment(paymentIntentId: string): Promise<ApiResponse<void>> {
    return httpClient.post<ApiResponse<void>>(`/payments/${paymentIntentId}/confirm`)
  },

  // 決済履歴取得
  async getPaymentHistory(): Promise<ApiResponse<PaymentIntent[]>> {
    return httpClient.get<ApiResponse<PaymentIntent[]>>('/payments/history')
  }
}

// ユーザー関連API
export const userApi = {
  // ユーザー情報取得
  async getProfile(): Promise<ApiResponse<User>> {
    return httpClient.get<ApiResponse<User>>('/users/profile')
  },

  // ユーザー情報更新
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return httpClient.put<ApiResponse<User>>('/users/profile', userData)
  },

  // ユーザー削除
  async deleteAccount(): Promise<ApiResponse<void>> {
    return httpClient.delete<ApiResponse<void>>('/users/account')
  }
}

// LINE連携API
export const lineApi = {
  // LINE連携開始
  async linkLineAccount(lineCode: string): Promise<ApiResponse<void>> {
    return httpClient.post<ApiResponse<void>>('/line/link', { code: lineCode })
  },

  // LINE連携解除
  async unlinkLineAccount(): Promise<ApiResponse<void>> {
    return httpClient.delete<ApiResponse<void>>('/line/link')
  },

  // LINE通知設定
  async updateLineNotification(settings: {
    enabled: boolean
    types: string[]
  }): Promise<ApiResponse<void>> {
    return httpClient.put<ApiResponse<void>>('/line/notifications', settings)
  }
}

// ファイルアップロードAPI
export const uploadApi = {
  // 画像アップロード
  async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData()
    formData.append('image', file)
    
    const url = `${API_BASE_URL}/upload/image`
    const token = localStorage.getItem('accessToken')
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new ApiError(response.status, 'UPLOAD_ERROR', 'Upload failed')
    }

    return response.json()
  }
}

// エクスポート
export { httpClient }
export default {
  gift: giftApi,
  order: orderApi,
  consultation: consultationApi,
  payment: paymentApi,
  user: userApi,
  line: lineApi,
  upload: uploadApi,
} 