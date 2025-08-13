import { ref, computed } from 'vue'
import type { Gift } from '@/types'

export interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  emotion?: string
  intent?: string
  giftRecommendation?: GiftRecommendation
}

export interface GiftRecommendation {
  gift: Gift
  reason: string
  confidence: number
}

export interface EmotionAnalysis {
  emotion: string
  confidence: number
  keyPhrases: string[]
}

export const useChatInterface = () => {
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const inputText = ref('')
  const recommendations = ref<GiftRecommendation[]>([])

  // 会話履歴を計算
  const conversationHistory = computed(() => {
    return messages.value.map(msg => `${msg.sender}: ${msg.text}`).join('\n')
  })

  // メッセージID生成
  const generateId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 感情分析（簡易版）
  const analyzeEmotion = (text: string): EmotionAnalysis => {
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
  const extractIntent = (text: string, emotion: string, keyPhrases: string[]): string => {
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

  // AI応答生成
  const generateAIResponse = async (userMessage: string, conversation: ChatMessage[]): Promise<ChatMessage> => {
    // 感情分析
    const emotionAnalysis = analyzeEmotion(userMessage)
    const intent = extractIntent(userMessage, emotionAnalysis.emotion, emotionAnalysis.keyPhrases)
    
    // プロンプト生成
    const prompt = generateEmotionBasedPrompt(conversation, emotionAnalysis, intent)
    
    try {
      // AWS Lambda APIを呼び出し
      const response = await fetch('https://jquzcc3vd0.execute-api.us-west-2.amazonaws.com/prod/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversation: conversationHistory.value,
          emotion: emotionAnalysis.emotion,
          intent: intent,
          keyPhrases: emotionAnalysis.keyPhrases
        })
      })
      
      if (!response.ok) {
        throw new Error('AI応答の生成に失敗しました')
      }
      
      const result = await response.json()
      
      return {
        id: generateId(),
        text: result.response || '申し訳ございません。現在AIシステムが一時的に利用できません。',
        sender: 'ai',
        timestamp: new Date(),
        emotion: emotionAnalysis.emotion,
        intent: intent,
        giftRecommendation: result.recommendations?.[0]
      }
    } catch (error) {
      console.error('AI response error:', error)
      
      // フォールバック応答
      return {
        id: generateId(),
        text: generateFallbackResponse(emotionAnalysis.emotion, intent),
        sender: 'ai',
        timestamp: new Date(),
        emotion: emotionAnalysis.emotion,
        intent: intent
      }
    }
  }

  // 感情ベースのプロンプト生成
  const generateEmotionBasedPrompt = (conversation: ChatMessage[], emotionAnalysis: EmotionAnalysis, intent: string) => {
    return `
あなたは健康ギフトの専門アドバイザーです。ユーザーの感情と意図を分析し、最適な健康ギフトを推薦してください。

会話履歴:
${conversation.map(msg => `${msg.sender}: ${msg.text}`).join('\n')}

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
1. 感情理解の確認
2. 推薦ギフト（3つ）
3. 各ギフトの推薦理由
4. 相手へのメッセージ提案

回答は親しみやすく、共感的な口調でお願いします。
`
  }

  // フォールバック応答生成
  const generateFallbackResponse = (emotion: string, intent: string): string => {
    const responses = {
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

  // メッセージ送信
  const sendMessage = async () => {
    if (!inputText.value.trim() || isLoading.value) return
    
    const userMessage: ChatMessage = {
      id: generateId(),
      text: inputText.value.trim(),
      sender: 'user',
      timestamp: new Date()
    }
    
    messages.value.push(userMessage)
    const currentText = inputText.value
    inputText.value = ''
    
    // AI応答を生成
    isLoading.value = true
    try {
      const aiResponse = await generateAIResponse(currentText, messages.value)
      messages.value.push(aiResponse)
      
      // 推薦ギフトがあれば保存
      if (aiResponse.giftRecommendation) {
        recommendations.value.push(aiResponse.giftRecommendation)
      }
    } catch (error) {
      console.error('Failed to generate AI response:', error)
      
      // エラーメッセージを追加
      messages.value.push({
        id: generateId(),
        text: '申し訳ございません。現在システムが一時的に利用できません。しばらく時間をおいてから再度お試しください。',
        sender: 'ai',
        timestamp: new Date()
      })
    } finally {
      isLoading.value = false
    }
  }

  // 会話をリセット
  const resetConversation = () => {
    messages.value = []
    recommendations.value = []
    inputText.value = ''
  }

  // 推薦ギフトを取得
  const getRecommendations = computed(() => {
    return recommendations.value
  })

  // 感情アイコンを取得
  const getEmotionIcon = (emotion: string): string => {
    const icons = {
      positive: '😊',
      negative: '😔',
      neutral: '😐'
    }
    return icons[emotion as keyof typeof icons] || '😐'
  }

  // 時間フォーマット
  const formatTime = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return {
    messages,
    isLoading,
    inputText,
    recommendations,
    sendMessage,
    resetConversation,
    getRecommendations,
    getEmotionIcon,
    formatTime
  }
} 