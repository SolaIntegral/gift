import type { EmotionAnalysis, GiftRecommendation } from '@/types'

// LLM設定インターフェース
export interface LLMConfig {
  apiKey: string
  baseUrl: string
  model: string
  maxTokens: number
  temperature: number
  timeout: number
}

// LLM応答インターフェース
export interface LLMResponse {
  text: string
  emotion?: string
  confidence?: number
  recommendations?: GiftRecommendation[]
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// LLMエラーインターフェース
export interface LLMError {
  code: string
  message: string
  details?: any
}

// Kotoba LLM API クライアント
export class KotobaLLMClient {
  private config: LLMConfig

  constructor(config: LLMConfig) {
    this.config = config
  }

  async generateResponse(prompt: string): Promise<LLMResponse> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'あなたは健康ギフトの専門アドバイザーです。ユーザーの感情を理解し、最適な健康ギフトを推薦してください。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          stream: false
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Kotoba LLM API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        text: data.choices[0]?.message?.content || '応答を生成できませんでした。',
        usage: data.usage
      }
    } catch (error) {
      console.error('Kotoba LLM error:', error)
      throw new LLMServiceError('KOTOBA_API_ERROR', 'Kotoba LLM API呼び出しに失敗しました', error)
    }
  }

  async analyzeEmotion(text: string): Promise<EmotionAnalysis> {
    try {
      const prompt = `
以下のテキストの感情を分析してください。

テキスト: "${text}"

以下の形式でJSONで回答してください：
{
  "emotion": "positive|negative|neutral|concerned",
  "confidence": 0.0-1.0,
  "keyPhrases": ["キーフレーズ1", "キーフレーズ2"]
}
`

      const response = await this.generateResponse(prompt)
      
      try {
        const analysis = JSON.parse(response.text)
        return {
          emotion: analysis.emotion || 'neutral',
          confidence: analysis.confidence || 0.5,
          keyPhrases: analysis.keyPhrases || []
        }
      } catch (parseError) {
        console.warn('Emotion analysis JSON parse error:', parseError)
        return this.fallbackEmotionAnalysis(text)
      }
    } catch (error) {
      console.error('Emotion analysis error:', error)
      return this.fallbackEmotionAnalysis(text)
    }
  }

  private fallbackEmotionAnalysis(text: string): EmotionAnalysis {
    // 簡易的な感情分析（フォールバック）
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
    } else if (concernCount > 0) {
      emotion = 'concerned'
      confidence = Math.min(0.8, 0.5 + (concernCount * 0.1))
    }
    
    const keyPhrases = [...new Set([
      ...positiveWords.filter(word => lowerText.includes(word)),
      ...negativeWords.filter(word => lowerText.includes(word)),
      ...concernWords.filter(word => lowerText.includes(word))
    ])]
    
    return { emotion, confidence, keyPhrases }
  }
}

// Amazon Bedrock クライアント（フォールバック用）
export class AmazonBedrockClient {
  private config: LLMConfig

  constructor(config: LLMConfig) {
    this.config = config
  }

  async generateResponse(prompt: string): Promise<LLMResponse> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      const response = await fetch(`${this.config.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          model: this.config.model
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Amazon Bedrock API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        text: data.response || '応答を生成できませんでした。',
        recommendations: data.recommendations
      }
    } catch (error) {
      console.error('Amazon Bedrock error:', error)
      throw new LLMServiceError('BEDROCK_API_ERROR', 'Amazon Bedrock API呼び出しに失敗しました', error)
    }
  }
}

// LLMサービスエラークラス
export class LLMServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public originalError?: any
  ) {
    super(message)
    this.name = 'LLMServiceError'
  }
}

// 統合LLMサービス
export class LLMService {
  private primaryClient: KotobaLLMClient
  private fallbackClient: AmazonBedrockClient
  private isPrimaryAvailable: boolean = true
  private errorCount: number = 0
  private readonly MAX_ERRORS = 3

  constructor(
    kotobaConfig: LLMConfig,
    bedrockConfig: LLMConfig
  ) {
    this.primaryClient = new KotobaLLMClient(kotobaConfig)
    this.fallbackClient = new AmazonBedrockClient(bedrockConfig)
  }

  async generateResponse(prompt: string): Promise<LLMResponse> {
    if (this.isPrimaryAvailable) {
      try {
        const response = await this.primaryClient.generateResponse(prompt)
        this.errorCount = 0 // 成功したらエラーカウントをリセット
        return response
      } catch (error) {
        console.warn('Primary LLM failed, falling back to Amazon Bedrock:', error)
        this.errorCount++
        
        if (this.errorCount >= this.MAX_ERRORS) {
          this.isPrimaryAvailable = false
          console.warn('Primary LLM disabled due to repeated errors')
        }
        
        return await this.fallbackClient.generateResponse(prompt)
      }
    } else {
      // プライマリが無効な場合は直接フォールバックを使用
      return await this.fallbackClient.generateResponse(prompt)
    }
  }

  async analyzeEmotion(text: string): Promise<EmotionAnalysis> {
    if (this.isPrimaryAvailable) {
      try {
        return await this.primaryClient.analyzeEmotion(text)
      } catch (error) {
        console.warn('Primary emotion analysis failed, using fallback:', error)
        return this.primaryClient.fallbackEmotionAnalysis(text)
      }
    } else {
      return this.primaryClient.fallbackEmotionAnalysis(text)
    }
  }

  // プライマリLLMの状態をリセット
  resetPrimaryLLM() {
    this.isPrimaryAvailable = true
    this.errorCount = 0
  }

  // 現在のLLM状態を取得
  getStatus() {
    return {
      primaryAvailable: this.isPrimaryAvailable,
      errorCount: this.errorCount,
      usingFallback: !this.isPrimaryAvailable
    }
  }
}

// 設定のデフォルト値
export const DEFAULT_KOTOBA_CONFIG: LLMConfig = {
  apiKey: import.meta.env.VITE_KOTOBA_API_KEY || '',
  baseUrl: import.meta.env.VITE_KOTOBA_BASE_URL || 'https://api.kotoba.ai',
  model: import.meta.env.VITE_KOTOBA_MODEL || 'kotoba-1.0',
  maxTokens: 1000,
  temperature: 0.7,
  timeout: 30000
}

export const DEFAULT_BEDROCK_CONFIG: LLMConfig = {
  apiKey: '',
  baseUrl: 'https://jquzcc3vd0.execute-api.us-west-2.amazonaws.com/prod',
  model: 'claude-3-sonnet',
  maxTokens: 1000,
  temperature: 0.7,
  timeout: 30000
}

// シングルトンインスタンス
let llmServiceInstance: LLMService | null = null

export const getLLMService = (): LLMService => {
  if (!llmServiceInstance) {
    llmServiceInstance = new LLMService(DEFAULT_KOTOBA_CONFIG, DEFAULT_BEDROCK_CONFIG)
  }
  return llmServiceInstance
}

// 健康ギフト相談用のプロンプト生成
export const generateHealthGiftPrompt = (
  conversation: string,
  emotionAnalysis: EmotionAnalysis,
  intent: string
): string => {
  return `
あなたは健康ギフトの専門アドバイザーです。ユーザーの感情と意図を理解し、最適な健康ギフトを推薦してください。

会話履歴:
${conversation}

分析結果:
- 感情: ${emotionAnalysis.emotion}
- 意図: ${intent}
- キーフレーズ: ${emotionAnalysis.keyPhrases.join(', ')}

分析項目:
1. 相手への感情（愛情、感謝、心配、励ましなど）
2. 相手に望む変化（健康向上、ストレス軽減、活力向上など）
3. 関係性（家族、友人、恋人、同僚など）
4. 予算感（高級、中級、手頃など）

以下の形式で回答してください：
1. 感情理解の確認（共感的な応答）
2. 推薦ギフト（3つ、具体的な商品名と価格）
3. 各ギフトの推薦理由（感情に基づく）
4. 相手へのメッセージ提案

回答は親しみやすく、共感的な口調でお願いします。
`
} 