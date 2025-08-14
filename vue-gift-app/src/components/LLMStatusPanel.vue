<template>
  <div class="llm-status-panel" v-if="showPanel">
    <div class="status-header">
      <h4>🤖 AIシステム状態</h4>
      <BaseButton
        @click="togglePanel"
        variant="ghost"
        size="sm"
        aria-label="パネルを閉じる"
        class="close-button"
      >
        ✕
      </BaseButton>
    </div>
    
    <div class="status-content">
      <!-- プライマリLLM状態 -->
      <div class="status-item">
        <div class="status-label">
          <span class="status-icon" :class="statusIconClass">
            {{ statusIcon }}
          </span>
          Plamo API（国産AI）
        </div>
        <div class="status-details">
          <span class="status-text" :class="statusTextClass">
            {{ statusText }}
          </span>
          <span v-if="status.errorCount > 0" class="error-count">
            エラー: {{ status.errorCount }}/{{ maxErrors }}
          </span>
        </div>
      </div>
      
      <!-- フォールバックLLM状態 -->
      <div class="status-item">
        <div class="status-label">
          <span class="status-icon">🔄</span>
          Amazon Bedrock（フォールバック）
        </div>
        <div class="status-details">
          <span class="status-text" :class="{ 'text-success': !status.usingFallback, 'text-warning': status.usingFallback }">
            {{ status.usingFallback ? '使用中' : '待機中' }}
          </span>
        </div>
      </div>
      
      <!-- 統計情報 -->
      <div class="stats-section">
        <h5>📊 使用統計</h5>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">総リクエスト数</span>
            <span class="stat-value">{{ stats.totalRequests }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">成功率</span>
            <span class="stat-value">{{ successRate }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">平均応答時間</span>
            <span class="stat-value">{{ averageResponseTime }}ms</span>
          </div>
        </div>
      </div>
      
      <!-- アクション -->
      <div class="actions-section">
        <BaseButton
          @click="resetPrimaryLLM"
          variant="outline"
          size="sm"
          :disabled="status.primaryAvailable && status.errorCount === 0"
          class="reset-button"
        >
          🔄 プライマリLLMをリセット
        </BaseButton>
        
        <BaseButton
          @click="testLLM"
          variant="primary"
          size="sm"
          :loading="isTesting"
          class="test-button"
        >
          🧪 接続テスト
        </BaseButton>
      </div>
    </div>
  </div>
  
  <!-- トグルボタン -->
  <BaseButton
    @click="togglePanel"
    variant="outline"
    size="sm"
    class="toggle-button"
    :aria-label="showPanel ? 'AIシステム状態パネルを閉じる' : 'AIシステム状態パネルを開く'"
  >
    🤖 {{ showPanel ? '閉じる' : 'AI状態' }}
  </BaseButton>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getLLMService } from '@/services/llm'
import BaseButton from '@/components/ui/BaseButton.vue'

const showPanel = ref(false)
const isTesting = ref(false)
const maxErrors = 3

// 統計情報
const stats = ref({
  totalRequests: 0,
  successfulRequests: 0,
  totalResponseTime: 0
})

// LLMサービスを取得
const llmService = getLLMService()

// 状態を取得
const status = computed(() => llmService.getStatus())

// 状態アイコン
const statusIcon = computed(() => {
  if (status.value.primaryAvailable && status.value.errorCount === 0) {
    return '✅'
  } else if (status.value.primaryAvailable && status.value.errorCount < maxErrors) {
    return '⚠️'
  } else {
    return '❌'
  }
})

const statusIconClass = computed(() => {
  if (status.value.primaryAvailable && status.value.errorCount === 0) {
    return 'text-success'
  } else if (status.value.primaryAvailable && status.value.errorCount < maxErrors) {
    return 'text-warning'
  } else {
    return 'text-danger'
  }
})

// 状態テキスト
const statusText = computed(() => {
  if (status.value.primaryAvailable && status.value.errorCount === 0) {
    return '正常'
  } else if (status.value.primaryAvailable && status.value.errorCount < maxErrors) {
    return `警告 (${status.value.errorCount}エラー)`
  } else {
    return '無効'
  }
})

const statusTextClass = computed(() => {
  if (status.value.primaryAvailable && status.value.errorCount === 0) {
    return 'text-success'
  } else if (status.value.primaryAvailable && status.value.errorCount < maxErrors) {
    return 'text-warning'
  } else {
    return 'text-danger'
  }
})

// 成功率
const successRate = computed(() => {
  if (stats.value.totalRequests === 0) return 100
  return Math.round((stats.value.successfulRequests / stats.value.totalRequests) * 100)
})

// 平均応答時間
const averageResponseTime = computed(() => {
  if (stats.value.totalRequests === 0) return 0
  return Math.round(stats.value.totalResponseTime / stats.value.totalRequests)
})

// パネル切り替え
const togglePanel = () => {
  showPanel.value = !showPanel.value
}

// プライマリLLMリセット
const resetPrimaryLLM = () => {
  llmService.resetPrimaryLLM()
  console.log('Primary LLM reset successfully')
}

// LLM接続テスト
const testLLM = async () => {
  isTesting.value = true
  
  try {
    const startTime = Date.now()
    const response = await llmService.generateResponse('こんにちは')
    const responseTime = Date.now() - startTime
    
    // 統計を更新
    stats.value.totalRequests++
    stats.value.successfulRequests++
    stats.value.totalResponseTime += responseTime
    
    console.log('LLM test successful:', response)
    alert('✅ LLM接続テストが成功しました！')
  } catch (error) {
    console.error('LLM test failed:', error)
    alert('❌ LLM接続テストが失敗しました。')
  } finally {
    isTesting.value = false
  }
}

// 初期化
onMounted(() => {
  // ローカルストレージから統計を読み込み
  const savedStats = localStorage.getItem('llm-stats')
  if (savedStats) {
    try {
      stats.value = JSON.parse(savedStats)
    } catch (error) {
      console.error('Failed to parse saved stats:', error)
    }
  }
})

// 統計を保存
const saveStats = () => {
  localStorage.setItem('llm-stats', JSON.stringify(stats.value))
}
</script>

<style scoped>
.llm-status-panel {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 320px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  font-size: var(--font-size-sm);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-background-secondary);
}

.status-header h4 {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}

.status-content {
  padding: var(--spacing-4);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--color-background-secondary);
  border-radius: var(--border-radius);
}

.status-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-weight: var(--font-weight-medium);
}

.status-icon {
  font-size: 1.2em;
}

.status-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-1);
}

.status-text {
  font-weight: var(--font-weight-medium);
}

.error-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.stats-section {
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border-light);
}

.stats-section h5 {
  margin: 0 0 var(--spacing-3) 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.stats-grid {
  display: grid;
  gap: var(--spacing-2);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2);
  background: var(--color-background-secondary);
  border-radius: var(--border-radius);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.stat-value {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.actions-section {
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border-light);
  display: flex;
  gap: var(--spacing-2);
}

.toggle-button {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 999;
}

/* モバイル対応 */
@media (max-width: 768px) {
  .llm-status-panel {
    width: calc(100vw - 40px);
    max-width: 320px;
  }
  
  .status-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2);
  }
  
  .status-details {
    align-items: flex-start;
  }
  
  .actions-section {
    flex-direction: column;
  }
}
</style> 