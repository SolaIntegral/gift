import mysql from 'mysql2/promise'

// MySQL接続設定
const dbConfig = {
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  port: parseInt(process.env.DB_PORT || '3306'),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
}

interface Gift {
  id: string
  name: string
  description: string
  price: number
  category: string
  partnerId?: string
  status: string
  imageUrl?: string
  createdAt: string
  recipientName?: string
  recipientEmail?: string
  message?: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

// 全ギフト取得
async function getAllGifts(): Promise<Gift[]> {
  let connection: mysql.Connection | null = null
  
  try {
    connection = await mysql.createConnection(dbConfig)
    
    const [rows] = await connection.execute(
      `SELECT id, name, description, price, category, partner_id, status, image_url, created_at 
       FROM gifts 
       WHERE status = 'active'
       ORDER BY created_at DESC`
    )

    const gifts = rows as any[]
    return gifts.map(gift => ({
      id: gift.id,
      name: gift.name,
      description: gift.description,
      price: gift.price,
      category: gift.category,
      partnerId: gift.partner_id,
      status: gift.status,
      imageUrl: gift.image_url,
      createdAt: gift.created_at,
    }))
  } catch (error) {
    console.error('Database error:', error)
    return []
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// ギフト詳細取得
async function getGiftById(giftId: string): Promise<Gift | null> {
  let connection: mysql.Connection | null = null
  
  try {
    connection = await mysql.createConnection(dbConfig)
    
    // まずgift_ordersテーブルから注文情報を取得
    const [orderRows] = await connection.execute(
      `SELECT go.id, go.gift_id, go.recipient_name, go.recipient_email, go.message, go.created_at,
              g.name, g.description, g.price, g.category, g.partner_id, g.status, g.image_url
       FROM gift_orders go
       JOIN gifts g ON go.gift_id = g.id
       WHERE go.id = ? AND go.status != 'cancelled'`,
      [giftId]
    )

    const orders = orderRows as any[]
    if (orders.length === 0) {
      return null
    }

    const order = orders[0]
    return {
      id: order.id,
      name: order.name,
      description: order.description,
      price: order.price,
      category: order.category,
      partnerId: order.partner_id,
      status: order.status,
      imageUrl: order.image_url,
      createdAt: order.created_at,
      // 注文情報を追加
      recipientName: order.recipient_name,
      recipientEmail: order.recipient_email,
      message: order.message,
    }
  } catch (error) {
    console.error('Database error:', error)
    return null
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

export const handler = async (event: any): Promise<any> => {
  try {
    console.log('Event:', JSON.stringify(event, null, 2))
    
    // API GatewayのパスパラメータからギフトIDを取得
    let giftId = event.pathParameters?.giftId
    
    // パスパラメータがない場合は、URLパスから抽出を試行
    if (!giftId) {
      const path = event.path || event.requestContext?.path || ''
      const pathSegments = path.split('/')
      giftId = pathSegments[pathSegments.length - 1]
    }
    
    console.log('Extracted gift ID:', giftId)
    console.log('Path parameters:', event.pathParameters)
    console.log('Path:', event.path)
    
    // データベース接続テスト
    console.log('Database config:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      ssl: process.env.DB_SSL
    })
    
    // テスト用: ギフトIDが "list" の場合は全ギフト一覧を返す
    if (giftId === 'list') {
      const gifts = await getAllGifts()
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        body: JSON.stringify({
          success: true,
          data: gifts,
          timestamp: new Date().toISOString(),
        })
      }
    }
    
    if (!giftId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        body: JSON.stringify({
          success: false,
          error: 'ギフトIDが指定されていません',
          timestamp: new Date().toISOString(),
        })
      }
    }
    
    // データベースからギフト取得
    const gift = await getGiftById(giftId)
    
    if (!gift) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        body: JSON.stringify({
          success: false,
          error: '指定されたギフトが見つかりません',
          timestamp: new Date().toISOString(),
        })
      }
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        data: gift,
        timestamp: new Date().toISOString(),
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        success: false,
        error: 'ギフト詳細の取得に失敗しました',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      })
    }
  }
} 