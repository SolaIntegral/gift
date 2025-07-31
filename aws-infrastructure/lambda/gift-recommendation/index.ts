import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import { Client } from 'pg'

const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' })
const secretsManager = new SecretsManagerClient({ region: process.env.AWS_REGION })

interface ConsultationAnswers {
  age: number
  gender: 'male' | 'female' | 'other'
  healthConcerns: string[]
  budget: 'low' | 'medium' | 'high' | 'premium'
  relationship?: string
}

interface Gift {
  id: string
  name: string
  description: string
  price: number
  category: string
  partnerId: string
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

// AI推薦生成
async function generateAIRecommendations(answers: ConsultationAnswers): Promise<string> {
  const prompt = `
    以下のユーザープロフィールに基づいて、最適な健康ギフトを3つ推薦してください：
    
    年齢: ${answers.age}
    性別: ${answers.gender}
    健康関心事: ${answers.healthConcerns.join(', ')}
    予算: ${answers.budget}
    関係性: ${answers.relationship || '未指定'}
    
    各ギフトについて以下の形式で回答してください：
    1. ギフト名
    2. 推薦理由（健康面での効果を含む）
    3. 期待される効果
    4. 注意事項
    
    回答は日本語で、親しみやすく分かりやすい表現でお願いします。
  `

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
  
  return result.completion
}

// データベースからギフト取得
async function getGiftsFromDatabase(answers: ConsultationAnswers): Promise<Gift[]> {
  const client = await getDbClient()
  
  try {
    await client.connect()
    
    // 予算に基づく価格範囲を設定
    const budgetRanges = {
      low: { min: 0, max: 5000 },
      medium: { min: 5000, max: 15000 },
      high: { min: 15000, max: 50000 },
      premium: { min: 50000, max: 999999 },
    }
    
    const range = budgetRanges[answers.budget]
    
    const query = `
      SELECT id, name, description, price, category, partner_id, status, image_url, created_at
      FROM gifts 
      WHERE status = 'active' 
        AND price BETWEEN $1 AND $2
        AND category IN (
          SELECT DISTINCT category 
          FROM gifts 
          WHERE status = 'active'
        )
      ORDER BY price ASC
      LIMIT 10
    `
    
    const result = await client.query(query, [range.min, range.max])
    return result.rows.map(row => ({
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
  } finally {
    await client.end()
  }
}

// 相談履歴保存
async function saveConsultation(userId: string, answers: ConsultationAnswers, recommendations: Gift[]) {
  const client = await getDbClient()
  
  try {
    await client.connect()
    
    const query = `
      INSERT INTO consultations (user_id, answers, recommendations, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id
    `
    
    const result = await client.query(query, [
      userId,
      JSON.stringify(answers),
      JSON.stringify(recommendations),
    ])
    
    return result.rows[0].id
  } finally {
    await client.end()
  }
}

export const handler = async (event: any): Promise<ApiResponse<{
  consultationId: string
  recommendations: Gift[]
  aiExplanation: string
}>> => {
  try {
    console.log('Event:', JSON.stringify(event, null, 2))
    
    const body = JSON.parse(event.body)
    const { answers, userId } = body
    
    if (!answers) {
      return {
        success: false,
        error: '相談内容が提供されていません',
        timestamp: new Date().toISOString(),
      }
    }
    
    // データベースからギフト取得
    const gifts = await getGiftsFromDatabase(answers)
    
    if (gifts.length === 0) {
      return {
        success: false,
        error: '条件に合うギフトが見つかりませんでした',
        timestamp: new Date().toISOString(),
      }
    }
    
    // AI推薦生成
    const aiExplanation = await generateAIRecommendations(answers)
    
    // 上位3つのギフトを選択
    const recommendations = gifts.slice(0, 3)
    
    // 相談履歴保存
    const consultationId = await saveConsultation(userId, answers, recommendations)
    
    return {
      success: true,
      data: {
        consultationId,
        recommendations,
        aiExplanation,
      },
      timestamp: new Date().toISOString(),
    }
    
  } catch (error) {
    console.error('Error:', error)
    
    return {
      success: false,
      error: 'ギフト推薦の生成に失敗しました',
      timestamp: new Date().toISOString(),
    }
  }
} 