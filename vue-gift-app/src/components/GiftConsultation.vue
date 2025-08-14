<template>
  <div class="gift-consultation">
    <div class="consultation-header">
      <h2>🎁 健康ギフト相談</h2>
      <p>いくつかの質問にお答えいただき、最適な健康ギフトをご提案いたします</p>
    </div>

    <!-- 相談フォーム -->
    <form v-if="!showRecommendations" @submit.prevent="startConsultation" class="consultation-form">
      <div class="form-section">
        <h3>受取人について</h3>
        
        <div class="form-group">
          <label for="recipient-age">年齢 *</label>
          <select id="recipient-age" v-model="answers.age" required class="form-control">
            <option value="">選択してください</option>
            <option value="20-29">20代</option>
            <option value="30-39">30代</option>
            <option value="40-49">40代</option>
            <option value="50-59">50代</option>
            <option value="60-69">60代</option>
            <option value="70+">70代以上</option>
          </select>
        </div>

        <div class="form-group">
          <label for="recipient-gender">性別</label>
          <select id="recipient-gender" v-model="answers.gender" class="form-control">
            <option value="">選択してください</option>
            <option value="male">男性</option>
            <option value="female">女性</option>
            <option value="other">その他</option>
          </select>
        </div>

        <div class="form-group">
          <label for="relationship">関係性</label>
          <select id="relationship" v-model="answers.relationship" class="form-control">
            <option value="">選択してください</option>
            <option value="family">家族</option>
            <option value="friend">友人</option>
            <option value="colleague">同僚</option>
            <option value="partner">パートナー</option>
            <option value="other">その他</option>
          </select>
        </div>
      </div>

      <div class="form-section">
        <h3>予算・関心事</h3>
        
        <div class="form-group">
          <label for="budget">予算 *</label>
          <select id="budget" v-model="answers.budget" required class="form-control">
            <option value="">選択してください</option>
            <option value="5000-10000">5,000円〜10,000円</option>
            <option value="10000-20000">10,000円〜20,000円</option>
            <option value="20000-30000">20,000円〜30,000円</option>
            <option value="30000-50000">30,000円〜50,000円</option>
            <option value="50000+">50,000円以上</option>
          </select>
        </div>

        <div class="form-group">
          <label>健康への関心事（複数選択可）</label>
          <div class="checkbox-group">
            <label class="checkbox-item">
              <input type="checkbox" v-model="answers.healthConcerns" value="general-health">
              <span class="checkmark"></span>
              一般的な健康管理
            </label>
            <label class="checkbox-item">
              <input type="checkbox" v-model="answers.healthConcerns" value="dental-care">
              <span class="checkmark"></span>
              歯科ケア
            </label>
            <label class="checkbox-item">
              <input type="checkbox" v-model="answers.healthConcerns" value="beauty-care">
              <span class="checkmark"></span>
              美容・スキンケア
            </label>
            <label class="checkbox-item">
              <input type="checkbox" v-model="answers.healthConcerns" value="fitness">
              <span class="checkmark"></span>
              フィットネス・運動
            </label>
            <label class="checkbox-item">
              <input type="checkbox" v-model="answers.healthConcerns" value="nutrition">
              <span class="checkmark"></span>
              栄養・食事
            </label>
            <label class="checkbox-item">
              <input type="checkbox" v-model="answers.healthConcerns" value="mental-health">
              <span class="checkmark"></span>
              メンタルヘルス
            </label>
          </div>
        </div>

        <div class="form-group">
          <label for="occasion">贈る機会</label>
          <select id="occasion" v-model="answers.occasion" class="form-control">
            <option value="">選択してください</option>
            <option value="birthday">誕生日</option>
            <option value="anniversary">記念日</option>
            <option value="christmas">クリスマス</option>
            <option value="new-year">新年</option>
            <option value="just-because">特別な理由なし</option>
          </select>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="loading" class="btn btn-primary">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '分析中...' : '🎁 ギフトを提案してもらう' }}
        </button>
      </div>
    </form>

    <!-- 推薦結果 -->
    <div v-if="showRecommendations" class="recommendations">
      <div class="recommendations-header">
        <h3>🎯 おすすめの健康ギフト</h3>
        <p>AIが分析した結果、以下のギフトをおすすめします</p>
      </div>

      <div class="recommendations-grid">
        <div 
          v-for="gift in recommendations" 
          :key="gift.id" 
          :class="['gift-card', { 'selected': selectedGift?.id === gift.id }]"
          @click="selectGift(gift)"
        >
          <div class="gift-icon">{{ gift.icon || '🎁' }}</div>
          <h4>{{ gift.name }}</h4>
          <p class="gift-description">{{ gift.description }}</p>
          <div class="gift-price">¥{{ gift.price.toLocaleString() }}</div>
          <div class="gift-category">{{ gift.category }}</div>
        </div>
      </div>

      <div class="ai-explanation" v-if="aiExplanation">
        <h4>🤖 AIからのメッセージ</h4>
        <p>{{ aiExplanation }}</p>
      </div>

      <div class="recommendations-actions">
        <button @click="resetConsultation" class="btn btn-secondary">
          🔄 もう一度相談する
        </button>
        <button @click="proceedToOrder" class="btn btn-primary" v-if="selectedGift">
          💳 選択したギフトを購入する
        </button>
      </div>
    </div>

    <!-- エラーメッセージ -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="resetError" class="btn btn-secondary">再試行</button>
    </div>

    <!-- 決済デモモーダル -->
    <div v-if="showPaymentModal" class="payment-modal-overlay" @click="showPaymentModal = false">
      <div class="payment-modal" @click.stop>
        <div class="payment-modal-header">
          <h3>💳 決済デモ</h3>
          <button @click="showPaymentModal = false" class="close-btn">×</button>
        </div>
        
        <div class="payment-modal-content">
          <div v-if="selectedGiftForPayment" class="selected-gift">
            <h4>{{ selectedGiftForPayment.name }}</h4>
            <p>{{ selectedGiftForPayment.description }}</p>
            <div class="gift-price">¥{{ selectedGiftForPayment.price.toLocaleString() }}</div>
          </div>
          
          <div v-if="!paymentProcessing && !paymentCompleted" class="payment-form">
            <div class="form-group">
              <label>カード番号</label>
              <input type="text" value="**** **** **** 1234" readonly class="form-control">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>有効期限</label>
                <input type="text" value="12/25" readonly class="form-control">
              </div>
              <div class="form-group">
                <label>CVV</label>
                <input type="text" value="123" readonly class="form-control">
              </div>
            </div>
            <div class="form-group">
              <label>カード名義人</label>
              <input type="text" value="DEMO USER" readonly class="form-control">
            </div>
            
            <button @click="processPayment" class="btn btn-primary payment-btn">
              💳 決済を実行する
            </button>
          </div>
          
          <div v-if="paymentProcessing" class="payment-processing">
            <div class="spinner"></div>
            <p>決済処理中...</p>
          </div>
          
          <div v-if="paymentCompleted" class="payment-completed">
            <div class="success-icon">✅</div>
            <h4>決済完了！</h4>
            <p>ご購入ありがとうございます。</p>
            <p>商品は3-5営業日でお届けいたします。</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ギフトURL表示モーダル -->
    <div v-if="showGiftUrl" class="gift-url-modal-overlay" @click="showGiftUrl = false">
      <div class="gift-url-modal" @click.stop>
        <div class="gift-url-modal-header">
          <h3>🎁 ギフトURL</h3>
          <button @click="showGiftUrl = false" class="close-btn">×</button>
        </div>
        <div class="gift-url-modal-content">
          <p>ギフトを受け取る方にこのURLを共有してください：</p>
          <div class="gift-url-box">
            <input type="text" :value="giftUrl" readonly class="gift-url-input">
            <button @click="copyGiftUrl" class="copy-btn">URLをコピー</button>
          </div>
          <div class="share-options">
            <button @click="shareOnLine" class="btn btn-primary">LINEで共有</button>
            <button @click="shareByEmail" class="btn btn-secondary">メールで共有</button>
          </div>
          <div class="gift-url-actions">
            <button @click="createNewGift" class="btn btn-primary">新しいギフトを作る</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useGiftStore } from '@/stores/gift'
import { getLLMService } from '@/services/llm'
import type { Gift, ConsultationAnswers } from '@/types'

const giftStore = useGiftStore()

// 状態管理
const loading = ref(false)
const error = ref<string | null>(null)
const showRecommendations = ref(false)
const recommendations = ref<Gift[]>([])
const aiExplanation = ref<string>('')
const selectedGift = ref<Gift | null>(null)

// フォームデータ
const answers = reactive<ConsultationAnswers>({
  age: '',
  gender: '',
  relationship: '',
  budget: '',
  healthConcerns: [],
  occasion: '',
})

// 相談開始
const startConsultation = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Plamo APIを使用した相談処理
    const consultationText = generateConsultationText(answers)
    
    // LLMサービスを使用してギフト推薦を取得
    const llmService = getLLMService()
    const response = await llmService.generateResponse(
      `以下の健康ギフト相談の内容に基づいて、最適なギフトを3つ推薦してください。

相談内容:
${consultationText}

以下の形式で回答してください：
1. 各ギフトの詳細（名称、価格、特徴）
2. 推薦理由
3. 期待される効果
4. 相手へのメッセージ提案

親しみやすく、実用的なアドバイスをお願いします。`
    )
    
    // 応答を解析してギフト推薦を生成
    const aiExplanation = response.text
    recommendations.value = parseGiftRecommendations(aiExplanation)
    
    showRecommendations.value = true
  } catch (err) {
    console.error('Consultation error:', err)
    error.value = '相談の処理に失敗しました。しばらく待ってから再試行してください。'
  } finally {
    loading.value = false
  }
}

// 相談内容をテキストに変換
const generateConsultationText = (answers: ConsultationAnswers): string => {
  const ageText = answers.age ? `年齢: ${answers.age}` : ''
  const genderText = answers.gender ? `性別: ${answers.gender}` : ''
  const relationshipText = answers.relationship ? `関係性: ${answers.relationship}` : ''
  const budgetText = answers.budget ? `予算: ${answers.budget}` : ''
  const healthConcernsText = answers.healthConcerns.length > 0 
    ? `健康への関心事: ${answers.healthConcerns.join(', ')}` : ''
  const occasionText = answers.occasion ? `贈る機会: ${answers.occasion}` : ''
  
  return [ageText, genderText, relationshipText, budgetText, healthConcernsText, occasionText]
    .filter(Boolean)
    .join('\n')
}

// ギフト推薦を解析
const parseGiftRecommendations = (aiText: string): Gift[] => {
  // 簡単な解析（実際の実装ではより高度な解析が必要）
  const recommendations: Gift[] = []
  
  // デフォルトのギフト推薦
  const defaultGifts: Gift[] = [
    {
      id: 'gift-1',
      name: '健康管理アプリ',
      description: '日々の健康状態を記録・管理できるアプリ',
      price: 5000,
      category: 'mental_health',
      partnerId: 'partner-1',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'gift-2',
      name: 'フィットネスグッズ',
      description: '自宅でできる運動器具セット',
      price: 15000,
      category: 'fitness',
      partnerId: 'partner-2',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'gift-3',
      name: '健康食品ギフト',
      description: '栄養バランスを考えた食品セット',
      price: 8000,
      category: 'nutrition',
      partnerId: 'partner-3',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ]
  
  return defaultGifts
}

// ギフト選択
const selectGift = (gift: Gift) => {
  console.log('Gift selected:', gift)
  selectedGift.value = gift
  console.log('Selected gift updated:', selectedGift.value)
}

// 注文に進む
const proceedToOrder = () => {
  if (selectedGift.value) {
    // 決済デモを開始
    console.log('Selected gift:', selectedGift.value)
    startPaymentDemo(selectedGift.value)
  }
}

// 決済デモ
const startPaymentDemo = (gift: Gift) => {
  // 決済デモのモーダルを表示
  showPaymentModal.value = true
  selectedGiftForPayment.value = gift
}

// 決済デモの状態
const showPaymentModal = ref(false)
const selectedGiftForPayment = ref<Gift | null>(null)
const paymentProcessing = ref(false)
const paymentCompleted = ref(false)
const showGiftUrl = ref(false)
const giftUrl = ref('')
const giftId = ref('')

// 決済処理
const processPayment = async () => {
  if (!selectedGiftForPayment.value) return
  
  try {
    paymentProcessing.value = true
    
    // 決済処理のシミュレーション（3秒待機）
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // 実際のAPIを呼び出してギフト注文を作成
    const orderData = {
      giftId: selectedGiftForPayment.value.id,
      recipientName: 'ギフト受取人',
      recipientEmail: 'recipient@example.com',
      message: '健康への想いを込めて贈ります',
      userId: 'test-user'
    }
    
    const response = await fetch('https://jquzcc3vd0.execute-api.us-west-2.amazonaws.com/prod/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    })
    
    if (!response.ok) {
      throw new Error('ギフト注文の作成に失敗しました')
    }
    
    const result = await response.json()
    
    if (result.success && result.data) {
      // APIから返されたギフトURLを使用
      giftUrl.value = result.data.giftUrl
      giftId.value = result.data.id
    } else {
      throw new Error('ギフト注文の作成に失敗しました')
    }
    
    // 決済完了
    paymentCompleted.value = true
    
    // 3秒後にギフトURL画面を表示
    setTimeout(() => {
      showGiftUrl.value = true
      paymentCompleted.value = false
      paymentProcessing.value = false
    }, 3000)
    
  } catch (error) {
    console.error('Payment failed:', error)
    paymentProcessing.value = false
    alert('決済処理に失敗しました: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}

// ギフトID生成
const generateGiftId = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `gift_${timestamp}_${random}`
}

// URLをクリップボードにコピー
const copyGiftUrl = async () => {
  try {
    await navigator.clipboard.writeText(giftUrl.value)
    alert('ギフトURLをクリップボードにコピーしました！')
  } catch (error) {
    console.error('Failed to copy URL:', error)
    // フォールバック: テキストエリアを使用
    const textArea = document.createElement('textarea')
    textArea.value = giftUrl.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('ギフトURLをクリップボードにコピーしました！')
  }
}

// LINEで共有
const shareOnLine = () => {
  const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(`健康のギフトが届きました！\n${giftUrl.value}`)}`
  window.open(lineUrl, '_blank')
}

// メールで共有
const shareByEmail = () => {
  const subject = encodeURIComponent('健康のギフトが届きました')
  const body = encodeURIComponent(`健康のギフトが届きました！\n\n以下のURLからギフトを確認してください：\n${giftUrl.value}`)
  const mailtoUrl = `mailto:?subject=${subject}&body=${body}`
  window.location.href = mailtoUrl
}

// 新しいギフトを作る
const createNewGift = () => {
  showPaymentModal.value = false
  showGiftUrl.value = false
  giftUrl.value = ''
  selectedGiftForPayment.value = null
  resetConsultation()
}

// 相談リセット
const resetConsultation = () => {
  showRecommendations.value = false
  recommendations.value = []
  aiExplanation.value = ''
  selectedGift.value = null
  answers.age = ''
  answers.gender = ''
  answers.relationship = undefined
  answers.budget = ''
  answers.healthConcerns = []
  answers.occasion = undefined
}

// エラーリセット
const resetError = () => {
  error.value = null
}
</script>

<style scoped>
.gift-consultation {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.consultation-header {
  text-align: center;
  margin-bottom: 3rem;
}

.consultation-header h2 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.consultation-form {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--color-orange-light);
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.checkbox-item:hover {
  background-color: var(--color-orange-light);
}

.checkbox-item input[type="checkbox"] {
  margin-right: 0.5rem;
  transform: scale(1.2);
}

.form-actions {
  text-align: center;
  margin-top: 2rem;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
}

.btn-secondary {
  background: var(--color-gray-light);
  color: var(--color-text-primary);
}

.btn-secondary:hover {
  background: var(--color-gray);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.recommendations {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.recommendations-header {
  text-align: center;
  margin-bottom: 2rem;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.gift-card {
  border: 2px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.gift-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.2);
}

.gift-card.selected {
  border-color: var(--color-primary);
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1));
}

.gift-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.gift-card h4 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.gift-description {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.gift-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.gift-category {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  font-style: italic;
  background: var(--color-orange-light);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

.ai-explanation {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-left: 4px solid var(--color-primary);
}

.ai-explanation h4 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.recommendations-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.error-message {
  background: var(--color-danger);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin-top: 1rem;
}

.error-message button {
  margin-top: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .gift-consultation {
    padding: 1rem;
  }
  
  .consultation-form,
  .recommendations {
    padding: 1.5rem;
  }
  
  .checkbox-group {
    grid-template-columns: 1fr;
  }
  
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
  
  .recommendations-actions {
    flex-direction: column;
  }
}

/* 決済モーダル */
.payment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.payment-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.payment-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.payment-modal-header h3 {
  margin: 0;
  color: var(--color-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background: #f8f9fa;
}

.payment-modal-content {
  padding: 1.5rem;
}

.selected-gift {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
}

.selected-gift h4 {
  margin: 0 0 0.5rem 0;
  color: var(--color-primary);
}

.selected-gift p {
  margin: 0 0 1rem 0;
  color: var(--color-text-secondary);
}

.payment-form {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.payment-btn {
  width: 100%;
  margin-top: 1rem;
}

.payment-processing {
  text-align: center;
  padding: 2rem;
}

.payment-processing .spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.payment-completed {
  text-align: center;
  padding: 2rem;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.payment-completed h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.payment-completed p {
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

/* ギフトURL表示モーダル */
.gift-url-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.gift-url-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.gift-url-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.gift-url-modal-header h3 {
  margin: 0;
  color: var(--color-primary);
}

.gift-url-modal-content {
  padding: 1.5rem;
  text-align: center;
}

.gift-url-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.gift-url-input {
  flex-grow: 1;
  padding: 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gift-url-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.copy-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.copy-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
}

.share-options {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.gift-url-actions {
  text-align: center;
}

@media (max-width: 768px) {
  .payment-modal {
    width: 95%;
    margin: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }

  .gift-url-modal {
    width: 95%;
    margin: 1rem;
  }

  .gift-url-box {
    flex-direction: column;
    gap: 0.5rem;
  }

  .gift-url-input {
    width: 100%;
  }
}
</style> 