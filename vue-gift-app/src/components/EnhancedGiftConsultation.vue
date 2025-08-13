<template>
  <div class="enhanced-gift-consultation">
    <div class="consultation-header">
      <h2>🎁 健康ギフト相談</h2>
      <p>自然な会話や質問に答えることで、最適な健康ギフトをご提案いたします</p>
    </div>

    <!-- 相談方法選択 -->
    <div v-if="!consultationStarted" class="consultation-methods">
      <div class="method-selection">
        <h3>相談方法を選択してください</h3>
        
        <div class="methods-grid">
          <div 
            :class="['method-card', { 'selected': selectedMethod === 'line-chat' }]"
            @click="selectMethod('line-chat')"
          >
            <div class="method-icon">💬</div>
            <h4>LINEチャット相談</h4>
            <p>LINEで自然な会話をしながら、感情に基づいたギフトを推薦</p>
            <ul>
              <li>LINEでの自然な会話</li>
              <li>感情分析による推薦</li>
              <li>いつでもどこでも相談可能</li>
            </ul>
          </div>
          
          <div 
            :class="['method-card', { 'selected': selectedMethod === 'questionnaire' }]"
            @click="selectMethod('questionnaire')"
          >
            <div class="method-icon">📋</div>
            <h4>質問形式相談</h4>
            <p>簡単な質問に答えることで、最適なギフトを推薦</p>
            <ul>
              <li>簡単な質問形式</li>
              <li>素早い推薦</li>
              <li>確実なマッチング</li>
            </ul>
          </div>
          
          <div 
            :class="['method-card', { 'selected': selectedMethod === 'health-awareness' }]"
            @click="selectMethod('health-awareness')"
          >
            <div class="method-icon">💭</div>
            <h4>健康意識向上</h4>
            <p>健康について考えながら、ギフト受取人の健康意識を高める</p>
            <ul>
              <li>健康意識の向上</li>
              <li>パーソナライズされた健康プラン</li>
              <li>行動変容の促進</li>
            </ul>
          </div>
        </div>
        
        <button 
          @click="startConsultation" 
          class="start-button large-button" 
          :disabled="!selectedMethod"
        >
          相談を開始する
        </button>
      </div>
    </div>

    <!-- LINEチャット相談 -->
    <div v-if="consultationStarted && selectedMethod === 'line-chat'" class="line-chat-consultation">
      <div class="line-chat-info">
        <div class="line-chat-header">
          <h3>💬 LINEチャット相談</h3>
          <p>LINEで健康ギフトの相談を始めましょう！</p>
        </div>
        
        <div class="line-setup-steps">
          <h4>📱 LINEでの相談を始めるには</h4>
          <div class="steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h5>LINE公式アカウントを追加</h5>
                <p>下のQRコードをスキャンするか、友だち追加ボタンをタップしてください</p>
                <div class="qr-code-placeholder">
                  <p>QRコード</p>
                  <small>（LINE公式アカウント設定後に表示されます）</small>
                </div>
              </div>
            </div>
            
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h5>メッセージを送信</h5>
                <p>「こんにちは」や「健康ギフトについて相談したい」など、気軽にメッセージを送ってください</p>
              </div>
            </div>
            
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h5>AIが最適なギフトを推薦</h5>
                <p>あなたの想いを聞いて、感情に基づいた最適な健康ギフトをご提案いたします</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="line-features">
          <h4>✨ LINEチャット相談の特徴</h4>
          <div class="features-grid">
            <div class="feature">
              <div class="feature-icon">🤖</div>
              <h5>AI感情分析</h5>
              <p>メッセージの感情を分析して、最適なギフトを推薦</p>
            </div>
            <div class="feature">
              <div class="feature-icon">💝</div>
              <h5>パーソナライズ</h5>
              <p>相手への想いや関係性に基づいた個別提案</p>
            </div>
            <div class="feature">
              <div class="feature-icon">📱</div>
              <h5>いつでも相談</h5>
              <p>スマートフォンからいつでも気軽に相談可能</p>
            </div>
            <div class="feature">
              <div class="feature-icon">🎁</div>
              <h5>ギフト購入</h5>
              <p>相談から購入まで、LINE内で完結</p>
            </div>
          </div>
        </div>
        
        <div class="line-example">
          <h4>💡 相談例</h4>
          <div class="example-chat">
            <div class="chat-message user">
              <p>「母の日に、いつも健康を気遣ってくれるお母さんに何か贈りたいです」</p>
            </div>
            <div class="chat-message ai">
              <p>「お母様への感謝の気持ちが伝わってきますね。健康診断パックやフィットネス体験はいかがでしょうか？お母様の健康をサポートできるギフトをご提案いたします。」</p>
            </div>
          </div>
        </div>
        
        <div class="line-actions">
          <button @click="openLineOfficialAccount" class="line-button">
            📱 LINE公式アカウントを追加
          </button>
          <p class="line-note">
            ※ LINE公式アカウントの設定が完了次第、QRコードと友だち追加リンクが表示されます
          </p>
        </div>
      </div>
    </div>

    <!-- 質問形式相談 -->
    <div v-if="consultationStarted && selectedMethod === 'questionnaire'" class="questionnaire-consultation">
      <div class="consultation-form">
        <div class="form-group">
          <label for="age">年齢</label>
          <select id="age" v-model="answers.age" required>
            <option value="">選択してください</option>
            <option value="20-30">20-30歳</option>
            <option value="31-40">31-40歳</option>
            <option value="41-50">41-50歳</option>
            <option value="51-60">51-60歳</option>
            <option value="61-70">61-70歳</option>
            <option value="71+">71歳以上</option>
          </select>
        </div>

        <div class="form-group">
          <label for="gender">性別</label>
          <select id="gender" v-model="answers.gender" required>
            <option value="">選択してください</option>
            <option value="male">男性</option>
            <option value="female">女性</option>
            <option value="other">その他</option>
          </select>
        </div>

        <div class="form-group">
          <label for="relationship">関係性</label>
          <select id="relationship" v-model="answers.relationship" required>
            <option value="">選択してください</option>
            <option value="family">家族</option>
            <option value="friend">友人</option>
            <option value="partner">恋人・パートナー</option>
            <option value="colleague">同僚</option>
            <option value="other">その他</option>
          </select>
        </div>

        <div class="form-group">
          <label for="budget">予算</label>
          <select id="budget" v-model="answers.budget" required>
            <option value="">選択してください</option>
            <option value="1000-3000">1,000-3,000円</option>
            <option value="3000-5000">3,000-5,000円</option>
            <option value="5000-10000">5,000-10,000円</option>
            <option value="10000-20000">10,000-20,000円</option>
            <option value="20000+">20,000円以上</option>
          </select>
        </div>

        <div class="form-group">
          <label for="healthConcern">健康への関心事</label>
          <select id="healthConcern" v-model="answers.healthConcern" required>
            <option value="">選択してください</option>
            <option value="exercise">運動・フィットネス</option>
            <option value="nutrition">栄養・食事</option>
            <option value="mental">メンタルヘルス</option>
            <option value="prevention">予防医療</option>
            <option value="general">全般的な健康</option>
          </select>
        </div>

        <button @click="startQuestionnaireConsultation" class="start-button" :disabled="!isFormValid">
          相談を開始する
        </button>
      </div>

      <!-- 質問形式の結果 -->
      <div v-if="questionnaireStarted && !loading" class="consultation-results">
        <div class="results-header">
          <h3>🎯 おすすめの健康ギフト</h3>
          <p>あなたの回答に基づいて、最適な健康ギフトをご提案いたします</p>
        </div>

        <div class="gifts-grid">
          <div
            v-for="gift in recommendations"
            :key="gift.id"
            :class="['gift-card', { 'selected': selectedGift?.id === gift.id }]"
            @click="selectGift(gift)"
          >
            <div class="gift-image">
              <img :src="gift.imageUrl || '/placeholder-gift.jpg'" :alt="gift.name" />
            </div>
            <div class="gift-info">
              <h4>{{ gift.name }}</h4>
              <p>{{ gift.description }}</p>
              <div class="gift-category">{{ gift.category }}</div>
              <div class="gift-price">¥{{ gift.price.toLocaleString() }}</div>
            </div>
          </div>
        </div>

        <div v-if="selectedGift" class="selection-actions">
          <button @click="showPaymentModal = true" class="select-button">
            このギフトを選択する
          </button>
        </div>
      </div>
    </div>

    <!-- 健康意識向上 -->
    <div v-if="consultationStarted && selectedMethod === 'health-awareness'" class="health-awareness-consultation">
      <HealthAwarenessInterface />
    </div>

    <!-- ローディング -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>最適なギフトを検索中...</p>
    </div>

    <!-- 決済モーダル -->
    <div v-if="showPaymentModal" class="payment-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>決済情報</h3>
          <button @click="showPaymentModal = false" class="close-button">×</button>
        </div>
        
        <div class="modal-body">
          <div class="selected-gift-info">
            <h4>{{ selectedGiftForPayment?.name }}</h4>
            <p>¥{{ selectedGiftForPayment?.price.toLocaleString() }}</p>
          </div>
          
          <div class="payment-form">
            <div class="form-group">
              <label for="recipientName">受取人名</label>
              <input type="text" id="recipientName" v-model="recipientName" required />
            </div>
            
            <div class="form-group">
              <label for="recipientEmail">受取人メールアドレス</label>
              <input type="email" id="recipientEmail" v-model="recipientEmail" required />
            </div>
            
            <div class="form-group">
              <label for="message">メッセージ（任意）</label>
              <textarea id="message" v-model="message" rows="3"></textarea>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showPaymentModal = false" class="cancel-button">キャンセル</button>
          <button @click="processPayment" :disabled="paymentProcessing" class="pay-button">
            <span v-if="paymentProcessing">処理中...</span>
            <span v-else>決済する</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 決済完了モーダル -->
    <div v-if="paymentCompleted" class="completion-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>🎉 決済完了</h3>
        </div>
        
        <div class="modal-body">
          <p>ギフトの決済が完了しました！</p>
          <p>受取人にギフトURLをお送りしました。</p>
        </div>
      </div>
    </div>

    <!-- ギフトURL表示 -->
    <div v-if="showGiftUrl" class="gift-url-section">
      <div class="url-card">
        <h3>🎁 ギフトURL</h3>
        <p>以下のURLを受取人にお送りください：</p>
        <div class="url-display">
          <input type="text" :value="giftUrl" readonly class="url-input" />
          <button @click="copyUrl" class="copy-button">コピー</button>
        </div>
        <button @click="viewGift" class="view-button">ギフトを確認する</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import HealthAwarenessInterface from './HealthAwarenessInterface.vue'
import type { Gift } from '@/types'

const router = useRouter()

// 状態管理
const consultationStarted = ref(false)
const selectedMethod = ref<'line-chat' | 'questionnaire' | 'health-awareness' | null>(null)
const questionnaireStarted = ref(false)
const loading = ref(false)
const recommendations = ref<Gift[]>([])
const selectedGift = ref<Gift | null>(null)
const showPaymentModal = ref(false)
const paymentProcessing = ref(false)
const paymentCompleted = ref(false)
const showGiftUrl = ref(false)
const giftUrl = ref('')
const giftId = ref('')

// フォームデータ
const answers = ref({
  age: '',
  gender: '',
  relationship: '',
  budget: '',
  healthConcern: ''
})

// 決済フォームデータ
const recipientName = ref('')
const recipientEmail = ref('')
const message = ref('')

// 計算プロパティ
const isFormValid = computed(() => {
  return answers.value.age && 
         answers.value.gender && 
         answers.value.relationship && 
         answers.value.budget && 
         answers.value.healthConcern
})

const selectedGiftForPayment = computed(() => selectedGift.value)

// メソッド選択
const selectMethod = (method: 'line-chat' | 'questionnaire' | 'health-awareness') => {
  selectedMethod.value = method
}

// 相談開始
const startConsultation = () => {
  if (selectedMethod.value) {
    consultationStarted.value = true
  }
}

// 質問形式相談開始
const startQuestionnaireConsultation = async () => {
  if (!isFormValid.value) return
  
  loading.value = true
  questionnaireStarted.value = true
  
  try {
    // API呼び出し
    const response = await fetch('https://jquzcc3vd0.execute-api.us-west-2.amazonaws.com/prod/consultation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answers: answers.value,
        userId: 'test-user'
      })
    })

    if (!response.ok) {
      throw new Error('相談の開始に失敗しました')
    }

    const result = await response.json()
    
    if (result.success && result.data) {
      recommendations.value = result.data.recommendations || []
    }
  } catch (error) {
    console.error('Consultation error:', error)
    // フォールバック: モックデータ
    recommendations.value = [
      {
        id: '1',
        name: '健康診断パック',
        description: '総合的な健康チェック',
        price: 15000,
        category: '健康診断',
        imageUrl: '/placeholder-gift.jpg'
      },
      {
        id: '2',
        name: 'フィットネス体験',
        description: 'パーソナルトレーニング',
        price: 8000,
        category: 'フィットネス',
        imageUrl: '/placeholder-gift.jpg'
      }
    ]
  } finally {
    loading.value = false
  }
}

// LINE公式アカウントを開く
const openLineOfficialAccount = () => {
  // LINE公式アカウントのURL（設定後に更新）
  const lineUrl = 'https://line.me/R/ti/p/@your-line-official-account'
  window.open(lineUrl, '_blank')
}

// ギフト選択（質問形式から）
const selectGift = (gift: Gift) => {
  selectedGift.value = gift
}

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
      recipientName: recipientName.value,
      recipientEmail: recipientEmail.value,
      message: message.value,
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
      showPaymentModal.value = false // モーダルを閉じる
      paymentCompleted.value = false
      paymentProcessing.value = false
    }, 3000)

  } catch (error) {
    console.error('Payment failed:', error)
    paymentProcessing.value = false
    alert('決済処理に失敗しました: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}

// URLコピー
const copyUrl = async () => {
  try {
    await navigator.clipboard.writeText(giftUrl.value)
    alert('URLをクリップボードにコピーしました')
  } catch (error) {
    console.error('Copy failed:', error)
    alert('URLのコピーに失敗しました')
  }
}

// ギフト確認
const viewGift = () => {
  if (giftId.value) {
    router.push(`/gift/${giftId.value}`)
  }
}
</script>

<style scoped>
.enhanced-gift-consultation {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.consultation-header {
  text-align: center;
  margin-bottom: 40px;
}

.consultation-header h2 {
  margin: 0 0 16px 0;
  font-size: var(--font-size-large);
  color: var(--color-text-primary);
}

.consultation-header p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.consultation-methods {
  max-width: 800px;
  margin: 0 auto;
}

.method-selection h3 {
  text-align: center;
  margin-bottom: 32px;
  font-size: var(--font-size-large);
  color: var(--color-text-primary);
}

.methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.method-card {
  background: white;
  padding: 32px;
  border-radius: 12px;
  border: 2px solid var(--color-border);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.method-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.method-card.selected {
  border-color: var(--color-primary);
  background: var(--color-orange-light);
}

.method-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.method-card h4 {
  margin: 0 0 12px 0;
  font-size: var(--font-size-large);
  color: var(--color-text-primary);
}

.method-card p {
  margin: 0 0 20px 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.method-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.method-card li {
  padding: 8px 0;
  color: var(--color-text-primary);
  position: relative;
  padding-left: 20px;
}

.method-card li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-primary);
  font-weight: bold;
}

.start-button {
  display: block;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  padding: 16px 32px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: var(--font-size-large);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.start-button:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

.start-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.consultation-form {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--color-border);
  border-radius: 6px;
  font-size: var(--font-size-base);
  transition: border-color 0.2s ease;
}

.form-group select:focus,
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.consultation-results {
  margin-top: 32px;
}

.results-header {
  text-align: center;
  margin-bottom: 32px;
}

.results-header h3 {
  margin: 0 0 12px 0;
  font-size: var(--font-size-large);
  color: var(--color-text-primary);
}

.results-header p {
  margin: 0;
  color: var(--color-text-secondary);
}

.gifts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.gift-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.gift-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.gift-card.selected {
  border: 3px solid var(--color-primary);
}

.gift-image {
  height: 200px;
  overflow: hidden;
}

.gift-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gift-info {
  padding: 20px;
}

.gift-info h4 {
  margin: 0 0 8px 0;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.gift-info p {
  margin: 0 0 12px 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-small);
  line-height: 1.4;
}

.gift-category {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  font-style: italic;
  background: var(--color-orange-light);
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 8px;
}

.gift-price {
  font-size: var(--font-size-large);
  font-weight: 600;
  color: var(--color-primary);
}

.selection-actions {
  text-align: center;
}

.select-button {
  padding: 16px 32px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-button:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.payment-modal,
.completion-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-large);
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.modal-body {
  padding: 24px;
}

.selected-gift-info {
  text-align: center;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--color-background-secondary);
  border-radius: 8px;
}

.selected-gift-info h4 {
  margin: 0 0 8px 0;
  color: var(--color-text-primary);
}

.selected-gift-info p {
  margin: 0;
  font-size: var(--font-size-large);
  font-weight: 600;
  color: var(--color-primary);
}

.payment-form {
  margin-bottom: 24px;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-button,
.pay-button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: 600;
  transition: all 0.2s ease;
}

.cancel-button {
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
}

.pay-button {
  background: var(--color-primary);
  color: white;
}

.pay-button:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.pay-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.gift-url-section {
  text-align: center;
  padding: 40px 20px;
}

.url-card {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
}

.url-card h3 {
  margin: 0 0 16px 0;
  font-size: var(--font-size-large);
  color: var(--color-text-primary);
}

.url-card p {
  margin: 0 0 24px 0;
  color: var(--color-text-secondary);
}

.url-display {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.url-input {
  flex: 1;
  padding: 12px;
  border: 2px solid var(--color-border);
  border-radius: 6px;
  font-size: var(--font-size-base);
  background: var(--color-background-secondary);
}

.copy-button {
  padding: 12px 24px;
  background: var(--color-secondary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.copy-button:hover {
  background: var(--color-secondary-dark);
}

.view-button {
  padding: 16px 32px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-button:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .enhanced-gift-consultation {
    padding: 16px;
  }
  
  .methods-grid {
    grid-template-columns: 1fr;
  }
  
  .method-card {
    padding: 24px;
  }
  
  .consultation-form {
    padding: 24px;
  }
  
  .gifts-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .url-display {
    flex-direction: column;
  }
}

/* アクセシビリティ対応 */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
  }
  
  .method-card:hover,
  .gift-card:hover,
  .start-button:hover,
  .select-button:hover,
  .view-button:hover {
    transform: none;
  }
}

/* LINEチャット相談スタイル */
.line-chat-consultation {
  max-width: 800px;
  margin: 0 auto;
}

.line-chat-header {
  text-align: center;
  margin-bottom: 40px;
}

.line-chat-header h3 {
  margin: 0 0 12px 0;
  font-size: var(--font-size-large);
  color: var(--color-text-primary);
}

.line-chat-header p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.line-setup-steps {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  margin-bottom: 32px;
}

.line-setup-steps h4 {
  margin: 0 0 24px 0;
  font-size: var(--font-size-large);
  color: var(--color-text-primary);
  text-align: center;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.step {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.step-number {
  width: 40px;
  height: 40px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: var(--font-size-base);
  flex-shrink: 0;
}

.step-content h5 {
  margin: 0 0 8px 0;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.step-content p {
  margin: 0 0 12px 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.qr-code-placeholder {
  width: 150px;
  height: 150px;
  border: 2px dashed var(--color-border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-background-secondary);
}

.qr-code-placeholder p {
  margin: 0 0 4px 0;
  font-weight: 600;
  color: var(--color-text-primary);
}

.qr-code-placeholder small {
  color: var(--color-text-secondary);
  text-align: center;
}

.line-features {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  margin-bottom: 32px;
}

.line-features h4 {
  margin: 0 0 24px 0;
  font-size: var(--font-size-large);
  color: var(--color-text-primary);
  text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.feature {
  text-align: center;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.feature:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.feature h5 {
  margin: 0 0 8px 0;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.feature p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-small);
  line-height: 1.4;
}

.line-example {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  margin-bottom: 32px;
}

.line-example h4 {
  margin: 0 0 24px 0;
  font-size: var(--font-size-large);
  color: var(--color-text-primary);
  text-align: center;
}

.example-chat {
  max-width: 400px;
  margin: 0 auto;
}

.chat-message {
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 80%;
}

.chat-message.user {
  background: var(--color-primary);
  color: white;
  margin-left: auto;
  border-bottom-right-radius: 4px;
}

.chat-message.ai {
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  margin-right: auto;
  border-bottom-left-radius: 4px;
}

.chat-message p {
  margin: 0;
  font-size: var(--font-size-small);
  line-height: 1.4;
}

.line-actions {
  text-align: center;
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
}

.line-button {
  background: #00B900;
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;
}

.line-button:hover {
  background: #009900;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.line-note {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-small);
}

/* ハイコントラストモード */
.high-contrast .method-card,
.high-contrast .gift-card,
.high-contrast .modal-content,
.high-contrast .url-card,
.high-contrast .line-setup-steps,
.high-contrast .line-features,
.high-contrast .line-example,
.high-contrast .line-actions {
  border: 2px solid var(--color-text-primary);
}
</style> 