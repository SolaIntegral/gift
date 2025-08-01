// ユーザー関連の型定義
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  createdAt: string
  updatedAt: string
}

// ギフト関連の型定義
export interface Gift {
  id: string
  name: string
  description: string
  price: number
  category: GiftCategory
  partnerId: string
  status: GiftStatus
  imageUrl?: string
  createdAt: string
}

export type GiftCategory = 
  | 'health_checkup'
  | 'dental_care'
  | 'beauty_treatment'
  | 'fitness'
  | 'nutrition'
  | 'mental_health'

export type GiftStatus = 'active' | 'inactive' | 'discontinued'

// ギフト注文関連の型定義
export interface GiftOrder {
  id: string
  gifterId: string
  giftId: string
  recipientName: string
  recipientEmail: string
  message?: string
  giftUrl: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  createdAt: string
  updatedAt: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

// 医療機関関連の型定義
export interface Facility {
  id: string
  name: string
  address: string
  phone: string
  category: FacilityCategory
  status: FacilityStatus
  latitude?: number
  longitude?: number
}

export type FacilityCategory = 
  | 'clinic'
  | 'hospital'
  | 'dental_clinic'
  | 'beauty_salon'
  | 'fitness_center'

export type FacilityStatus = 'active' | 'inactive'

// 提携先関連の型定義
export interface Partner {
  id: string
  name: string
  category: PartnerCategory
  apiKey?: string
  status: PartnerStatus
}

export type PartnerCategory = 
  | 'medical'
  | 'beauty'
  | 'fitness'
  | 'nutrition'

export type PartnerStatus = 'active' | 'inactive'

// API レスポンスの型定義
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ギフト相談関連の型定義
export interface GiftConsultation {
  id: string
  userId: string
  answers: ConsultationAnswers
  recommendations: Gift[]
  createdAt: string
}

export interface ConsultationAnswers {
  age: number
  gender: 'male' | 'female' | 'other'
  healthConcerns: string[]
  budget: BudgetRange
  relationship?: string
}

export type BudgetRange = 'low' | 'medium' | 'high' | 'premium'

// LINE連携関連の型定義
export interface LineEvent {
  type: string
  message?: {
    type: string
    text?: string
  }
  replyToken?: string
  source: {
    userId: string
    type: string
  }
}

export interface LineMessage {
  type: string
  text?: string
  template?: any
}

// AWS Lambda イベントの型定義
export interface LambdaEvent {
  body: string
  headers: Record<string, string>
  httpMethod: string
  path: string
  queryStringParameters?: Record<string, string>
}

export interface LambdaResponse {
  statusCode: number
  headers: Record<string, string>
  body: string
}

// 認証関連の型定義
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface CognitoUser {
  sub: string
  email: string
  emailVerified: boolean
  name: string
}

// 決済関連の型定義
export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: PaymentStatus
  paymentMethod?: string
  createdAt: string
}

// エラー型定義
export interface AppError {
  code: string
  message: string
  details?: any
}

// 設定関連の型定義
export interface AppConfig {
  apiBaseUrl: string
  cognitoUserPoolId: string
  cognitoClientId: string
  lineChannelId: string
  lineChannelSecret: string
  bedrockModelId: string
  s3BucketName: string
} 