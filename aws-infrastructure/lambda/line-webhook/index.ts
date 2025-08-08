import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import mysql from 'mysql2/promise'
import crypto from 'crypto'

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
interface LineEvent {
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
  timestamp: number
}

interface LineWebhookRequest {
  events: LineEvent[]
  destination: string
}

interface LineMessage {
  type: string
  text?: string
  quickReply?: {
    items: Array<{
      action: {
        type: string
        label: string
        text: string
        uri?: string
      }
    }>
  }
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

// LINE署名検証
function verifyLineSignature(body: string, signature: string): boolean {
  const channelSecret = process.env.LINE_CHANNEL_SECRET || ''
  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(body, 'utf8')
    .digest('base64')
  
  return hash === signature
}

// LINE API呼び出し
async function replyToLine(replyToken: string, messages: LineMessage[]): Promise<void> {
  const response = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages,
    }),
  })
  
  if (!response.ok) {
    throw new Error(`LINE API error: ${response.status}`)
  }
}

// プッシュメッセージ送信
async function pushMessage(userId: string, messages: LineMessage[]): Promise<void> {
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: userId,
      messages,
    }),
  })
  
  if (!response.ok) {
    throw new Error(`LINE API error: ${response.status}`)
  }
}

// AIチャットボット応答生成
async function generateChatbotResponse(userMessage: string, userId: string): Promise<string> {
  const prompt = `
あなたは健康ギフトの専門アドバイザーです。ユーザーの質問に対して親切で専門的な回答を提供してください。

ユーザーの質問: ${userMessage}

以下の点に注意して回答してください：
1. 健康ギフトに関する質問には具体的な提案をする
2. 価格帯や用途を考慮したアドバイスを提供する
3. 親切で丁寧な口調で回答する
4. 必要に応じて質問を返して詳細を聞く
5. 回答は200文字以内で簡潔に

回答:
`

  try {
    const response = await bedrock.send(
      new InvokeModelCommand({
        modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      })
    )

    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    return responseBody.content[0].text.trim()
  } catch (error) {
    console.error('Bedrock API error:', error)
    return '申し訳ございません。現在AIシステムが一時的に利用できません。しばらく時間をおいてから再度お試しください。'
  }
}

// ユーザー情報取得・保存
async function getUserInfo(userId: string): Promise<any> {
  let connection: mysql.Connection | null = null
  
  try {
    // LINEユーザー情報取得
    const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
    })
    
    if (!response.ok) {
      throw new Error(`Failed to get LINE user profile: ${response.status}`)
    }
    
    const profile = await response.json()
    
    // データベースに保存または更新
    connection = await mysql.createConnection(dbConfig)
    
    const [result] = await connection.execute(
      `INSERT INTO users (line_user_id, name, email, created_at, updated_at) 
       VALUES (?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE 
       name = VALUES(name), 
       updated_at = NOW()`,
      [(profile as any).userId, (profile as any).displayName, `${(profile as any).userId}@line.local`]
    )

    return { id: (result as any).insertId || userId }
  } catch (error) {
    console.error('Get user info error:', error)
    throw error
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// メッセージイベント処理
async function handleMessageEvent(event: LineEvent): Promise<void> {
  const { message, replyToken, source } = event
  
  if (!message || message.type !== 'text' || !message.text) {
    return
  }
  
  const userMessage = message.text
  const userId = source.userId
  
  // ユーザー情報取得
  await getUserInfo(userId)
  
  // 特殊コマンド処理
  if (userMessage === 'ギフト相談') {
    const messages: LineMessage[] = [
      {
        type: 'text',
        text: '健康ギフトの相談を始めましょう！以下の質問にお答えください。',
        quickReply: {
          items: [
            {
              action: {
                type: 'message',
                label: '年齢を教えて',
                text: '年齢を教えてください',
              },
            },
            {
              action: {
                type: 'message',
                label: '予算を教えて',
                text: '予算を教えてください',
              },
            },
            {
              action: {
                type: 'message',
                label: '健康関心事',
                text: '健康で気になることはありますか？',
              },
            },
          ],
        },
      },
    ]
    
    if (event.replyToken) {
      await replyToLine(event.replyToken, messages)
    }
    return
  }
  
  if (userMessage === '注文状況') {
    let connection: mysql.Connection | null = null
    
    try {
      connection = await mysql.createConnection(dbConfig)
      
      const [rows] = await connection.execute(
        `SELECT o.*, g.name as gift_name, g.price as gift_price
         FROM gift_orders o
         JOIN gifts g ON o.gift_id = g.id
         WHERE o.gifter_id = ?
         ORDER BY o.created_at DESC
         LIMIT 5`,
        [userId]
      )

      if ((rows as any[]).length === 0) {
        if (event.replyToken) {
          await replyToLine(event.replyToken, [{
            type: 'text',
            text: 'まだ注文履歴がありません。ギフト相談から始めてみませんか？',
          }])
        }
      } else {
        const orderTexts = (rows as any[]).map((order: any) => 
          `📦 ${order.gift_name}\n💰 ${order.gift_price}円\n📊 状況: ${order.status}\n📅 ${new Date(order.created_at).toLocaleDateString('ja-JP')}`
        ).join('\n\n')
        
        if (event.replyToken) {
          await replyToLine(event.replyToken, [{
            type: 'text',
            text: `最新の注文状況です：\n\n${orderTexts}`,
          }])
        }
      }
    } catch (error) {
      console.error('Get orders error:', error)
      if (event.replyToken) {
        await replyToLine(event.replyToken, [{
          type: 'text',
          text: '注文状況の取得に失敗しました。',
        }])
      }
    } finally {
      if (connection) {
        await connection.end()
      }
    }
    return
  }
  
  // AIチャットボット応答生成
  try {
    const aiResponse = await generateChatbotResponse(userMessage, userId)
    
    const messages: LineMessage[] = [
      {
        type: 'text',
        text: aiResponse,
        quickReply: {
          items: [
            {
              action: {
                type: 'message',
                label: 'ギフト相談',
                text: 'ギフト相談',
              },
            },
            {
              action: {
                type: 'message',
                label: '注文状況',
                text: '注文状況',
              },
            },
            {
              action: {
                type: 'uri',
                label: 'Webサイト',
                text: 'Webサイト',
                uri: process.env.FRONTEND_URL || 'https://gift-app.com',
              },
            },
          ],
        },
      },
    ]
    
    if (event.replyToken) {
      await replyToLine(event.replyToken, messages)
    }
  } catch (error) {
    console.error('AI response generation failed:', error)
    
    if (event.replyToken) {
      await replyToLine(event.replyToken, [{
        type: 'text',
        text: '申し訳ございません。現在システムが混雑しています。しばらく時間をおいてから再度お試しください。',
      }])
    }
  }
}

// フォローイベント処理
async function handleFollowEvent(event: LineEvent): Promise<void> {
  const { source } = event
  
  const messages: LineMessage[] = [
    {
      type: 'text',
      text: 'GIFTSへようこそ！🎁\n\n健康ギフトの専門アドバイザーです。\n\n以下のようなことができます：\n• ギフト相談\n• 注文状況確認\n• 健康アドバイス\n\n何でもお気軽にお聞きください！',
      quickReply: {
        items: [
          {
            action: {
              type: 'message',
              label: 'ギフト相談を始める',
              text: 'ギフト相談',
            },
          },
          {
            action: {
              type: 'uri',
              label: 'Webサイトを見る',
              text: 'Webサイトを見る',
              uri: process.env.FRONTEND_URL || 'https://gift-app.com',
            },
          },
        ],
      },
    },
  ]
  
  await pushMessage(source.userId, messages)
}

// メインハンドラー
export const handler = async (event: any): Promise<ApiResponse<any>> => {
  try {
    console.log('Event:', JSON.stringify(event, null, 2))
    
    const body = event.body
    const signature = event.headers['x-line-signature']
    
    // 署名検証
    if (!verifyLineSignature(body, signature)) {
      console.error('Invalid LINE signature')
      return {
        success: false,
        error: 'Invalid signature',
        timestamp: new Date().toISOString(),
      }
    }
    
    const webhookRequest: LineWebhookRequest = JSON.parse(body)
    
    // イベント処理
    for (const lineEvent of webhookRequest.events) {
      try {
        switch (lineEvent.type) {
          case 'message':
            await handleMessageEvent(lineEvent)
            break
            
          case 'follow':
            await handleFollowEvent(lineEvent)
            break
            
          case 'unfollow':
            // ユーザーがブロックした場合の処理
            console.log(`User ${lineEvent.source.userId} unfollowed`)
            break
            
          default:
            console.log(`Unhandled event type: ${lineEvent.type}`)
        }
      } catch (error) {
        console.error(`Error processing event:`, error)
      }
    }
    
    return {
      success: true,
      data: { processed: webhookRequest.events.length },
      timestamp: new Date().toISOString(),
    }
    
  } catch (error) {
    console.error('Error:', error)
    return {
      success: false,
      error: 'LINE Webhook処理に失敗しました',
      timestamp: new Date().toISOString(),
    }
  }
} 