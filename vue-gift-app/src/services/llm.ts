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
    // Plamo APIを試行
    if (this.isPrimaryAvailable) {
      try {
        console.log('Using Plamo API as primary LLM')
        const response = await this.primaryClient.generateResponse(prompt)
        this.errorCount = 0 // 成功したらエラーカウントをリセット
        return response
      } catch (error) {
        console.error('Plamo API failed, attempting fallback:', error)
        this.errorCount++
        
        // エラーが一定回数以上発生した場合、プライマリLLMを無効化
        if (this.errorCount >= this.MAX_ERRORS) {
          this.isPrimaryAvailable = false
          console.warn('Plamo API disabled due to repeated errors, switching to fallback')
        }
      }
    }
    
    // フォールバック: Amazon Bedrock
    try {
      console.log('Using Amazon Bedrock as fallback LLM')
      const response = await this.fallbackClient.generateResponse(prompt)
      return response
    } catch (error) {
      console.error('Both primary and fallback LLMs failed:', error)
      throw new LLMServiceError('ALL_LLMS_FAILED', '全てのLLMサービスが利用できません', error)
    }
  }

  async analyzeEmotion(text: string): Promise<EmotionAnalysis> {
    // Plamo APIを試行
    if (this.isPrimaryAvailable) {
      try {
        console.log('Using Plamo API for emotion analysis')
        return await this.primaryClient.analyzeEmotion(text)
      } catch (error) {
        console.error('Plamo API emotion analysis failed, using fallback:', error)
        this.errorCount++
        
        // エラーが一定回数以上発生した場合、プライマリLLMを無効化
        if (this.errorCount >= this.MAX_ERRORS) {
          this.isPrimaryAvailable = false
          console.warn('Plamo API disabled due to repeated errors, switching to fallback')
        }
      }
    }
    
    // フォールバック: Amazon Bedrock
    try {
      console.log('Using Amazon Bedrock for emotion analysis fallback')
      // Amazon Bedrockの感情分析は簡易版を使用
      return this.fallbackEmotionAnalysis(text)
    } catch (error) {
      console.error('Both primary and fallback emotion analysis failed:', error)
      // 最終的なフォールバック
      return this.fallbackEmotionAnalysis(text)
    }
  }
  
  // フォールバック用の感情分析（簡易版）
  private fallbackEmotionAnalysis(text: string): EmotionAnalysis {
    const lowerText = text.toLowerCase()
    let emotion: 'positive' | 'negative' | 'neutral' | 'concerned' = 'neutral'
    let confidence = 0.5

    if (lowerText.includes('ありがとう') || lowerText.includes('嬉しい') || lowerText.includes('最高')) {
      emotion = 'positive'
      confidence = 0.8
    } else if (lowerText.includes('心配') || lowerText.includes('不安') || lowerText.includes('困った')) {
      emotion = 'concerned'
      confidence = 0.7
    } else if (lowerText.includes('悲しい') || lowerText.includes('怒り') || lowerText.includes('最悪')) {
      emotion = 'negative'
      confidence = 0.8
    }

    return {
      emotion,
      confidence,
      keyPhrases: []
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
  timeout: 180000  // 180秒 (3分)に延長
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
健康ギフトの専門アドバイザーとして、以下の情報に基づいて最適なギフトを3つ推薦してください。

相談内容: ${conversation}

感情分析: ${emotionAnalysis.emotion} (信頼度: ${emotionAnalysis.confidence})

以下の形式で簡潔に回答してください：
1. 推薦ギフト3つ（名称、価格、特徴）
2. 各ギフトの推薦理由
3. 相手へのメッセージ提案

親しみやすく、実用的なアドバイスをお願いします。
`
} 