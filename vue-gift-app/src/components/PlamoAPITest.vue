<template>
  <div class="plamo-test">
    <BaseCard class="test-card">
      <h2>Plamo API 接続テスト</h2>
      
      <!-- API設定確認 -->
      <div class="config-section">
        <h3>設定確認</h3>
        <div class="config-item">
          <strong>API Key:</strong> 
          <span :class="{ 'valid': hasApiKey, 'invalid': !hasApiKey }">
            {{ hasApiKey ? '設定済み' : '未設定' }}
          </span>
        </div>
        <div class="config-item">
          <strong>Base URL:</strong> 
          <span class="valid">{{ baseUrl }}</span>
        </div>
        <div class="config-item">
          <strong>Model:</strong> 
          <span class="valid">{{ model }}</span>
        </div>
      </div>

      <!-- 接続テスト -->
      <div class="test-section">
        <h3>接続テスト</h3>
        <BaseButton 
          @click="testConnection" 
          :loading="isTesting"
          :disabled="!hasApiKey"
        >
          {{ isTesting ? 'テスト中...' : '接続テスト実行' }}
        </BaseButton>
        
        <div v-if="testResult" class="test-result">
          <h4>テスト結果:</h4>
          <div class="result-item">
            <strong>ステータス:</strong> 
            <span :class="testResult.success ? 'success' : 'error'">
              {{ testResult.success ? '成功' : '失敗' }}
            </span>
          </div>
          <div v-if="testResult.error" class="result-item">
            <strong>エラー:</strong> 
            <span class="error">{{ testResult.error }}</span>
          </div>
          <div v-if="testResult.response" class="result-item">
            <strong>レスポンス:</strong>
            <pre class="response-text">{{ testResult.response }}</pre>
          </div>
        </div>
      </div>

      <!-- 感情分析テスト -->
      <div class="emotion-test-section">
        <h3>感情分析テスト</h3>
        <BaseInput
          v-model="emotionTestText"
          placeholder="感情分析したいテキストを入力してください"
          type="textarea"
          rows="3"
        />
        <BaseButton 
          @click="testEmotionAnalysis" 
          :loading="isAnalyzing"
          :disabled="!emotionTestText.trim()"
          class="mt-2"
        >
          {{ isAnalyzing ? '分析中...' : '感情分析実行' }}
        </BaseButton>
        
        <div v-if="emotionResult" class="emotion-result">
          <h4>感情分析結果:</h4>
          <div class="result-item">
            <strong>感情:</strong> 
            <span class="emotion-tag" :class="emotionResult.emotion">
              {{ getEmotionLabel(emotionResult.emotion) }}
            </span>
          </div>
          <div class="result-item">
            <strong>信頼度:</strong> 
            <span>{{ (emotionResult.confidence * 100).toFixed(1) }}%</span>
          </div>
          <div class="result-item">
            <strong>キーフレーズ:</strong>
            <div class="key-phrases">
              <span 
                v-for="phrase in emotionResult.keyPhrases" 
                :key="phrase"
                class="phrase-tag"
              >
                {{ phrase }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getLLMService } from '@/services/llm'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import type { EmotionAnalysis } from '@/types'

// 設定情報
const baseUrl = import.meta.env.VITE_PLAMO_BASE_URL || '未設定'
const model = import.meta.env.VITE_PLAMO_MODEL || '未設定'
const hasApiKey = computed(() => !!import.meta.env.VITE_PLAMO_API_KEY)

// 接続テスト
const isTesting = ref(false)
const testResult = ref<{
  success: boolean
  error?: string
  response?: string
} | null>(null)

const testConnection = async () => {
  isTesting.value = true
  testResult.value = null
  
  try {
    console.log('Starting Plamo API connection test...')
    const llmService = getLLMService()
    
    const response = await llmService.generateResponse(
      'こんにちは！健康ギフトの相談をしたいのですが、どのようなギフトがありますか？'
    )
    
    console.log('Plamo API test successful:', response)
    testResult.value = {
      success: true,
      response: response.text
    }
  } catch (error) {
    console.error('Plamo API test error:', error)
    
    let errorMessage = '不明なエラー'
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }
    
    testResult.value = {
      success: false,
      error: errorMessage
    }
  } finally {
    isTesting.value = false
  }
}

// 感情分析テスト
const emotionTestText = ref('')
const isAnalyzing = ref(false)
const emotionResult = ref<EmotionAnalysis | null>(null)

const testEmotionAnalysis = async () => {
  if (!emotionTestText.value.trim()) return
  
  isAnalyzing.value = true
  emotionResult.value = null
  
  try {
    const llmService = getLLMService()
    const result = await llmService.analyzeEmotion(emotionTestText.value)
    emotionResult.value = result
  } catch (error) {
    console.error('Emotion analysis test error:', error)
    // エラーハンドリング
  } finally {
    isAnalyzing.value = false
  }
}

// 感情ラベルの取得
const getEmotionLabel = (emotion: string) => {
  const labels = {
    positive: 'ポジティブ',
    negative: 'ネガティブ',
    neutral: 'ニュートラル',
    concerned: '心配'
  }
  return labels[emotion as keyof typeof labels] || emotion
}

onMounted(() => {
  console.log('Plamo API Test Component mounted')
  console.log('API Key configured:', hasApiKey.value)
  console.log('Base URL:', baseUrl)
  console.log('Model:', model)
})
</script>

<style scoped>
.plamo-test {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.test-card {
  margin-bottom: 20px;
}

.config-section,
.test-section,
.emotion-test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background: var(--color-background-soft);
}

.config-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.valid {
  color: var(--color-success);
  font-weight: 500;
}

.invalid {
  color: var(--color-error);
  font-weight: 500;
}

.test-result,
.emotion-result {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background: var(--color-background);
}

.result-item {
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.result-item strong {
  min-width: 80px;
}

.success {
  color: var(--color-success);
  font-weight: 500;
}

.error {
  color: var(--color-error);
  font-weight: 500;
}

.response-text {
  background: var(--color-background-mute);
  padding: 10px;
  border-radius: var(--border-radius);
  font-size: 0.9em;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}

.emotion-tag {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
}

.emotion-tag.positive {
  background: var(--color-success);
  color: white;
}

.emotion-tag.negative {
  background: var(--color-error);
  color: white;
}

.emotion-tag.neutral {
  background: var(--color-text-muted);
  color: white;
}

.emotion-tag.concerned {
  background: var(--color-warning);
  color: white;
}

.key-phrases {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.phrase-tag {
  background: var(--color-primary);
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.8em;
}

.mt-2 {
  margin-top: 8px;
}
</style> 