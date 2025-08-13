import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import mysql from 'mysql2/promise'

const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' })

// MySQL接続設定
const dbConfig = {
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  port: parseInt(process.env.DB_PORT || '3306'),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
}

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
  details?: string
  timestamp: string
}

// 注文作成
async function createOrder(orderData: CreateOrderRequest): Promise<GiftOrder> {
  let connection: mysql.Connection | null = null
  
  try {
    connection = await mysql.createConnection(dbConfig)
    
    // 実際のギフトIDを使用してURLを生成
    const giftUrlId = `gift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const giftUrl = `https://dyshzc55luf52.cloudfront.net/gift/${giftUrlId}`
    
    const [result] = await connection.execute(
      `INSERT INTO gift_orders (
        id, gifter_id, gift_id, recipient_name, recipient_email, 
        message, gift_url, status, payment_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        giftUrlId, // 注文IDとしてギフトURLのIDを使用
        orderData.userId,
        orderData.giftId,
        orderData.recipientName,
        orderData.recipientEmail,
        orderData.message || null,
        giftUrl,
        'pending',
        'pending'
      ]
    )
    
    return {
      id: giftUrlId,
      gifterId: orderData.userId,
      giftId: orderData.giftId,
      recipientName: orderData.recipientName,
      recipientEmail: orderData.recipientEmail,
      message: orderData.message,
      giftUrl,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// 注文更新
async function updateOrder(orderId: string, updates: Partial<GiftOrder>): Promise<GiftOrder> {
  let connection: mysql.Connection | null = null
  
  try {
    connection = await mysql.createConnection(dbConfig)
    
    const updateFields: string[] = []
    const updateValues: any[] = []
    
    if (updates.status) {
      updateFields.push('status = ?')
      updateValues.push(updates.status)
    }
    
    if (updates.paymentStatus) {
      updateFields.push('payment_status = ?')
      updateValues.push(updates.paymentStatus)
    }
    
    if (updateFields.length === 0) {
      throw new Error('更新するフィールドが指定されていません')
    }
    
    updateFields.push('updated_at = NOW()')
    updateValues.push(orderId)
    
    await connection.execute(
      `UPDATE gift_orders SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    )
    
    // 更新後の注文を取得
    const [rows] = await connection.execute(
      'SELECT * FROM gift_orders WHERE id = ?',
      [orderId]
    )
    
    const order = (rows as any[])[0]
    return {
      id: order.id,
      gifterId: order.gifter_id,
      giftId: order.gift_id,
      recipientName: order.recipient_name,
      recipientEmail: order.recipient_email,
      message: order.message,
      giftUrl: order.gift_url,
      status: order.status,
      paymentStatus: order.payment_status,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    }
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// 注文取得
async function getOrder(orderId: string): Promise<GiftOrder | null> {
  let connection: mysql.Connection | null = null
  
  try {
    connection = await mysql.createConnection(dbConfig)
    
    const [rows] = await connection.execute(
      'SELECT * FROM gift_orders WHERE id = ?',
      [orderId]
    )
    
    if ((rows as any[]).length === 0) {
      return null
    }
    
    const order = (rows as any[])[0]
    return {
      id: order.id,
      gifterId: order.gifter_id,
      giftId: order.gift_id,
      recipientName: order.recipient_name,
      recipientEmail: order.recipient_email,
      message: order.message,
      giftUrl: order.gift_url,
      status: order.status,
      paymentStatus: order.payment_status,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    }
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// ユーザーの注文一覧取得
async function getUserOrders(userId: string): Promise<GiftOrder[]> {
  let connection: mysql.Connection | null = null
  
  try {
    connection = await mysql.createConnection(dbConfig)
    
    const [rows] = await connection.execute(
      'SELECT * FROM gift_orders WHERE gifter_id = ? ORDER BY created_at DESC',
      [userId]
    )
    
    return (rows as any[]).map(order => ({
      id: order.id,
      gifterId: order.gifter_id,
      giftId: order.gift_id,
      recipientName: order.recipient_name,
      recipientEmail: order.recipient_email,
      message: order.message,
      giftUrl: order.gift_url,
      status: order.status,
      paymentStatus: order.payment_status,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    }))
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// 決済処理（デモ用）
async function processPayment(orderId: string, paymentMethod: string): Promise<boolean> {
  // 実際の決済処理は外部サービスを使用
  // ここではデモ用に成功を返す
  console.log(`Processing payment for order ${orderId} with method ${paymentMethod}`)
  
  // 注文ステータスを更新
  await updateOrder(orderId, {
    status: 'paid',
    paymentStatus: 'paid'
  })
  
  return true
}

// メインハンドラー
export const handler = async (event: any): Promise<any> => {
  try {
    console.log('Event:', JSON.stringify(event, null, 2))
    
    const { httpMethod, path, body } = event
    const requestBody = body ? JSON.parse(body) : {}
    
    switch (httpMethod) {
      case 'POST':
        if (path.includes('/orders')) {
          const order = await createOrder(requestBody)
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({
              success: true,
              data: order,
              timestamp: new Date().toISOString(),
            })
          }
        }
        break
        
      case 'GET':
        if (path.includes('/orders/')) {
          const orderId = path.split('/').pop()
          const order = await getOrder(orderId!)
          
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
        }
        
        if (path.includes('/orders')) {
          const userId = requestBody.userId || event.queryStringParameters?.userId
          if (!userId) {
            return {
              success: false,
              error: 'ユーザーIDが必要です',
              timestamp: new Date().toISOString(),
            }
          }
          
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
          const order = await updateOrder(orderId!, requestBody)
          
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
            success,
            data: { processed: success },
            timestamp: new Date().toISOString(),
          }
        }
        break
        
      default:
        return {
          success: false,
          error: 'サポートされていないHTTPメソッドです',
          timestamp: new Date().toISOString(),
        }
    }
    
    return {
      success: false,
      error: '無効なリクエストです',
      timestamp: new Date().toISOString(),
    }
    
  } catch (error) {
    console.error('Error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return {
      success: false,
      error: '注文処理に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }
  }
} 