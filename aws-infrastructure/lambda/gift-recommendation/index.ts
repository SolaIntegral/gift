import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import mysql from 'mysql2/promise'

const bedrock = new BedrockRuntimeClient({ region: 'us-west-2' })

// MySQL接続設定
const dbConfig = {
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  port: parseInt(process.env.DB_PORT || '3306'),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
}

interface ConsultationAnswers {
  age: string
  gender: string
  healthConcerns: string[]
  budget: string
  relationship?: string
  occasion?: string
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
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

// AI推薦生成（Amazon Bedrock使用）
async function generateAIRecommendations(answers: ConsultationAnswers): Promise<string> {
  const prompt = `
    以下のユーザープロフィールに基づいて、最適な健康ギフトを3つ推薦してください：
    
    年齢: ${answers.age}
    性別: ${answers.gender}
    健康関心事: ${answers.healthConcerns.join(', ')}
    予算: ${answers.budget}
    関係性: ${answers.relationship || '未指定'}
    贈る機会: ${answers.occasion || '未指定'}
    
    各ギフトについて以下の形式で回答してください：
    1. ギフト名
    2. 推薦理由（健康面での効果を含む）
    3. 期待される効果
    4. 注意事項
    
    回答は日本語で、親しみやすく分かりやすい表現でお願いします。
  `

  try {
    const command = new InvokeModelCommand({
      modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
      contentType: 'application/json',
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 1500,
        temperature: 0.7,
        top_p: 0.9,
      }),
    })

    const response = await bedrock.send(command)
    const result = JSON.parse(new TextDecoder().decode(response.body))
    
    return result.completion || 'AIからの推薦メッセージを生成できませんでした。'
  } catch (error) {
    console.error('Bedrock API error:', error)
    return 'AI推薦システムが一時的に利用できません。専門スタッフが手動でギフトを選択いたします。'
  }
}

// RDSからギフト取得
async function getGiftsFromDatabase(answers: ConsultationAnswers): Promise<Gift[]> {
  let connection: mysql.Connection | null = null
  
  try {
    connection = await mysql.createConnection(dbConfig)
    
    // 予算に基づく価格範囲を設定
    const budgetRanges: Record<string, { min: number; max: number }> = {
      '5000-10000': { min: 5000, max: 10000 },
      '10000-20000': { min: 10000, max: 20000 },
      '20000-30000': { min: 20000, max: 30000 },
      '30000-50000': { min: 30000, max: 50000 },
      '50000+': { min: 50000, max: 999999 },
    }
    
    const range = budgetRanges[answers.budget] || { min: 0, max: 999999 }
    
    const [rows] = await connection.execute(
      `SELECT id, name, description, price, category, partner_id, status, image_url, created_at 
       FROM gifts 
       WHERE status = 'active' 
       AND price >= ? AND price <= ? 
       ORDER BY price ASC 
       LIMIT 10`,
      [range.min, range.max]
    )

    return (rows as any[]).map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      category: row.category,
      partnerId: row.partner_id,
      status: row.status,
      imageUrl: row.image_url,
      createdAt: row.created_at,
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

// 相談履歴保存
async function saveConsultation(userId: string, answers: ConsultationAnswers, recommendations: Gift[]) {
  let connection: mysql.Connection | null = null
  
  try {
    connection = await mysql.createConnection(dbConfig)
    
    // undefined値をnullに変換
    const safeUserId = userId || null
    const safeAnswers = answers || null
    const safeRecommendations = recommendations || null
    
    const [result] = await connection.execute(
      `INSERT INTO consultations (id, user_id, answers, recommendations, created_at) 
       VALUES (UUID(), ?, ?, ?, NOW())`,
      [safeUserId, JSON.stringify(safeAnswers), JSON.stringify(safeRecommendations)]
    )

    return (result as any).insertId
  } catch (error) {
    console.error('Save consultation error:', error)
    throw error
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

export const handler = async (event: any): Promise<any> => {
  try {
    console.log('Event:', JSON.stringify(event, null, 2))
    
    const body = JSON.parse(event.body)
    const { answers, userId } = body
    
    if (!answers) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({
          success: false,
          error: '相談内容が提供されていません',
          timestamp: new Date().toISOString(),
        })
      }
    }
    
    // データベースからギフト取得
    const gifts = await getGiftsFromDatabase(answers)
    
    if (gifts.length === 0) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({
          success: false,
          error: '条件に合うギフトが見つかりませんでした',
          timestamp: new Date().toISOString(),
        })
      }
    }
    
    // AI推薦生成
    const aiExplanation = await generateAIRecommendations(answers)
    
    // 上位3つのギフトを選択
    const recommendations = gifts.slice(0, 3)
    
    // 相談履歴保存（userIdが存在しない場合はデフォルト値を設定）
    const defaultUserId = userId || 'anonymous'
    const consultationId = await saveConsultation(defaultUserId, answers, recommendations)
    
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
        data: {
          consultationId: consultationId.toString(),
          recommendations,
          aiExplanation,
        },
        timestamp: new Date().toISOString(),
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
    
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
        error: 'ギフト推薦の生成に失敗しました',
        timestamp: new Date().toISOString(),
      })
    }
  }
} 