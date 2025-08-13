import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import mysql from 'mysql2/promise'

// Bedrockクライアントの初期化
const bedrock = new BedrockRuntimeClient({ region: 'us-west-2' })

// データベース設定
const dbConfig = {
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
}

interface LineEvent {
  events: LineEventItem[]
}

interface LineEventItem {
  type: string
  message?: {
    type: string
    text: string
  }
  replyToken?: string
  source: {
    userId: string
    type: string
  }
}

interface LineMessage {
  type: string
  text: string
}

interface LineReply {
  replyToken: string
  messages: LineMessage[]
}

// 感情分析（簡易版）
const analyzeEmotion = (text: string): { emotion: string; confidence: number; keyPhrases: string[] } => {
  const positiveWords = ['ありがとう', '感謝', '嬉しい', '幸せ', '愛', '大切', '素晴らしい', '最高']
  const negativeWords = ['心配', '不安', '悲しい', '困る', '大変', '辛い', '苦しい']
  const concernWords = ['健康', '体調', '病気', '疲れ', 'ストレス', '運動', '食事']
  
  const lowerText = text.toLowerCase()
  let emotion = 'neutral'
  let confidence = 0.5
  
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length
  const concernCount = concernWords.filter(word => lowerText.includes(word)).length
  
  if (positiveCount > negativeCount) {
    emotion = 'positive'
    confidence = Math.min(0.9, 0.5 + (positiveCount * 0.1))
  } else if (negativeCount > positiveCount) {
    emotion = 'negative'
    confidence = Math.min(0.9, 0.5 + (negativeCount * 0.1))
  }
  
  const keyPhrases = [...new Set([
    ...positiveWords.filter(word => lowerText.includes(word)),
    ...negativeWords.filter(word => lowerText.includes(word)),
    ...concernWords.filter(word => lowerText.includes(word))
  ])]
  
  return { emotion, confidence, keyPhrases }
}

// 意図抽出
const extractIntent = (text: string): string => {
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('健康') || lowerText.includes('体調')) {
    return 'health_concern'
  }
  if (lowerText.includes('感謝') || lowerText.includes('ありがとう')) {
    return 'gratitude'
  }
  if (lowerText.includes('心配') || lowerText.includes('不安')) {
    return 'worry'
  }
  if (lowerText.includes('励まし') || lowerText.includes('応援')) {
    return 'encouragement'
  }
  if (lowerText.includes('愛') || lowerText.includes('大切')) {
    return 'love'
  }
  
  return 'general'
}

// ギフト推薦を取得
const getGiftRecommendations = async (emotion: string, intent: string, budget?: string): Promise<any[]> => {
  let connection: mysql.Connection | null = null
  
  try {
    connection = await mysql.createConnection(dbConfig)
    
    let query = 'SELECT * FROM gifts WHERE 1=1'
    const params: any[] = []
    
    // 感情と意図に基づいてカテゴリをフィルタリング
    if (intent === 'health_concern') {
      query += ' AND (category LIKE ? OR category LIKE ? OR category LIKE ?)'
      params.push('%健康診断%', '%フィットネス%', '%サプリメント%')
    } else if (intent === 'gratitude') {
      query += ' AND (category LIKE ? OR category LIKE ?)'
      params.push('%スパ%', '%マッサージ%')
    } else if (intent === 'love') {
      query += ' AND (category LIKE ? OR category LIKE ?)'
      params.push('%ウェアラブル%', '%フィットネス%')
    }
    
    // 予算フィルタリング
    if (budget) {
      const [minPrice, maxPrice] = budget.split('-').map(p => parseInt(p.replace(/[^\d]/g, '')))
      if (minPrice && maxPrice) {
        query += ' AND price BETWEEN ? AND ?'
        params.push(minPrice, maxPrice)
      }
    }
    
    query += ' ORDER BY RAND() LIMIT 3'
    
    const [rows] = await connection.execute(query, params)
    return rows as any[]
    
  } catch (error) {
    console.error('Database error:', error)
    return []
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// AI応答生成
const generateAIResponse = async (userMessage: string, emotion: string, intent: string, giftRecommendations: any[]): Promise<string> => {
  const prompt = `
あなたは健康ギフトの専門アドバイザーです。ユーザーの感情と意図を分析し、最適な健康ギフトを推薦してください。

ユーザーメッセージ: ${userMessage}

分析結果:
- 感情: ${emotion}
- 意図: ${intent}

利用可能なギフト:
${giftRecommendations.map(gift => `- ${gift.name} (¥${gift.price}): ${gift.description}`).join('\n')}

以下の形式で回答してください：
1. 感情理解の確認（1-2文）
2. 推薦ギフトの紹介（各ギフトについて1文ずつ）
3. 相手へのメッセージ提案（1文）

回答は親しみやすく、共感的な口調で、LINEメッセージとして適切な長さ（200文字以内）でお願いします。
`

  try {
    const response = await bedrock.send(new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      contentType: 'application/json',
      body: JSON.stringify({
        prompt,
        max_tokens: 500,
        temperature: 0.7
      })
    }))

    const result = JSON.parse(new TextDecoder().decode(response.body))
    return result.completion || '申し訳ございません。現在AIシステムが一時的に利用できません。'
  } catch (error) {
    console.error('Bedrock error:', error)
    return generateFallbackResponse(emotion, intent)
  }
}

// フォールバック応答生成
const generateFallbackResponse = (emotion: string, intent: string): string => {
  const responses: Record<string, Record<string, string>> = {
    positive: {
      health_concern: '相手の健康を気遣う気持ちが伝わってきますね。健康診断やフィットネス体験はいかがでしょうか？',
      gratitude: '感謝の気持ちを伝えるのは素晴らしいですね。健康をテーマにしたギフトで、さらに深い感謝を表現できますよ。',
      love: '愛情深い気持ちが伝わってきます。大切な人の健康をサポートするギフトを選んでみませんか？',
      general: '温かい気持ちが伝わってきますね。健康ギフトで相手への想いを形にしてみませんか？'
    },
    negative: {
      worry: '心配な気持ちが伝わってきますね。健康管理のサポートになるギフトで、少しでも安心してもらえるといいですね。',
      general: '大変な状況ですね。健康をサポートするギフトで、少しでも力になれればと思います。'
    },
    neutral: {
      health_concern: '健康について考えているのですね。様々な健康ギフトがありますので、お気軽にご相談ください。',
      general: '健康ギフトについてお聞かせください。相手に合った最適なギフトをご提案いたします。'
    }
  }
  
  return responses[emotion]?.[intent] || responses.neutral.general
}

// 会話履歴を保存
const saveConversation = async (userId: string, userMessage: string, aiResponse: string, emotion: string, intent: string) => {
  let connection: mysql.Connection | null = null
  
  try {
    connection = await mysql.createConnection(dbConfig)
    
    await connection.execute(
      `INSERT INTO chat_sessions (id, user_id, session_type, messages, emotion_analysis, created_at) 
       VALUES (UUID(), ?, 'line_chat', ?, ?, NOW())`,
      [
        userId,
        JSON.stringify([
          { sender: 'user', text: userMessage, timestamp: new Date().toISOString() },
          { sender: 'ai', text: aiResponse, timestamp: new Date().toISOString() }
        ]),
        JSON.stringify({ emotion, intent })
      ]
    )
  } catch (error) {
    console.error('Save conversation error:', error)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// メインハンドラー
export const handler = async (event: any): Promise<any> => {
  console.log('Event:', JSON.stringify(event, null, 2))

  try {
    const lineEvent: LineEvent = JSON.parse(event.body)
    
    if (!lineEvent.events || lineEvent.events.length === 0) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ message: 'No events' })
      }
    }

    const eventItem = lineEvent.events[0]
    
    // テキストメッセージのみ処理
    if (eventItem.type !== 'message' || eventItem.message?.type !== 'text') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ message: 'Not a text message' })
      }
    }

    const userMessage = eventItem.message.text
    const userId = eventItem.source.userId
    const replyToken = eventItem.replyToken

    if (!replyToken) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ message: 'No reply token' })
      }
    }

    // 感情分析
    const emotionAnalysis = analyzeEmotion(userMessage)
    const intent = extractIntent(userMessage)

    // ギフト推薦を取得
    const giftRecommendations = await getGiftRecommendations(
      emotionAnalysis.emotion, 
      intent
    )

    // AI応答を生成
    const aiResponse = await generateAIResponse(
      userMessage, 
      emotionAnalysis.emotion, 
      intent, 
      giftRecommendations
    )

    // 会話履歴を保存
    await saveConversation(userId, userMessage, aiResponse, emotionAnalysis.emotion, intent)

    // LINEに返信
    const reply: LineReply = {
      replyToken,
      messages: [
        {
          type: 'text',
          text: aiResponse
        }
      ]
    }

    // LINE Messaging APIに送信
    const lineResponse = await fetch(`https://api.line.me/v2/bot/message/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify(reply)
    })

    if (!lineResponse.ok) {
      console.error('LINE API error:', await lineResponse.text())
    }

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
        message: 'Message processed successfully' 
      })
    }

  } catch (error) {
    console.error('Handler error:', error)
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
} 