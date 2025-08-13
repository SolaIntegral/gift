<template>
  <div class="chat-interface">
    <div class="chat-header">
      <h3>🤖 AI健康ギフト相談</h3>
      <p>自然な会話で最適なギフトを見つけましょう</p>
      <button @click="resetConversation" class="reset-button" aria-label="会話をリセット">
        🔄 新しい会話を始める
      </button>
    </div>
    
    <div class="chat-messages" ref="messagesContainer">
      <div 
        v-for="message in messages" 
        :key="message.id"
        :class="['message', message.sender]"
      >
        <div class="message-content">
          <div class="message-text readable-text">{{ message.text }}</div>
          <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
        </div>
        
        <!-- 感情表示（AIメッセージのみ） -->
        <div v-if="message.sender === 'ai' && message.emotion" class="emotion-indicator">
          <span :class="['emotion', message.emotion]" :title="`感情: ${message.emotion}`">
            {{ getEmotionIcon(message.emotion) }}
          </span>
        </div>
        
        <!-- ギフト推薦（AIメッセージのみ） -->
        <div v-if="message.sender === 'ai' && message.giftRecommendation" class="gift-recommendation">
          <div class="recommendation-card">
            <h4>🎁 おすすめギフト</h4>
            <div class="gift-info">
              <h5>{{ message.giftRecommendation.gift.name }}</h5>
              <p>{{ message.giftRecommendation.reason }}</p>
              <div class="gift-actions">
                <button @click="selectGift(message.giftRecommendation!.gift)" class="select-button">
                  このギフトを選択
                </button>
                <span class="confidence">信頼度: {{ Math.round(message.giftRecommendation.confidence * 100) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- ローディング表示 -->
      <div v-if="isLoading" class="message ai loading">
        <div class="message-content">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span class="timestamp">入力中...</span>
        </div>
      </div>
    </div>
    
    <div class="chat-input">
      <div class="input-container">
        <textarea 
          v-model="inputText"
          @keydown.enter.prevent="sendMessage"
          @keydown.ctrl.enter="sendMessage"
          placeholder="相手への想いを自然に話してみてください..."
          :disabled="isLoading"
          class="message-input"
          rows="3"
          aria-label="メッセージを入力"
        ></textarea>
        <button 
          @click="sendMessage" 
          :disabled="isLoading || !inputText.trim()"
          class="send-button large-button"
          aria-label="メッセージを送信"
        >
          <span v-if="isLoading">送信中...</span>
          <span v-else>送信</span>
        </button>
      </div>
      
      <!-- 入力ヒント -->
      <div class="input-hints">
        <p class="hint-text">💡 ヒント: 以下のような内容で話してみてください</p>
        <div class="hint-examples">
          <button @click="setExampleText('相手の健康が心配で、何かサポートできることがないか考えています')" class="hint-button">
            健康への心配
          </button>
          <button @click="setExampleText('いつも支えてくれてありがとう。感謝の気持ちを伝えたいです')" class="hint-button">
            感謝の気持ち
          </button>
          <button @click="setExampleText('大切な人に、健康でいてほしいという想いを伝えたいです')" class="hint-button">
            愛情の表現
          </button>
        </div>
      </div>
    </div>
    
    <!-- 推薦ギフト一覧 -->
    <div v-if="getRecommendations.length > 0" class="recommendations-summary">
      <h4>💝 会話から見つかったおすすめギフト</h4>
      <div class="recommendations-grid">
        <div 
          v-for="recommendation in getRecommendations" 
          :key="recommendation.gift.id"
          class="recommendation-item"
        >
          <h5>{{ recommendation.gift.name }}</h5>
          <p>{{ recommendation.reason }}</p>
          <div class="recommendation-actions">
            <button @click="selectGift(recommendation.gift)" class="select-button">
              選択する
            </button>
            <span class="price">¥{{ recommendation.gift.price.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useChatInterface } from '@/composables/useChatInterface'
import { useAccessibility } from '@/composables/useAccessibility'
import type { Gift } from '@/types'

const emit = defineEmits<{
  giftSelected: [gift: Gift]
}>()

const {
  messages,
  isLoading,
  inputText,
  recommendations,
  sendMessage,
  resetConversation,
  getRecommendations,
  getEmotionIcon,
  formatTime
} = useChatInterface()

const { speak } = useAccessibility()

const messagesContainer = ref<HTMLElement>()

// メッセージが追加されたら自動スクロール
watch(messages, async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}, { deep: true })

// 例文を設定
const setExampleText = (text: string) => {
  inputText.value = text
  speak('例文を設定しました')
}

// ギフト選択
const selectGift = (gift: Gift) => {
  emit('giftSelected', gift)
  speak(`${gift.name}を選択しました`)
}

// 音声ガイド（新しいメッセージが追加された時）
watch(messages, (newMessages, oldMessages) => {
  if (newMessages.length > oldMessages.length) {
    const lastMessage = newMessages[newMessages.length - 1]
    if (lastMessage.sender === 'ai') {
      speak(lastMessage.text)
    }
  }
})
</script>

<style scoped>
.chat-interface {
  max-width: 800px;
  margin: 0 auto;
  background: var(--color-background-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  height: 600px;
  display: flex;
  flex-direction: column;
}

.chat-header {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  padding: 20px;
  text-align: center;
}

.chat-header h3 {
  margin: 0 0 8px 0;
  font-size: var(--font-size-large);
}

.chat-header p {
  margin: 0 0 16px 0;
  opacity: 0.9;
}

.reset-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: var(--font-size-small);
  transition: all 0.2s ease;
}

.reset-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 80%;
}

.message.user {
  align-self: flex-end;
}

.message.ai {
  align-self: flex-start;
}

.message-content {
  background: var(--color-background-secondary);
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
}

.message.user .message-content {
  background: var(--color-primary);
  color: white;
}

.message-text {
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.timestamp {
  font-size: var(--font-size-small);
  opacity: 0.7;
  display: block;
}

.emotion-indicator {
  margin-top: 8px;
  text-align: center;
}

.emotion {
  font-size: 20px;
  padding: 4px 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: inline-block;
}

.gift-recommendation {
  margin-top: 12px;
}

.recommendation-card {
  background: var(--color-orange-light);
  border: 2px solid var(--color-orange);
  border-radius: 8px;
  padding: 16px;
}

.recommendation-card h4 {
  margin: 0 0 12px 0;
  color: var(--color-orange);
  font-size: var(--font-size-base);
}

.gift-info h5 {
  margin: 0 0 8px 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
}

.gift-info p {
  margin: 0 0 12px 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-small);
  line-height: 1.4;
}

.gift-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.select-button {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: var(--font-size-small);
  transition: background-color 0.2s ease;
}

.select-button:hover {
  background: var(--color-primary-dark);
}

.confidence {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: var(--color-text-secondary);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.chat-input {
  padding: 20px;
  border-top: 1px solid var(--color-border);
  background: var(--color-background-primary);
}

.input-container {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.message-input {
  flex: 1;
  padding: 12px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  resize: none;
  font-family: inherit;
  font-size: var(--font-size-base);
  line-height: 1.5;
  transition: border-color 0.2s ease;
}

.message-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.message-input:disabled {
  background: var(--color-background-secondary);
  cursor: not-allowed;
}

.send-button {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.send-button:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.send-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.input-hints {
  background: var(--color-background-secondary);
  padding: 16px;
  border-radius: 8px;
}

.hint-text {
  margin: 0 0 12px 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.hint-examples {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.hint-button {
  background: white;
  border: 1px solid var(--color-border);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: var(--font-size-small);
  transition: all 0.2s ease;
}

.hint-button:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.recommendations-summary {
  padding: 20px;
  border-top: 1px solid var(--color-border);
  background: var(--color-background-secondary);
}

.recommendations-summary h4 {
  margin: 0 0 16px 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-large);
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.recommendation-item {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.recommendation-item h5 {
  margin: 0 0 8px 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
}

.recommendation-item p {
  margin: 0 0 12px 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-small);
  line-height: 1.4;
}

.recommendation-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-weight: 600;
  color: var(--color-primary);
  font-size: var(--font-size-base);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .chat-interface {
    height: 100vh;
    border-radius: 0;
  }
  
  .input-container {
    flex-direction: column;
  }
  
  .send-button {
    width: 100%;
  }
  
  .hint-examples {
    flex-direction: column;
  }
  
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
}

/* アクセシビリティ対応 */
@media (prefers-reduced-motion: reduce) {
  .typing-indicator span {
    animation: none;
  }
  
  .send-button:hover {
    transform: none;
  }
}

/* ハイコントラストモード */
.high-contrast .message-content {
  border: 2px solid var(--color-text-primary);
}

.high-contrast .recommendation-card {
  border: 3px solid var(--color-primary);
}
</style> 