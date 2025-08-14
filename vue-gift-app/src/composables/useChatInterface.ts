import { ref, computed } from 'vue'
import { getLLMService } from '@/services/llm'
import type { EmotionAnalysis, GiftRecommendation } from '@/types'

export interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  emotion?: EmotionAnalysis
  giftRecommendations?: GiftRecommendation[]
}

export interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
}

export const useChatInterface = () => {
  const state = ref<ChatState>({
    messages: [],
    isLoading: false,
    error: null
  })

  const llmService = getLLMService()

  // 計算プロパティ
  const hasMessages = computed(() => state.value.messages.length > 0)
  const lastMessage = computed(() => 
    state.value.messages[state.value.messages.length - 1]
  )

  // メッセージ送信
  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date()
    }

    state.value.messages.push(userMessage)
    state.value.isLoading = true
    state.value.error = null

    try {
      // 感情分析
      const emotion = await llmService.analyzeEmotion(text)
      
      // AI応答生成
      const response = await llmService.generateResponse(
        generateHealthGiftPrompt(text, emotion, 'gift-consultation')
      )

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isUser: false,
        timestamp: new Date(),
        emotion: emotion
      }

      state.value.messages.push(aiMessage)
    } catch (error) {
      console.error('Chat error:', error)
      state.value.error = 'メッセージの送信に失敗しました。しばらく待ってから再試行してください。'
      
      // エラーメッセージを表示
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: '申し訳ございません。一時的なエラーが発生しました。しばらく待ってから再試行してください。',
        isUser: false,
        timestamp: new Date()
      }
      state.value.messages.push(errorMessage)
    } finally {
      state.value.isLoading = false
    }
  }

  // 感情分析
  const analyzeEmotion = async (text: string): Promise<EmotionAnalysis> => {
    try {
      return await llmService.analyzeEmotion(text)
    } catch (error) {
      console.error('Emotion analysis error:', error)
      // フォールバック感情分析
      return {
        emotion: 'neutral',
        confidence: 0.5,
        keyPhrases: []
      }
    }
  }

  // ギフト推薦
  const getGiftRecommendations = async (context: string): Promise<GiftRecommendation[]> => {
    try {
      const prompt = `
以下のコンテキストに基づいて、健康ギフトを3つ推薦してください。

コンテキスト: ${context}

各ギフトについて以下の情報を含めてください：
1. ギフト名
2. 価格帯
3. 推薦理由
4. 対象者
5. 期待される効果

JSON形式で回答してください。
`

      const response = await llmService.generateResponse(prompt)
      
      try {
        // レスポンスからJSON部分を抽出
        let jsonText = response.text.trim()
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '')
        }
        
        const data = JSON.parse(jsonText)
        return data.recommendations || data.gifts || []
      } catch (parseError) {
        console.warn('Gift recommendations JSON parse error:', parseError)
        return []
      }
    } catch (error) {
      console.error('Gift recommendations error:', error)
      return []
    }
  }

  // チャット履歴クリア
  const clearChat = () => {
    state.value.messages = []
    state.value.error = null
  }

  // エラークリア
  const clearError = () => {
    state.value.error = null
  }

  // 初期メッセージ
  const addWelcomeMessage = () => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      text: 'こんにちは！健康ギフトの相談を承ります。贈りたい相手や予算、健康への関心事など、お気軽にお聞かせください。',
      isUser: false,
      timestamp: new Date()
    }
    state.value.messages = [welcomeMessage]
  }

  return {
    // 状態
    state: readonly(state),
    
    // 計算プロパティ
    hasMessages,
    lastMessage,
    
    // アクション
    sendMessage,
    analyzeEmotion,
    getGiftRecommendations,
    clearChat,
    clearError,
    addWelcomeMessage
  }
}

// 健康ギフト相談用のプロンプト生成
const generateHealthGiftPrompt = (
  userMessage: string,
  emotionAnalysis: EmotionAnalysis,
  context: string
): string => {
  return `
あなたは健康ギフトの専門アドバイザーです。ユーザーの感情と意図を理解し、最適な健康ギフトを推薦してください。

ユーザーメッセージ: ${userMessage}

感情分析結果:
- 感情: ${emotionAnalysis.emotion}
- 信頼度: ${emotionAnalysis.confidence}
- キーフレーズ: ${emotionAnalysis.keyPhrases.join(', ')}

コンテキスト: ${context}

以下の点を考慮して回答してください：
1. ユーザーの感情に共感する
2. 健康への関心事を理解する
3. 予算感を考慮する
4. 具体的で実用的なギフトを推薦する
5. 相手への思いやりが伝わるメッセージを提案する

回答は親しみやすく、共感的な口調でお願いします。
`
} 