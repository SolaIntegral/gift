# AI相談機能と健康意識向上機能 詳細設計書

## 📋 概要

### 機能の目的
1. **フリーチャットによる感情ベースのギフト選択**: 自然な会話を通じて相手への感情や意図を理解し、最適な健康ギフトを推薦
2. **健康意識向上機能**: ギフト受取人が特定の質問に答えることで、自分の健康を大切に思う気持ちを高め、行動変容を促進

### 審査での価値
- **プロダクト完成度**: より実用的で革新的なUX/UI
- **技術的実装**: 高度なAI活用と感情分析
- **アイデア**: 地域課題解決と社会的インパクト

---

## 🤖 AI相談機能（フリーチャット）

### 機能概要
従来の質問形式を超えて、自然な会話を通じて相手への感情や意図を理解し、最適な健康ギフトを推薦する機能。

### 技術実装

#### 1. チャットインターフェース
```typescript
// チャットメッセージ型定義
interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  emotion?: string
  intent?: string
  giftRecommendation?: GiftRecommendation
}

// チャット機能のComposable
const useChatInterface = () => {
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  
  const sendMessage = async (text: string) => {
    // ユーザーメッセージを追加
    const userMessage: ChatMessage = {
      id: generateId(),
      text,
      sender: 'user',
      timestamp: new Date()
    }
    messages.value.push(userMessage)
    
    // AI応答を生成
    isLoading.value = true
    try {
      const aiResponse = await generateAIResponse(text, messages.value)
      messages.value.push(aiResponse)
    } catch (error) {
      console.error('AI response error:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  return { messages, isLoading, sendMessage }
}
```

#### 2. 感情分析機能
```typescript
// AWS Comprehend を使用した感情分析
const useEmotionAnalysis = () => {
  const analyzeEmotion = async (text: string): Promise<string> => {
    try {
      const response = await comprehendClient.detectSentiment({
        Text: text,
        LanguageCode: 'ja'
      })
      return response.Sentiment || 'NEUTRAL'
    } catch (error) {
      console.error('Emotion analysis error:', error)
      return 'NEUTRAL'
    }
  }
  
  const analyzeKeyPhrases = async (text: string): Promise<string[]> => {
    try {
      const response = await comprehendClient.detectKeyPhrases({
        Text: text,
        LanguageCode: 'ja'
      })
      return response.KeyPhrases?.map(phrase => phrase.Text) || []
    } catch (error) {
      console.error('Key phrase analysis error:', error)
      return []
    }
  }
  
  return { analyzeEmotion, analyzeKeyPhrases }
}
```

#### 3. AI応答生成
```typescript
// 感情ベースのギフト推薦プロンプト
const generateEmotionBasedPrompt = (conversation: ChatMessage[], emotion: string, keyPhrases: string[]) => {
  return `
あなたは健康ギフトの専門アドバイザーです。ユーザーの感情と意図を分析し、最適な健康ギフトを推薦してください。

会話履歴:
${conversation.map(msg => `${msg.sender}: ${msg.text}`).join('\n')}

分析結果:
- 感情: ${emotion}
- キーフレーズ: ${keyPhrases.join(', ')}

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

// AI応答生成関数
const generateAIResponse = async (userMessage: string, conversation: ChatMessage[]): Promise<ChatMessage> => {
  const { analyzeEmotion, analyzeKeyPhrases } = useEmotionAnalysis()
  
  // 感情分析
  const emotion = await analyzeEmotion(userMessage)
  const keyPhrases = await analyzeKeyPhrases(userMessage)
  
  // プロンプト生成
  const prompt = generateEmotionBasedPrompt(conversation, emotion, keyPhrases)
  
  // Bedrock API呼び出し
  const response = await bedrockClient.invoke({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    contentType: 'application/json',
    body: JSON.stringify({
      prompt,
      max_tokens: 1000,
      temperature: 0.7
    })
  })
  
  const aiText = JSON.parse(new TextDecoder().decode(response.body)).completion
  
  return {
    id: generateId(),
    text: aiText,
    sender: 'ai',
    timestamp: new Date(),
    emotion,
    intent: extractIntent(keyPhrases)
  }
}
```

### UI/UX設計

#### チャットインターフェース
```vue
<template>
  <div class="chat-interface">
    <div class="chat-header">
      <h3>🤖 AI健康ギフト相談</h3>
      <p>自然な会話で最適なギフトを見つけましょう</p>
    </div>
    
    <div class="chat-messages" ref="messagesContainer">
      <div 
        v-for="message in messages" 
        :key="message.id"
        :class="['message', message.sender]"
      >
        <div class="message-content">
          <p>{{ message.text }}</p>
          <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
        </div>
        
        <!-- 感情表示（AIメッセージのみ） -->
        <div v-if="message.sender === 'ai' && message.emotion" class="emotion-indicator">
          <span :class="['emotion', message.emotion]">
            {{ getEmotionIcon(message.emotion) }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="chat-input">
      <input 
        v-model="inputText"
        @keyup.enter="sendMessage"
        placeholder="相手への想いを自然に話してみてください..."
        :disabled="isLoading"
      />
      <button @click="sendMessage" :disabled="isLoading || !inputText.trim()">
        <span v-if="isLoading">送信中...</span>
        <span v-else>送信</span>
      </button>
    </div>
  </div>
</template>
```

---

## 💪 健康意識向上機能

### 機能概要
ギフト受取人が特定の質問に答えることで、自分の健康を大切に思う気持ちを高め、行動変容を促進する機能。

### 質問セット設計

#### 1. 人生目標設定質問
```typescript
const lifeGoalsQuestions = [
  {
    id: 'life-goals',
    question: '死ぬまでに叶えたいことはありますか？',
    followUp: 'その目標を達成するために、健康はどのくらい重要ですか？',
    category: 'motivation',
    options: [
      { value: 'family', label: '家族との時間を大切にする', icon: '👨‍👩‍👧‍👦' },
      { value: 'travel', label: '世界中を旅する', icon: '✈️' },
      { value: 'career', label: 'キャリアで成功する', icon: '💼' },
      { value: 'hobby', label: '趣味を楽しむ', icon: '🎨' },
      { value: 'contribution', label: '社会に貢献する', icon: '🌍' }
    ]
  },
  {
    id: 'health-importance',
    question: '健康でいたい理由は何ですか？',
    followUp: '健康を失ったら、何が一番困りますか？',
    category: 'awareness',
    options: [
      { value: 'independence', label: '自立した生活を送りたい', icon: '🏠' },
      { value: 'family-support', label: '家族を支えたい', icon: '💪' },
      { value: 'enjoy-life', label: '人生を楽しみたい', icon: '😊' },
      { value: 'avoid-pain', label: '痛みや苦しみを避けたい', icon: '🛡️' },
      { value: 'achieve-goals', label: '目標を達成したい', icon: '🎯' }
    ]
  }
]
```

#### 2. 現在の健康習慣質問
```typescript
const currentHabitsQuestions = [
  {
    id: 'current-habits',
    question: '現在の健康習慣で改善したいことはありますか？',
    followUp: 'その改善のために、どんなサポートがあれば良いですか？',
    category: 'action',
    options: [
      { value: 'exercise', label: '運動習慣', icon: '🏃‍♂️' },
      { value: 'diet', label: '食生活', icon: '🥗' },
      { value: 'sleep', label: '睡眠', icon: '😴' },
      { value: 'stress', label: 'ストレス管理', icon: '🧘' },
      { value: 'checkup', label: '健康診断', icon: '🏥' }
    ]
  },
  {
    id: 'support-system',
    question: '健康管理をサポートしてくれる人はいますか？',
    followUp: 'その人にどんなサポートをしてもらいたいですか？',
    category: 'support',
    options: [
      { value: 'family', label: '家族', icon: '👨‍👩‍👧‍👦' },
      { value: 'friends', label: '友人', icon: '👥' },
      { value: 'colleagues', label: '同僚', icon: '💼' },
      { value: 'professionals', label: '専門家', icon: '👨‍⚕️' },
      { value: 'none', label: 'いない', icon: '😔' }
    ]
  }
]
```

### 健康プラン生成

#### 1. パーソナライズされた健康プラン
```typescript
interface HealthPlan {
  id: string
  userId: string
  goals: HealthGoal[]
  actions: HealthAction[]
  timeline: HealthTimeline
  motivation: string
  createdAt: Date
}

interface HealthGoal {
  id: string
  title: string
  description: string
  category: string
  priority: 'high' | 'medium' | 'low'
  deadline: Date
}

interface HealthAction {
  id: string
  title: string
  description: string
  frequency: string
  duration: string
  difficulty: 'easy' | 'medium' | 'hard'
  relatedGoal: string
}

// 健康プラン生成関数
const generateHealthPlan = (answers: HealthAwarenessAnswers): HealthPlan => {
  const goals: HealthGoal[] = []
  const actions: HealthAction[] = []
  
  // 人生目標に基づく健康目標の設定
  if (answers.lifeGoals) {
    goals.push({
      id: generateId(),
      title: `${answers.lifeGoals}を叶えるための健康維持`,
      description: '人生目標を達成するために必要な健康状態を維持する',
      category: 'motivation',
      priority: 'high',
      deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1年後
    })
  }
  
  // 現在の習慣に基づく具体的なアクション
  if (answers.currentHabits) {
    const habitActions = getHabitActions(answers.currentHabits)
    actions.push(...habitActions)
  }
  
  return {
    id: generateId(),
    userId: answers.userId,
    goals,
    actions,
    timeline: generateTimeline(goals, actions),
    motivation: generateMotivation(answers),
    createdAt: new Date()
  }
}
```

#### 2. 進捗管理機能
```typescript
const useHealthProgress = () => {
  const progress = ref<HealthProgress>({
    completedActions: [],
    currentStreak: 0,
    totalActions: 0,
    motivationLevel: 0
  })
  
  const updateProgress = (actionId: string, completed: boolean) => {
    if (completed) {
      progress.value.completedActions.push(actionId)
      progress.value.currentStreak++
    } else {
      progress.value.currentStreak = 0
    }
    
    // モチベーションレベルの更新
    progress.value.motivationLevel = calculateMotivationLevel(progress.value)
  }
  
  const getMotivationalMessage = () => {
    const level = progress.value.motivationLevel
    if (level >= 80) return '素晴らしい！健康習慣が身についています！'
    if (level >= 60) return '順調です！継続が大切です。'
    if (level >= 40) return '少しずつでも続けることが大切です。'
    return '今日から始めましょう！小さな一歩が大きな変化につながります。'
  }
  
  return { progress, updateProgress, getMotivationalMessage }
}
```

### UI/UX設計

#### 健康意識向上インターフェース
```vue
<template>
  <div class="health-awareness">
    <div class="awareness-header">
      <h3>💭 健康について考えてみませんか？</h3>
      <p>いくつかの質問に答えることで、あなたに最適な健康プランを作成します</p>
    </div>
    
    <div v-if="currentQuestion < questions.length" class="question-section">
      <div class="question-card">
        <h4>{{ questions[currentQuestion].question }}</h4>
        
        <div class="options-grid">
          <button
            v-for="option in questions[currentQuestion].options"
            :key="option.value"
            @click="selectOption(option.value)"
            class="option-button"
          >
            <span class="option-icon">{{ option.icon }}</span>
            <span class="option-label">{{ option.label }}</span>
          </button>
        </div>
        
        <div v-if="showFollowUp" class="follow-up">
          <p>{{ questions[currentQuestion].followUp }}</p>
          <textarea v-model="followUpAnswer" placeholder="詳しく教えてください..."></textarea>
        </div>
        
        <div class="navigation">
          <button @click="previousQuestion" :disabled="currentQuestion === 0">
            前の質問
          </button>
          <button @click="nextQuestion" :disabled="!selectedOption">
            次の質問
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="plan-generation">
      <h4>🎯 あなたの健康プランを作成中...</h4>
      <div class="loading-spinner"></div>
      <p>回答内容を分析して、最適な健康プランを生成しています</p>
    </div>
  </div>
</template>
```

---

## 🔗 機能統合

### 1. ギフト選択フローの統合
```typescript
// メインのギフト選択フロー
const useGiftSelection = () => {
  const selectionMode = ref<'chat' | 'questionnaire'>('chat')
  const chatRecommendations = ref<GiftRecommendation[]>([])
  const questionnaireRecommendations = ref<GiftRecommendation[]>([])
  
  const switchToChat = () => {
    selectionMode.value = 'chat'
  }
  
  const switchToQuestionnaire = () => {
    selectionMode.value = 'questionnaire'
  }
  
  const getFinalRecommendations = () => {
    // チャットと質問形式の結果を統合
    return mergeRecommendations(chatRecommendations.value, questionnaireRecommendations.value)
  }
  
  return {
    selectionMode,
    chatRecommendations,
    questionnaireRecommendations,
    switchToChat,
    switchToQuestionnaire,
    getFinalRecommendations
  }
}
```

### 2. データベース設計の拡張
```sql
-- チャット履歴テーブル
CREATE TABLE chat_sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  session_type ENUM('gift_selection', 'health_awareness') NOT NULL,
  messages JSON NOT NULL,
  emotion_analysis JSON,
  gift_recommendations JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 健康意識向上回答テーブル
CREATE TABLE health_awareness_answers (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  question_id VARCHAR(50) NOT NULL,
  answer_value VARCHAR(100) NOT NULL,
  follow_up_answer TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 健康プランテーブル
CREATE TABLE health_plans (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  goals JSON NOT NULL,
  actions JSON NOT NULL,
  timeline JSON NOT NULL,
  motivation TEXT NOT NULL,
  progress JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 📊 成功指標

### 1. AI相談機能
- **ユーザー満足度**: フリーチャット機能の満足度80%以上
- **感情分析精度**: 感情分析の精度85%以上
- **ギフト選択精度**: 推薦ギフトの選択率70%以上
- **会話継続率**: 平均会話ターン数5回以上

### 2. 健康意識向上機能
- **回答完了率**: 質問セットの完了率90%以上
- **健康プラン作成率**: 健康プランの作成率80%以上
- **行動変容率**: 健康行動の実践率60%以上
- **継続率**: 健康プランの継続率50%以上

### 3. 統合効果
- **ユーザーエンゲージメント**: 平均セッション時間の20%向上
- **ギフト満足度**: 受取人の満足度85%以上
- **健康意識向上**: 健康意識スコアの30%向上

---

## 🚀 実装スケジュール

### Phase 1: 基盤実装（1週間）
- チャットインターフェースの基本実装
- 感情分析機能の統合
- 質問セットの実装

### Phase 2: AI機能強化（1週間）
- 感情ベースのギフト推薦ロジック
- 健康プラン生成機能
- 進捗管理機能

### Phase 3: UI/UX改善（1週間）
- チャットインターフェースの改善
- 健康意識向上UIの実装
- レスポンシブデザイン対応

### Phase 4: テスト・最適化（1週間）
- 機能テスト
- パフォーマンス最適化
- ユーザビリティテスト

---

**作成日**: 2025年8月13日  
**更新予定**: 実装進捗に応じて更新  
**ステータス**: 設計完了、実装準備中 🚀 