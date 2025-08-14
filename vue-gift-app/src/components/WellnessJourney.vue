<template>
  <div class="wellness-journey">
    <!-- ヘッダー -->
    <div class="journey-header">
      <h2>🌟 ウェルネス・ジャーニー</h2>
      <p>あなたの未来について、少しだけ考えてみませんか？</p>
    </div>

    <!-- 開始画面 -->
    <div v-if="!isStarted" class="start-screen">
      <div class="welcome-message">
        <div class="concierge-avatar">
          <span class="avatar-icon">👩‍⚕️</span>
        </div>
        <div class="message-bubble">
          <p>こんにちは！私はあなたのウェルネス・コンシェルジュです。</p>
          <p>この機会に、ご自身の未来について少しだけ考えてみませんか？</p>
          <p>短い質問に答えていただくだけで、あなただけの特別なメッセージが完成します。</p>
        </div>
      </div>
      
      <BaseButton 
        @click="startJourney" 
        class="start-button"
        size="large"
      >
        ジャーニーを始める
      </BaseButton>
    </div>

    <!-- 質問画面 -->
    <div v-else-if="!isCompleted" class="question-screen">
      <!-- 進捗バー -->
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
        <span class="progress-text">{{ currentQuestionIndex + 1 }} / {{ questions.length }}</span>
      </div>

      <!-- 現在の質問 -->
      <div class="current-question">
        <div class="question-header">
          <h3>{{ currentQuestion.category }}</h3>
          <p>{{ currentQuestion.text }}</p>
        </div>

        <!-- 回答入力 -->
        <div class="answer-input">
          <BaseInput
            v-model="currentAnswer"
            :placeholder="currentQuestion.placeholder || 'あなたの想いを自由にお書きください'"
            type="textarea"
            rows="4"
            class="answer-textarea"
          />
          
          <div class="answer-actions">
            <BaseButton 
              @click="skipQuestion" 
              variant="outline"
              size="small"
            >
              スキップ
            </BaseButton>
            <BaseButton 
              @click="submitAnswer" 
              :disabled="!currentAnswer.trim()"
              size="small"
            >
              回答する
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- 回答履歴 -->
      <div v-if="answers.length > 0" class="answers-history">
        <h4>これまでの回答</h4>
        <div class="answer-cards">
          <div 
            v-for="(answer, index) in answers" 
            :key="index"
            class="answer-card"
          >
            <div class="answer-header">
              <span class="question-category">{{ answer.category }}</span>
              <span class="answer-number">Q{{ index + 1 }}</span>
            </div>
            <p class="answer-text">{{ answer.text }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 完了画面 -->
    <div v-else class="completion-screen">
      <div class="completion-header">
        <h3>🎉 ウェルネス・ジャーニー完了！</h3>
        <p>あなたの特別なメッセージが完成しました</p>
      </div>

      <!-- ウェルネス・サマリー -->
      <div class="wellness-summary">
        <div class="summary-header">
          <h4>あなたのウェルネス宣言</h4>
        </div>
        <div class="summary-content">
          <p class="summary-text">{{ wellnessSummary }}</p>
        </div>
        
        <!-- キーワード -->
        <div class="summary-keywords">
          <h5>キーワード</h5>
          <div class="keyword-tags">
            <span 
              v-for="keyword in summaryKeywords" 
              :key="keyword"
              class="keyword-tag"
            >
              {{ keyword }}
            </span>
          </div>
        </div>
      </div>

      <!-- アクション -->
      <div class="completion-actions">
        <BaseButton 
          @click="downloadSummary" 
          variant="outline"
          class="action-button"
        >
          📱 壁紙として保存
        </BaseButton>
        <BaseButton 
          @click="shareWithGifter" 
          class="action-button"
        >
          💝 GIFTERに感謝を伝える
        </BaseButton>
        <BaseButton 
          @click="restartJourney" 
          variant="outline"
          class="action-button"
        >
          🔄 もう一度始める
        </BaseButton>
      </div>
    </div>

    <!-- ローディング -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>あなたのメッセージを作成中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getLLMService } from '@/services/llm'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

// 状態管理
const isStarted = ref(false)
const isCompleted = ref(false)
const isLoading = ref(false)
const currentQuestionIndex = ref(0)
const currentAnswer = ref('')
const answers = ref<Array<{
  category: string
  text: string
  question: string
}>>([])
const wellnessSummary = ref('')
const summaryKeywords = ref<string[]>([])

// 質問リスト
const questions = [
  {
    category: '未来と夢',
    text: 'もし時間もお金も自由なら、一番やってみたいことは何ですか？',
    placeholder: '例：世界一周旅行、家族と過ごす時間、新しいスキルの習得など'
  },
  {
    category: '大切な人',
    text: 'あなたが「この人の笑顔をずっと見ていたい」と思うのは誰ですか？',
    placeholder: '例：家族、友人、パートナーなど'
  },
  {
    category: '過去と現在',
    text: 'これまでの人生で、一番「頑張った！」と自分を褒めてあげたいことは何ですか？',
    placeholder: '例：仕事での成果、子育て、目標達成など'
  },
  {
    category: '健康への接続',
    text: '先ほどの夢を叶えるために、10年後、どんな健康状態でいたいですか？',
    placeholder: '例：元気に歩ける、家族と旅行できる、趣味を楽しめるなど'
  },
  {
    category: '行動への一歩',
    text: 'その未来のために、今すぐ始められる小さな一歩は何だと思いますか？',
    placeholder: '例：毎日10分歩く、食事を見直す、ストレス解消法を見つけるなど'
  }
]

// 計算プロパティ
const currentQuestion = computed(() => questions[currentQuestionIndex.value])
const progressPercentage = computed(() => 
  ((currentQuestionIndex.value + 1) / questions.length) * 100
)

// ジャーニー開始
const startJourney = () => {
  isStarted.value = true
  currentQuestionIndex.value = 0
  currentAnswer.value = ''
  answers.value = []
}

// 回答送信
const submitAnswer = async () => {
  if (!currentAnswer.value.trim()) return

  // 回答を記録
  answers.value.push({
    category: currentQuestion.value.category,
    text: currentAnswer.value.trim(),
    question: currentQuestion.value.text
  })

  // 次の質問へ
  if (currentQuestionIndex.value < questions.length - 1) {
    currentQuestionIndex.value++
    currentAnswer.value = ''
  } else {
    // 全ての質問完了
    await generateWellnessSummary()
  }
}

// 質問スキップ
const skipQuestion = () => {
  if (currentQuestionIndex.value < questions.length - 1) {
    currentQuestionIndex.value++
    currentAnswer.value = ''
  }
}

// ウェルネス・サマリー生成
const generateWellnessSummary = async () => {
  try {
    isLoading.value = true
    
    const llmService = getLLMService()
    
    // 全ての回答をまとめたプロンプト
    const prompt = `
以下のユーザーの回答に基づいて、個人的で温かみのある「ウェルネス宣言」を作成してください。

ユーザーの回答:
${answers.value.map((answer, index) => 
  `${index + 1}. ${answer.category}: ${answer.text}`
).join('\n')}

以下の形式で回答してください：
1. ユーザーの夢や想いを反映した、個人的で温かみのあるメッセージ（100-150文字程度）
2. そのメッセージから抽出できる3-5個のキーワード

JSON形式で回答してください：
{
  "summary": "メッセージ内容",
  "keywords": ["キーワード1", "キーワード2", "キーワード3"]
}

ポジティブで希望に満ちた、ユーザーが自分の人生を大切に思えるようなメッセージにしてください。
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
      wellnessSummary.value = data.summary || 'あなたの未来への想いが込められた特別なメッセージです。'
      summaryKeywords.value = data.keywords || ['未来', '夢', '健康']
      
      isCompleted.value = true
    } catch (parseError) {
      console.warn('Wellness summary JSON parse error:', parseError)
      // フォールバック
      wellnessSummary.value = 'あなたの未来への想いが込められた特別なメッセージです。'
      summaryKeywords.value = ['未来', '夢', '健康']
      isCompleted.value = true
    }
  } catch (error) {
    console.error('Wellness summary generation error:', error)
    // エラー時のフォールバック
    wellnessSummary.value = 'あなたの未来への想いが込められた特別なメッセージです。'
    summaryKeywords.value = ['未来', '夢', '健康']
    isCompleted.value = true
  } finally {
    isLoading.value = false
  }
}

// サマリーを壁紙として保存
const downloadSummary = () => {
  // 実際の実装では、画像生成APIを使用して壁紙を作成
  alert('壁紙の保存機能は現在開発中です。')
}

// GIFTERに感謝を伝える
const shareWithGifter = () => {
  // 実際の実装では、GIFTERへの通知機能を実装
  alert('GIFTERへの感謝メッセージ機能は現在開発中です。')
}

// ジャーニーを再開
const restartJourney = () => {
  isStarted.value = false
  isCompleted.value = false
  currentQuestionIndex.value = 0
  currentAnswer.value = ''
  answers.value = []
  wellnessSummary.value = ''
  summaryKeywords.value = []
}

onMounted(() => {
  console.log('Wellness Journey component mounted')
})
</script>

<style scoped>
.wellness-journey {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.journey-header {
  text-align: center;
  margin-bottom: 3rem;
  color: #2c3e50;
}

.journey-header h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.journey-header p {
  font-size: 1.2rem;
  color: #7f8c8d;
}

/* 開始画面 */
.start-screen {
  text-align: center;
}

.welcome-message {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.concierge-avatar {
  flex-shrink: 0;
}

.avatar-icon {
  font-size: 3rem;
}

.message-bubble {
  text-align: left;
  flex: 1;
}

.message-bubble p {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: #2c3e50;
}

.start-button {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 1.2rem;
  padding: 1rem 3rem;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
}

/* 質問画面 */
.question-screen {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  position: relative;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  margin-bottom: 2rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: -25px;
  right: 0;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.current-question {
  margin-bottom: 3rem;
}

.question-header h3 {
  color: #667eea;
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.question-header p {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.answer-input {
  margin-bottom: 2rem;
}

.answer-textarea {
  margin-bottom: 1rem;
}

.answer-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* 回答履歴 */
.answers-history {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 1.5rem;
}

.answers-history h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.answer-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.answer-card {
  background: white;
  border-radius: 10px;
  padding: 1rem;
  border-left: 4px solid #667eea;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.question-category {
  background: #667eea;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
}

.answer-number {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.answer-text {
  color: #2c3e50;
  line-height: 1.5;
}

/* 完了画面 */
.completion-screen {
  text-align: center;
}

.completion-header {
  margin-bottom: 3rem;
}

.completion-header h3 {
  color: #27ae60;
  font-size: 2rem;
  margin-bottom: 1rem;
}

.completion-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.wellness-summary {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.summary-header h4 {
  color: #667eea;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.summary-content {
  margin-bottom: 2rem;
}

.summary-text {
  font-size: 1.2rem;
  line-height: 1.8;
  color: #2c3e50;
  font-style: italic;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.summary-keywords h5 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.keyword-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.keyword-tag {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.completion-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.action-button {
  min-width: 250px;
}

/* ローディング */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #ecf0f1;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
  .wellness-journey {
    padding: 1rem;
    border-radius: 0;
  }
  
  .journey-header h2 {
    font-size: 2rem;
  }
  
  .welcome-message {
    flex-direction: column;
    text-align: center;
  }
  
  .answer-actions {
    flex-direction: column;
  }
  
  .completion-actions {
    gap: 0.5rem;
  }
  
  .action-button {
    min-width: 200px;
  }
}
</style> 