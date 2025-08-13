<template>
  <div class="health-awareness">
    <div class="awareness-header">
      <h3>💭 健康について考えてみませんか？</h3>
      <p>いくつかの質問に答えることで、あなたに最適な健康プランを作成します</p>
    </div>
    
    <!-- 質問セクション -->
    <div v-if="!isComplete && !isGeneratingPlan" class="question-section">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
        <span class="progress-text">{{ progressPercentage }}% 完了</span>
      </div>
      
      <div class="question-card">
        <h4 class="question-title">{{ currentQuestionData.question }}</h4>
        
        <div class="options-grid">
          <button
            v-for="option in currentQuestionData.options"
            :key="option.value"
            @click="selectOption(option.value)"
            :class="['option-button', { 'selected': selectedOption === option.value }]"
            :aria-label="option.label"
          >
            <span class="option-icon">{{ option.icon }}</span>
            <span class="option-label">{{ option.label }}</span>
          </button>
        </div>
        
        <!-- フォローアップ質問 -->
        <div v-if="showFollowUp" class="follow-up">
          <p class="follow-up-question">{{ currentQuestionData.followUp }}</p>
          <textarea 
            v-model="followUpAnswer" 
            placeholder="詳しく教えてください..."
            class="follow-up-input"
            rows="3"
            aria-label="追加の回答"
          ></textarea>
        </div>
        
        <!-- ナビゲーションボタン -->
        <div class="navigation">
          <button 
            @click="previousQuestion" 
            :disabled="currentQuestion === 0"
            class="nav-button secondary"
            aria-label="前の質問に戻る"
          >
            ← 前の質問
          </button>
          <button 
            @click="nextQuestion" 
            :disabled="!selectedOption"
            class="nav-button primary large-button"
            aria-label="次の質問に進む"
          >
            {{ currentQuestion === healthAwarenessQuestions.length - 1 ? '健康プランを作成' : '次の質問' }} →
          </button>
        </div>
      </div>
    </div>
    
    <!-- プラン生成中 -->
    <div v-if="isGeneratingPlan" class="plan-generation">
      <div class="loading-container">
        <h4>🎯 あなたの健康プランを作成中...</h4>
        <div class="loading-spinner"></div>
        <p>回答内容を分析して、最適な健康プランを生成しています</p>
      </div>
    </div>
    
    <!-- 健康プラン表示 -->
    <div v-if="healthPlan && !isGeneratingPlan" class="health-plan">
      <div class="plan-header">
        <h4>🎯 あなたのパーソナライズ健康プラン</h4>
        <p class="motivation-text">{{ healthPlan.motivation }}</p>
      </div>
      
      <!-- 進捗サマリー -->
      <div class="progress-summary">
        <div class="progress-item">
          <span class="progress-label">モチベーション</span>
          <div class="progress-bar-small">
            <div class="progress-fill-small" :style="{ width: `${progress.motivationLevel}%` }"></div>
          </div>
          <span class="progress-value">{{ progress.motivationLevel }}%</span>
        </div>
        <div class="progress-item">
          <span class="progress-label">継続日数</span>
          <span class="progress-value">{{ progress.currentStreak }}日</span>
        </div>
        <div class="progress-item">
          <span class="progress-label">完了アクション</span>
          <span class="progress-value">{{ progress.completedActions.length }}/{{ progress.totalActions }}</span>
        </div>
      </div>
      
      <!-- モチベーションメッセージ -->
      <div class="motivation-message">
        <p>{{ getMotivationalMessage() }}</p>
      </div>
      
      <!-- 健康目標 -->
      <div v-if="healthPlan.goals.length > 0" class="goals-section">
        <h5>🎯 健康目標</h5>
        <div class="goals-grid">
          <div 
            v-for="goal in healthPlan.goals" 
            :key="goal.id"
            class="goal-card"
          >
            <h6>{{ goal.title }}</h6>
            <p>{{ goal.description }}</p>
            <div class="goal-meta">
              <span class="priority" :class="goal.priority">{{ goal.priority }}</span>
              <span class="deadline">期限: {{ formatDate(goal.deadline) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 健康アクション -->
      <div v-if="healthPlan.actions.length > 0" class="actions-section">
        <h5>📋 健康アクション</h5>
        <div class="actions-grid">
          <div 
            v-for="action in healthPlan.actions" 
            :key="action.id"
            :class="['action-card', { 'completed': progress.completedActions.includes(action.id) }]"
          >
            <div class="action-header">
              <h6>{{ action.title }}</h6>
              <button 
                @click="updateProgress(action.id, !progress.completedActions.includes(action.id))"
                :class="['complete-button', { 'completed': progress.completedActions.includes(action.id) }]"
                :aria-label="progress.completedActions.includes(action.id) ? '完了を取り消す' : '完了にする'"
              >
                {{ progress.completedActions.includes(action.id) ? '✓' : '○' }}
              </button>
            </div>
            <p>{{ action.description }}</p>
            <div class="action-meta">
              <span class="frequency">{{ action.frequency }}</span>
              <span class="duration">{{ action.duration }}</span>
              <span class="difficulty" :class="action.difficulty">{{ action.difficulty }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- タイムライン -->
      <div class="timeline-section">
        <h5>📅 実践タイムライン</h5>
        <div class="timeline">
          <div class="timeline-item">
            <h6>短期（1-2週間）</h6>
            <ul>
              <li v-for="action in healthPlan.timeline.shortTerm" :key="action.id">
                {{ action.title }}
              </li>
            </ul>
          </div>
          <div class="timeline-item">
            <h6>中期（1-3ヶ月）</h6>
            <ul>
              <li v-for="action in healthPlan.timeline.mediumTerm" :key="action.id">
                {{ action.title }}
              </li>
            </ul>
          </div>
          <div class="timeline-item">
            <h6>長期（1年）</h6>
            <ul>
              <li v-for="goal in healthPlan.timeline.longTerm" :key="goal.id">
                {{ goal.title }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- アクションボタン -->
      <div class="action-buttons">
        <button @click="restartQuestionnaire" class="action-button secondary">
          🔄 質問に戻る
        </button>
        <button @click="sharePlan" class="action-button primary">
          📤 プランを共有
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useHealthAwareness, healthAwarenessQuestions } from '@/composables/useHealthAwareness'
import { useAccessibility } from '@/composables/useAccessibility'

const {
  currentQuestion,
  answers,
  showFollowUp,
  followUpAnswer,
  selectedOption,
  isGeneratingPlan,
  healthPlan,
  progress,
  currentQuestionData,
  progressPercentage,
  isComplete,
  selectOption,
  nextQuestion,
  previousQuestion,
  generateHealthPlan,
  updateProgress,
  getMotivationalMessage,
  initialize
} = useHealthAwareness()

const { speak } = useAccessibility()

// 質問に戻る
const restartQuestionnaire = () => {
  currentQuestion.value = 0
  speak('質問に戻りました')
}

// プランを共有
const sharePlan = () => {
  if (navigator.share) {
    navigator.share({
      title: '私の健康プラン',
      text: `健康プランを作成しました！モチベーション: ${progress.value.motivationLevel}%`,
      url: window.location.href
    })
  } else {
    // フォールバック: クリップボードにコピー
    const text = `健康プランを作成しました！\nモチベーション: ${progress.value.motivationLevel}%\n完了アクション: ${progress.value.completedActions.length}/${progress.value.totalActions}`
    navigator.clipboard.writeText(text)
    speak('プランをクリップボードにコピーしました')
  }
}

// 日付フォーマット
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 音声ガイド
const handleSelectOption = (value: string) => {
  selectOption(value)
  const option = currentQuestionData.value.options.find(opt => opt.value === value)
  if (option) {
    speak(`${option.label}を選択しました`)
  }
}

// 初期化
onMounted(() => {
  initialize()
  speak('健康意識向上機能を開始しました。質問に答えて、あなたに最適な健康プランを作成しましょう。')
})
</script>

<style scoped>
.health-awareness {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.awareness-header {
  text-align: center;
  margin-bottom: 32px;
}

.awareness-header h3 {
  margin: 0 0 12px 0;
  font-size: var(--font-size-large);
  color: var(--color-text-primary);
}

.awareness-header p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-background-secondary);
  border-radius: 4px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--font-size-small);
  color: var(--color-text-primary);
  font-weight: 600;
}

.question-card {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
}

.question-title {
  margin: 0 0 24px 0;
  font-size: var(--font-size-large);
  color: var(--color-text-primary);
  text-align: center;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.option-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 2px solid var(--color-border);
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.option-button:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.option-button.selected {
  border-color: var(--color-primary);
  background: var(--color-orange-light);
}

.option-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.option-label {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  font-weight: 500;
}

.follow-up {
  margin-bottom: 24px;
  padding: 20px;
  background: var(--color-background-secondary);
  border-radius: 8px;
}

.follow-up-question {
  margin: 0 0 16px 0;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  font-weight: 500;
}

.follow-up-input {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--color-border);
  border-radius: 6px;
  font-family: inherit;
  font-size: var(--font-size-base);
  resize: vertical;
  transition: border-color 0.2s ease;
}

.follow-up-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.navigation {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.nav-button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: 600;
  transition: all 0.2s ease;
}

.nav-button.primary {
  background: var(--color-primary);
  color: white;
}

.nav-button.primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.nav-button.secondary {
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.nav-button.secondary:hover:not(:disabled) {
  background: var(--color-gray-light);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.plan-generation {
  text-align: center;
  padding: 60px 20px;
}

.loading-container h4 {
  margin: 0 0 24px 0;
  font-size: var(--font-size-large);
  color: var(--color-text-primary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.health-plan {
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.plan-header {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  padding: 32px;
  text-align: center;
}

.plan-header h4 {
  margin: 0 0 16px 0;
  font-size: var(--font-size-large);
}

.motivation-text {
  margin: 0;
  font-size: var(--font-size-base);
  opacity: 0.9;
  line-height: 1.6;
}

.progress-summary {
  padding: 24px;
  background: var(--color-background-secondary);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.progress-label {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.progress-bar-small {
  width: 100%;
  height: 6px;
  background: var(--color-border);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill-small {
  height: 100%;
  background: var(--color-primary);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-value {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
}

.motivation-message {
  padding: 20px;
  background: var(--color-orange-light);
  border-left: 4px solid var(--color-orange);
  margin: 20px;
  border-radius: 0 8px 8px 0;
}

.motivation-message p {
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  font-weight: 500;
}

.goals-section,
.actions-section,
.timeline-section {
  padding: 24px;
  border-bottom: 1px solid var(--color-border);
}

.goals-section h5,
.actions-section h5,
.timeline-section h5 {
  margin: 0 0 20px 0;
  font-size: var(--font-size-large);
  color: var(--color-text-primary);
}

.goals-grid,
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.goal-card,
.action-card {
  background: var(--color-background-secondary);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.action-card.completed {
  background: var(--color-success);
  color: white;
}

.action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.action-header h6 {
  margin: 0;
  font-size: var(--font-size-base);
  color: inherit;
}

.complete-button {
  width: 32px;
  height: 32px;
  border: 2px solid var(--color-primary);
  background: white;
  color: var(--color-primary);
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.2s ease;
}

.complete-button.completed {
  background: var(--color-primary);
  color: white;
}

.complete-button:hover {
  transform: scale(1.1);
}

.goal-card h6,
.action-card h6 {
  margin: 0 0 8px 0;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.goal-card p,
.action-card p {
  margin: 0 0 12px 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.goal-meta,
.action-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.priority,
.frequency,
.duration,
.difficulty {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: var(--font-size-small);
  font-weight: 500;
}

.priority.high,
.difficulty.hard {
  background: var(--color-danger);
  color: white;
}

.priority.medium,
.difficulty.medium {
  background: var(--color-warning);
  color: white;
}

.priority.low,
.difficulty.easy {
  background: var(--color-success);
  color: white;
}

.frequency,
.duration {
  background: var(--color-info);
  color: white;
}

.deadline {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.timeline {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.timeline-item {
  background: var(--color-background-secondary);
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
}

.timeline-item h6 {
  margin: 0 0 12px 0;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.timeline-item ul {
  margin: 0;
  padding-left: 20px;
}

.timeline-item li {
  margin-bottom: 8px;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.action-buttons {
  padding: 24px;
  display: flex;
  gap: 16px;
  justify-content: center;
}

.action-button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: 600;
  transition: all 0.2s ease;
}

.action-button.primary {
  background: var(--color-primary);
  color: white;
}

.action-button.primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.action-button.secondary {
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.action-button.secondary:hover {
  background: var(--color-gray-light);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .health-awareness {
    padding: 16px;
  }
  
  .question-card {
    padding: 20px;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .navigation {
    flex-direction: column;
  }
  
  .progress-summary {
    grid-template-columns: 1fr;
  }
  
  .goals-grid,
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .timeline {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}

/* アクセシビリティ対応 */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
  }
  
  .nav-button:hover,
  .action-button:hover {
    transform: none;
  }
}

/* ハイコントラストモード */
.high-contrast .question-card,
.high-contrast .health-plan {
  border: 2px solid var(--color-text-primary);
}

.high-contrast .option-button {
  border: 2px solid var(--color-text-primary);
}

.high-contrast .option-button.selected {
  border: 3px solid var(--color-primary);
}
</style> 