<template>
  <div class="purchase">
    <div class="container">
      <!-- パンくずリスト -->
      <nav class="breadcrumb">
        <router-link to="/">ホーム</router-link>
        <span class="separator">/</span>
        <router-link to="/gifts">ギフト一覧</router-link>
        <span class="separator">/</span>
        <router-link :to="`/gifts/${gift?.id}`">{{ gift?.name }}</router-link>
        <span class="separator">/</span>
        <span>購入</span>
      </nav>

      <!-- 購入フォーム -->
      <div v-if="gift" class="purchase-content">
        <div class="purchase-header">
          <h1>🎁 ギフトを贈る</h1>
          <p>大切な人への想いを込めて、健康ギフトを贈りましょう</p>
        </div>

        <div class="purchase-grid">
          <!-- 左側：ギフト情報 -->
          <div class="gift-summary">
            <div class="gift-card">
              <div class="gift-icon">{{ getGiftIcon(gift.category) }}</div>
              <h3>{{ gift.name }}</h3>
              <p class="gift-description">{{ gift.description }}</p>
              <div class="gift-price">¥{{ gift.price.toLocaleString() }}</div>
              <div class="gift-category">{{ getCategoryLabel(gift.category) }}</div>
            </div>
          </div>

          <!-- 右側：購入フォーム -->
          <div class="purchase-form">
            <form @submit.prevent="processPurchase">
              <!-- 受取人情報 -->
              <div class="form-section">
                <h3>👤 受取人情報</h3>
                <div class="form-group">
                  <label for="recipient-name">受取人のお名前 *</label>
                  <input
                    id="recipient-name"
                    v-model="formData.recipientName"
                    type="text"
                    required
                    placeholder="例：田中 花子"
                    class="form-control"
                  />
                </div>
                <div class="form-group">
                  <label for="recipient-email">受取人のメールアドレス *</label>
                  <input
                    id="recipient-email"
                    v-model="formData.recipientEmail"
                    type="email"
                    required
                    placeholder="例：hanako@example.com"
                    class="form-control"
                  />
                </div>
              </div>

              <!-- 贈り主情報 -->
              <div class="form-section">
                <h3>🎭 贈り主情報</h3>
                <div class="form-group">
                  <label for="gifter-name">お名前 *</label>
                  <input
                    id="gifter-name"
                    v-model="formData.gifterName"
                    type="text"
                    required
                    placeholder="例：田中 太郎"
                    class="form-control"
                  />
                </div>
                <div class="form-group">
                  <label for="gifter-email">メールアドレス *</label>
                  <input
                    id="gifter-email"
                    v-model="formData.gifterEmail"
                    type="email"
                    required
                    placeholder="例：taro@example.com"
                    class="form-control"
                  />
                </div>
              </div>

              <!-- メッセージ -->
              <div class="form-section">
                <h3>💌 メッセージ</h3>
                <div class="form-group">
                  <label for="message">受取人へのメッセージ *</label>
                  <textarea
                    id="message"
                    v-model="formData.message"
                    required
                    rows="4"
                    placeholder="例：いつまでも元気でいてね。健康第一で頑張ってください。"
                    class="form-control"
                  ></textarea>
                  <div class="message-preview">
                    <p class="preview-label">プレビュー：</p>
                    <div class="preview-content">
                      <p class="gifter-name">{{ formData.gifterName || 'あなた' }}より、心を込めて</p>
                      <p class="message-text">{{ formData.message || 'メッセージを入力してください' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 決済情報 -->
              <div class="form-section">
                <h3>💳 決済情報</h3>
                <div class="payment-demo">
                  <div class="form-group">
                    <label>カード番号</label>
                    <input
                      type="text"
                      value="**** **** **** 1234"
                      readonly
                      class="form-control demo-input"
                    />
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>有効期限</label>
                      <input
                        type="text"
                        value="12/25"
                        readonly
                        class="form-control demo-input"
                      />
                    </div>
                    <div class="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        value="123"
                        readonly
                        class="form-control demo-input"
                      />
                    </div>
                  </div>
                  <div class="form-group">
                    <label>カード名義人</label>
                    <input
                      type="text"
                      value="DEMO USER"
                      readonly
                      class="form-control demo-input"
                    />
                  </div>
                  <p class="demo-note">※ これはデモ画面です。実際の決済は行われません。</p>
                </div>
              </div>

              <!-- 利用規約 -->
              <div class="form-section">
                <div class="form-group">
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      v-model="formData.agreeToTerms"
                      required
                      class="checkbox-input"
                    />
                    <span class="checkmark"></span>
                    <a href="#" @click.prevent="showTerms">利用規約</a>と
                    <a href="#" @click.prevent="showPrivacy">プライバシーポリシー</a>に同意します *
                  </label>
                </div>
              </div>

              <!-- 購入ボタン -->
              <div class="purchase-actions">
                <BaseButton
                  type="submit"
                  :loading="processing"
                  :disabled="!isFormValid"
                  size="lg"
                  class="purchase-btn"
                >
                  {{ processing ? '処理中...' : `¥${gift.price.toLocaleString()} で購入する` }}
                </BaseButton>
                
                <BaseButton
                  @click="goBack"
                  variant="outline"
                  size="lg"
                  class="cancel-btn"
                >
                  キャンセル
                </BaseButton>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- ローディング状態 -->
      <div v-else-if="loading" class="loading">
        <div class="spinner"></div>
        <p>ギフト情報を読み込み中...</p>
      </div>

      <!-- エラー状態 -->
      <div v-else class="error">
        <p>ギフトが見つかりませんでした。</p>
        <router-link to="/gifts" class="back-link">
          ← ギフト一覧に戻る
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { Gift } from '@/types'

const route = useRoute()
const router = useRouter()

const gift = ref<Gift | null>(null)
const loading = ref(true)
const processing = ref(false)

// フォームデータ
const formData = ref({
  recipientName: '',
  recipientEmail: '',
  gifterName: '',
  gifterEmail: '',
  message: '',
  agreeToTerms: false
})

// ギフトデータ（実際の実装ではAPIから取得）
const giftsData: Gift[] = [
  {
    id: 'gift-1',
    name: '総合健康診断パック',
    description: '基本検査から詳細検査まで、健康状態を総合的にチェックできるパッケージです。',
    price: 15000,
    category: 'health_checkup',
    partnerId: 'partner-1',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gift-2',
    name: '歯科検診・クリーニング',
    description: '虫歯チェックと歯石除去で、お口の健康をサポートします。',
    price: 8000,
    category: 'dental_care',
    partnerId: 'partner-2',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gift-3',
    name: '肌診断・美容相談',
    description: '肌の状態チェックと美容アドバイスを提供します。',
    price: 12000,
    category: 'beauty_treatment',
    partnerId: 'partner-3',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gift-4',
    name: 'フィットネス評価・トレーニング',
    description: '体力測定と個人に合った運動プランを作成します。',
    price: 18000,
    category: 'fitness',
    partnerId: 'partner-4',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gift-5',
    name: '栄養相談・食事プラン',
    description: '個人に合わせた栄養指導と食事プラン作成を行います。',
    price: 10000,
    category: 'nutrition',
    partnerId: 'partner-5',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gift-6',
    name: 'ストレスチェック・メンタルケア',
    description: 'ストレス度測定とメンタルヘルスサポートを提供します。',
    price: 15000,
    category: 'mental_health',
    partnerId: 'partner-6',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gift-7',
    name: '骨密度測定・骨粗鬆症予防',
    description: '骨の健康状態チェックと予防アドバイスを提供します。',
    price: 12000,
    category: 'health_checkup',
    partnerId: 'partner-7',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gift-8',
    name: 'ホルモン検査・更年期サポート',
    description: 'ホルモンバランスチェックと更年期対策を提供します。',
    price: 25000,
    category: 'health_checkup',
    partnerId: 'partner-8',
    status: 'active',
    createdAt: new Date().toISOString()
  }
]

// 計算プロパティ
const isFormValid = computed(() => {
  return formData.value.recipientName &&
         formData.value.recipientEmail &&
         formData.value.gifterName &&
         formData.value.gifterEmail &&
         formData.value.message &&
         formData.value.agreeToTerms
})

// ギフトアイコンを取得
const getGiftIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'health_checkup': '🏥',
    'dental_care': '🦷',
    'beauty_treatment': '✨',
    'fitness': '💪',
    'nutrition': '🥗',
    'mental_health': '🧠'
  }
  return icons[category] || '🎁'
}

// カテゴリラベルを取得
const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    'health_checkup': '健康診断',
    'dental_care': '歯科ケア',
    'beauty_treatment': '美容ケア',
    'fitness': 'フィットネス',
    'nutrition': '栄養相談',
    'mental_health': 'メンタルヘルス'
  }
  return labels[category] || category
}

// 購入処理
const processPurchase = async () => {
  if (!isFormValid.value || !gift.value) return

  processing.value = true

  try {
    // シミュレーション用の遅延
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 実際の実装では、ここでAPIを呼び出して購入処理を行う
    const purchaseData = {
      giftId: gift.value.id,
      recipientName: formData.value.recipientName,
      recipientEmail: formData.value.recipientEmail,
      gifterName: formData.value.gifterName,
      gifterEmail: formData.value.gifterEmail,
      message: formData.value.message,
      amount: gift.value.price
    }

    console.log('購入データ:', purchaseData)

    // 購入完了画面に遷移
    router.push('/complete')
  } catch (error) {
    console.error('購入処理エラー:', error)
    alert('購入処理に失敗しました。もう一度お試しください。')
  } finally {
    processing.value = false
  }
}

// 戻る
const goBack = () => {
  router.back()
}

// 利用規約表示
const showTerms = () => {
  alert('利用規約を表示します（実装予定）')
}

// プライバシーポリシー表示
const showPrivacy = () => {
  alert('プライバシーポリシーを表示します（実装予定）')
}

// ギフトデータを取得
const fetchGift = async () => {
  const giftId = route.params.id as string
  
  // シミュレーション用の遅延
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const foundGift = giftsData.find(g => g.id === giftId)
  if (foundGift) {
    gift.value = foundGift
  }
  
  loading.value = false
}

onMounted(() => {
  fetchGift()
})
</script>

<style scoped>
.purchase {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* パンくずリスト */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.breadcrumb a {
  color: #667eea;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.separator {
  color: #7f8c8d;
}

/* 購入ヘッダー */
.purchase-header {
  text-align: center;
  margin-bottom: 3rem;
}

.purchase-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.purchase-header p {
  font-size: 1.2rem;
  color: #7f8c8d;
}

/* 購入グリッド */
.purchase-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 3rem;
  align-items: start;
}

/* ギフトサマリー */
.gift-summary {
  position: sticky;
  top: 2rem;
}

.gift-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.gift-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.gift-card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.gift-description {
  color: #7f8c8d;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.gift-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e74c3c;
  margin-bottom: 1rem;
}

.gift-category {
  background: #667eea;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  display: inline-block;
}

/* 購入フォーム */
.purchase-form {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ecf0f1;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* メッセージプレビュー */
.message-preview {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
}

.preview-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
}

.preview-content {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.gifter-name {
  font-weight: 600;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.message-text {
  color: #2c3e50;
  line-height: 1.5;
}

/* 決済デモ */
.payment-demo {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
}

.demo-input {
  background: #e9ecef;
  color: #6c757d;
}

.demo-note {
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 1rem;
  text-align: center;
}

/* チェックボックス */
.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #2c3e50;
}

.checkbox-input {
  margin-right: 0.5rem;
}

.checkbox-label a {
  color: #667eea;
  text-decoration: none;
}

.checkbox-label a:hover {
  text-decoration: underline;
}

/* 購入アクション */
.purchase-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.purchase-btn {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 1.2rem;
  padding: 1rem 3rem;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.purchase-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
}

.purchase-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  border: 2px solid #667eea;
  color: #667eea;
  background: white;
  font-size: 1.2rem;
  padding: 1rem 3rem;
  border-radius: 50px;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #667eea;
  color: white;
}

/* ローディング・エラー状態 */
.loading,
.error {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.back-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.back-link:hover {
  text-decoration: underline;
}

/* レスポンシブデザイン */
@media (max-width: 1024px) {
  .purchase-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .gift-summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .purchase-header h1 {
    font-size: 2rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .purchase-actions {
    flex-direction: column;
  }
  
  .purchase-form {
    padding: 2rem 1rem;
  }
}
</style> 