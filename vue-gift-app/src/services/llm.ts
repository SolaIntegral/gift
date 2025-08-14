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

// Plamo API クライアント
export class PlamoAPIClient {
  private config: LLMConfig

  constructor(config: LLMConfig) {
    this.config = config
  }

  async generateResponse(prompt: string): Promise<LLMResponse> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      console.log('Plamo API request:', {
        url: `${this.config.baseUrl}/v1/chat/completions`,
        model: this.config.model,
        prompt: prompt.substring(0, 100) + '...'
      })

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

      console.log('Plamo API response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Plamo API error response:', errorText)
        throw new Error(`Plamo API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      console.log('Plamo API success response:', data)
      
      return {
        text: data.choices[0]?.message?.content || '応答を生成できませんでした。',
        usage: data.usage
      }
    } catch (error) {
      console.error('Plamo API error details:', error)
      
      // タイムアウトエラーの詳細ログ
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Plamo API timeout - request took longer than', this.config.timeout, 'ms')
      }
      
      throw new LLMServiceError('PLAMO_API_ERROR', 'Plamo API呼び出しに失敗しました', error)
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

JSONのみを返してください。マークダウンやコードブロックは使用しないでください。
`

      const response = await this.generateResponse(prompt)
      
      try {
        // レスポンスからJSON部分を抽出
        let jsonText = response.text.trim()
        
        // マークダウンのコードブロックを除去
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '')
        }
        
        // 先頭と末尾の空白を除去
        jsonText = jsonText.trim()
        
        console.log('Extracted JSON text:', jsonText)
        
        const analysis = JSON.parse(jsonText)
        return {
          emotion: analysis.emotion || 'neutral',
          confidence: analysis.confidence || 0.5,
          keyPhrases: analysis.keyPhrases || []
        }
      } catch (parseError) {
        console.warn('Emotion analysis JSON parse error:', parseError)
        console.warn('Raw response text:', response.text)
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
    let emotion: 'positive' | 'negative' | 'neutral' | 'concerned' = 'neutral'
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
  private primaryClient: PlamoAPIClient
  private fallbackClient: AmazonBedrockClient
  private isPrimaryAvailable: boolean = true
  private errorCount: number = 0
  private readonly MAX_ERRORS = 3

  constructor(
    plamoConfig: LLMConfig,
    bedrockConfig: LLMConfig
  ) {
    this.primaryClient = new PlamoAPIClient(plamoConfig)
    this.fallbackClient = new AmazonBedrockClient(bedrockConfig)
  }

  async generateResponse(prompt: string): Promise<LLMResponse> {
    // 一時的にPlamo APIのみを使用（フォールバック無効化）
    try {
      console.log('Using Plamo API directly (fallback disabled for testing)')
      const response = await this.primaryClient.generateResponse(prompt)
      this.errorCount = 0 // 成功したらエラーカウントをリセット
      return response
    } catch (error) {
      console.error('Plamo API failed completely:', error)
      throw error // フォールバックせずにエラーを投げる
    }
  }

  async analyzeEmotion(text: string): Promise<EmotionAnalysis> {
    // 一時的にPlamo APIのみを使用（フォールバック無効化）
    try {
      console.log('Using Plamo API for emotion analysis (fallback disabled for testing)')
      return await this.primaryClient.analyzeEmotion(text)
    } catch (error) {
      console.error('Plamo API emotion analysis failed completely:', error)
      throw error // フォールバックせずにエラーを投げる
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
export const DEFAULT_PLAMO_CONFIG: LLMConfig = {
  apiKey: import.meta.env.VITE_PLAMO_API_KEY || '',
  baseUrl: import.meta.env.VITE_PLAMO_BASE_URL || 'https://platform.preferredai.jp/api/completion',
  model: import.meta.env.VITE_PLAMO_MODEL || 'plamo-2.0-prime',
  maxTokens: 1000,
  temperature: 0.7,
  timeout: 60000  // 60秒に延長
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
    llmServiceInstance = new LLMService(DEFAULT_PLAMO_CONFIG, DEFAULT_BEDROCK_CONFIG)
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