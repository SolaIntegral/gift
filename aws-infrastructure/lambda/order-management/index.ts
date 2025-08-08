import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import { Client } from 'pg'

const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' })
const secretsManager = new SecretsManagerClient({ region: process.env.AWS_REGION })

// 型定義
interface GiftOrder {
  id: string
  gifterId: string
  giftId: string
  recipientName: string
  recipientEmail: string
  message?: string
  giftUrl: string
  status: 'pending' | 'paid' | 'completed' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  createdAt: string
  updatedAt: string
}

interface CreateOrderRequest {
  giftId: string
  recipientName: string
  recipientEmail: string
  message?: string
  userId: string
}

interface UpdateOrderRequest {
  orderId: string
  status?: string
  paymentStatus?: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

// データベース接続
async function getDbClient() {
  const secretResponse = await secretsManager.send(
    new GetSecretValueCommand({
      SecretId: process.env.DB_SECRET_ARN,
    })
  )
  const dbCredentials = JSON.parse(secretResponse.SecretString || '{}')
  
  return new Client({
    host: dbCredentials.host,
    port: dbCredentials.port,
    database: dbCredentials.dbname,
    user: dbCredentials.username,
    password: dbCredentials.password,
    ssl: { rejectUnauthorized: false },
  })
}

// 注文作成
async function createOrder(orderData: CreateOrderRequest): Promise<GiftOrder> {
  const client = await getDbClient()
  await client.connect()
  
  try {
    const giftId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const giftUrl = `${process.env.FRONTEND_URL}/gift/${giftId}`
    
    const query = `
      INSERT INTO gift_orders (
        id, gifter_id, gift_id, recipient_name, recipient_email, 
        message, gift_url, status, payment_status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `
    
    const values = [
      giftId,
      orderData.userId,
      orderData.giftId,
      orderData.recipientName,
      orderData.recipientEmail,
      orderData.message || null,
      giftUrl,
      'pending',
      'pending'
    ]
    
    const result = await client.query(query, values)
    return result.rows[0]
  } finally {
    await client.end()
  }
}

// 注文更新
async function updateOrder(orderId: string, updates: Partial<GiftOrder>): Promise<GiftOrder> {
  const client = await getDbClient()
  await client.connect()
  
  try {
    const setClauses: string[] = []
    const values: any[] = []
    let paramIndex = 1
    
    if (updates.status) {
      setClauses.push(`status = $${paramIndex++}`)
      values.push(updates.status)
    }
    
    if (updates.paymentStatus) {
      setClauses.push(`payment_status = $${paramIndex++}`)
      values.push(updates.paymentStatus)
    }
    
    setClauses.push(`updated_at = NOW()`)
    values.push(orderId)
    
    const query = `
      UPDATE gift_orders 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `
    
    const result = await client.query(query, values)
    return result.rows[0]
  } finally {
    await client.end()
  }
}

// 注文取得
async function getOrder(orderId: string): Promise<GiftOrder | null> {
  const client = await getDbClient()
  await client.connect()
  
  try {
    const query = `
      SELECT o.*, g.name as gift_name, g.description as gift_description, g.price as gift_price
      FROM gift_orders o
      JOIN gifts g ON o.gift_id = g.id
      WHERE o.id = $1
    `
    
    const result = await client.query(query, [orderId])
    return result.rows[0] || null
  } finally {
    await client.end()
  }
}

// ユーザーの注文一覧取得
async function getUserOrders(userId: string): Promise<GiftOrder[]> {
  const client = await getDbClient()
  await client.connect()
  
  try {
    const query = `
      SELECT o.*, g.name as gift_name, g.description as gift_description, g.price as gift_price
      FROM gift_orders o
      JOIN gifts g ON o.gift_id = g.id
      WHERE o.gifter_id = $1
      ORDER BY o.created_at DESC
    `
    
    const result = await client.query(query, [userId])
    return result.rows
  } finally {
    await client.end()
  }
}

// 決済処理（ダミー実装）
async function processPayment(orderId: string, paymentMethod: string): Promise<boolean> {
  // 実際の実装ではPayPay APIなどを呼び出す
  console.log(`Processing payment for order ${orderId} with method ${paymentMethod}`)
  
  // ダミー決済処理（80%の確率で成功）
  const success = Math.random() > 0.2
  
  if (success) {
    await updateOrder(orderId, { 
      status: 'paid', 
      paymentStatus: 'paid' 
    })
  } else {
    await updateOrder(orderId, { 
      paymentStatus: 'failed' 
    })
  }
  
  return success
}

// メインハンドラー
export const handler = async (event: any): Promise<ApiResponse<any>> => {
  try {
    console.log('Event:', JSON.stringify(event, null, 2))
    
    const { httpMethod, path, body } = event
    const requestBody = body ? JSON.parse(body) : {}
    
    // 認証チェック（実際の実装ではJWT検証）
    const userId = event.requestContext?.authorizer?.claims?.sub || 'test-user-id'
    
    switch (httpMethod) {
      case 'POST':
        if (path.includes('/orders')) {
          const order = await createOrder({
            ...requestBody,
            userId
          })
          return {
            success: true,
            data: order,
            timestamp: new Date().toISOString(),
          }
        }
        break
        
      case 'GET':
        if (path.includes('/orders/')) {
          const orderId = path.split('/').pop()
          const order = await getOrder(orderId)
          
          if (!order) {
            return {
              success: false,
              error: '注文が見つかりません',
              timestamp: new Date().toISOString(),
            }
          }
          
          return {
            success: true,
            data: order,
            timestamp: new Date().toISOString(),
          }
        } else if (path.includes('/orders')) {
          const orders = await getUserOrders(userId)
          return {
            success: true,
            data: orders,
            timestamp: new Date().toISOString(),
          }
        }
        break
        
      case 'PUT':
        if (path.includes('/orders/')) {
          const orderId = path.split('/').pop()
          const order = await updateOrder(orderId, requestBody)
          
          return {
            success: true,
            data: order,
            timestamp: new Date().toISOString(),
          }
        }
        break
        
      case 'POST':
        if (path.includes('/payment')) {
          const { orderId, paymentMethod } = requestBody
          const success = await processPayment(orderId, paymentMethod)
          
          return {
            success: true,
            data: { success, orderId },
            timestamp: new Date().toISOString(),
          }
        }
        break
    }
    
    return {
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString(),
    }
    
  } catch (error) {
    console.error('Error:', error)
    return {
      success: false,
      error: '注文処理に失敗しました',
      timestamp: new Date().toISOString(),
    }
  }
} 