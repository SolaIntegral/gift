import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { createClient } from '@supabase/supabase-js'

const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' })

// Supabaseクライアント
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

// AI推薦生成
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

// Supabaseからギフト取得
async function getGiftsFromDatabase(answers: ConsultationAnswers): Promise<Gift[]> {
  try {
    // 予算に基づく価格範囲を設定
    const budgetRanges: Record<string, { min: number; max: number }> = {
      '5000-10000': { min: 5000, max: 10000 },
      '10000-20000': { min: 10000, max: 20000 },
      '20000-30000': { min: 20000, max: 30000 },
      '30000-50000': { min: 30000, max: 50000 },
      '50000+': { min: 50000, max: 999999 },
    }
    
    const range = budgetRanges[answers.budget] || { min: 0, max: 999999 }
    
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('status', 'active')
      .gte('price', range.min)
      .lte('price', range.max)
      .order('price', { ascending: true })
      .limit(10)

    if (error) throw error

    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      partnerId: item.partner_id,
      status: item.status,
      imageUrl: item.image_url,
      createdAt: item.created_at,
    }))
  } catch (error) {
    console.error('Database error:', error)
    return []
  }
}

// 相談履歴保存
async function saveConsultation(userId: string, answers: ConsultationAnswers, recommendations: Gift[]) {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .insert({
        user_id: userId,
        answers: answers,
        recommendations: recommendations
      })
      .select()
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error('Save consultation error:', error)
    throw error
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