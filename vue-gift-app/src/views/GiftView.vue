<template>
  <div class="gift-view">
    <div class="gift-header">
      <div class="container">
        <h1>🎁 健康のギフトが届きました！</h1>
        <p>大切な人からの想いが込められた健康ギフトです</p>
      </div>
    </div>

    <div class="container">
      <div class="gift-content">
        <!-- ローディング状態 -->
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>ギフトを読み込み中...</p>
        </div>

        <!-- エラー状態 -->
        <div v-else-if="error" class="error-message">
          <div class="error-icon">❌</div>
          <h3>ギフトが見つかりません</h3>
          <p>{{ error }}</p>
          <p>URLが正しいかご確認ください。</p>
        </div>

        <!-- ギフト詳細 -->
        <div v-else-if="gift" class="gift-details">
          <!-- 贈り主情報 -->
          <div class="sender-info">
            <div class="sender-avatar">💝</div>
            <div class="sender-details">
              <h3>{{ gift.senderName }}様より</h3>
              <p class="gift-date">{{ formatDate(gift.createdAt) }}</p>
            </div>
          </div>

          <!-- メッセージ -->
          <div v-if="gift.message" class="message-section">
            <h4>💌 メッセージ</h4>
            <div class="message-content">
              <p>{{ gift.message }}</p>
            </div>
          </div>

          <!-- ギフト詳細 -->
          <div class="gift-item">
            <div class="gift-icon">{{ gift.icon || '🎁' }}</div>
            <div class="gift-info">
              <h2>{{ gift.name }}</h2>
              <p class="gift-description">{{ gift.description }}</p>
              <div class="gift-price">¥{{ gift.price.toLocaleString() }}</div>
            </div>
          </div>

          <!-- 含まれるサービス -->
          <div v-if="gift.services && gift.services.length > 0" class="services-section">
            <h4>📋 含まれるサービス</h4>
            <ul class="services-list">
              <li v-for="service in gift.services" :key="service">{{ service }}</li>
            </ul>
          </div>

          <!-- 提携施設 -->
          <div v-if="gift.facility" class="facility-section">
            <h4>🏥 提携施設</h4>
            <div class="facility-info">
              <h5>{{ gift.facility.name }}</h5>
              <p>{{ gift.facility.address }}</p>
              <p>📞 {{ gift.facility.phone }}</p>
            </div>
            <div class="facility-note">
              <p>※ご利用時は事前予約が必要です</p>
            </div>
          </div>

          <!-- 利用方法 -->
          <div class="usage-section">
            <h4>📱 ご利用方法</h4>
            <div class="usage-steps">
              <div class="step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h5>提携施設に電話またはWebで予約</h5>
                  <p>上記の提携施設にお電話またはWebサイトからご予約ください。</p>
                </div>
              </div>
              <div class="step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h5>来店時に下記のQRコードを提示</h5>
                  <p>ご来店時に下記のQRコードまたはギフトIDを提示してください。</p>
                </div>
              </div>
              <div class="step">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h5>サービスをお楽しみください</h5>
                  <p>健康サービスをお楽しみください。</p>
                </div>
              </div>
            </div>
          </div>

          <!-- QRコード -->
          <div class="qr-section">
            <h4>📱 利用時に提示するQRコード</h4>
            <div class="qr-code">
              <div class="qr-placeholder">
                <div class="qr-text">{{ giftId }}</div>
                <p>このQRコードを提携施設で提示してください</p>
              </div>
            </div>
          </div>

          <!-- 有効期限 -->
          <div class="expiry-section">
            <h4>⏰ 有効期限</h4>
            <div class="expiry-info">
              <p class="expiry-date">{{ formatExpiryDate(gift.expiryDate) }}まで</p>
              <p class="expiry-note">期限内にご利用ください</p>
            </div>
          </div>

          <!-- アクションボタン -->
          <div class="gift-actions">
            <button @click="shareGift" class="btn btn-primary">
              📤 このギフトを共有
            </button>
            <button @click="viewUsageGuide" class="btn btn-secondary">
              📖 利用方法を詳しく見る
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 状態
const loading = ref(true)
const error = ref<string | null>(null)
const gift = ref<any>(null)
const giftId = ref('')

// モックギフトデータ
const mockGift = {
  id: 'gift_lq1768gcx',
  senderName: '田中花子',
  message: 'いつまでも元気でいてね',
  name: '総合健康診断パック',
  description: '詳細な血液検査から画像診断まで、総合的な健康状態をチェックできます。',
  price: 15400,
  icon: '🏥',
  category: 'health_checkup',
  services: [
    '詳細血液検査',
    '胸部X線検査',
    '心電図検査',
    '医師による結果説明'
  ],
  facility: {
    name: '健康クリニック東京',
    address: '東京都渋谷区○○○ 1-2-3',
    phone: '03-1234-5678'
  },
  createdAt: '2024-01-15T10:00:00Z',
  expiryDate: '2024-12-31T23:59:59Z'
}

// 初期化
onMounted(async () => {
  try {
    // URLからギフトIDを取得
    giftId.value = route.params.id as string
    
    // モックデータを使用（実際のAPIでは、ギフトIDでデータを取得）
    await new Promise(resolve => setTimeout(resolve, 1000)) // ローディングシミュレーション
    
    if (giftId.value === 'gift_lq1768gcx') {
      gift.value = mockGift
    } else {
      error.value = '指定されたギフトが見つかりません'
    }
  } catch (err) {
    error.value = 'ギフトの読み込みに失敗しました'
  } finally {
    loading.value = false
  }
})

// 日付フォーマット
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 有効期限フォーマット
const formatExpiryDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// ギフトを共有
const shareGift = () => {
  const shareText = `${gift.value.senderName}様から健康のギフトが届きました！\n${window.location.href}`
  
  if (navigator.share) {
    navigator.share({
      title: '健康のギフトが届きました',
      text: shareText,
      url: window.location.href
    })
  } else {
    // フォールバック: クリップボードにコピー
    navigator.clipboard.writeText(shareText)
    alert('ギフトURLをクリップボードにコピーしました！')
  }
}

// 利用方法ガイドを表示
const viewUsageGuide = () => {
  alert('利用方法の詳細ガイドを表示します（実装予定）')
}
</script>

<style scoped>
.gift-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.gift-header {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  padding: 3rem 0;
  text-align: center;
}

.gift-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.gift-header p {
  font-size: 1.25rem;
  opacity: 0.9;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.gift-content {
  background: white;
  border-radius: 16px;
  margin: 2rem 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* ローディング状態 */
.loading {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* エラーメッセージ */
.error-message {
  text-align: center;
  padding: 4rem 2rem;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-message h3 {
  color: var(--color-danger);
  margin-bottom: 1rem;
}

.error-message p {
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

/* ギフト詳細 */
.gift-details {
  padding: 2rem;
}

/* 贈り主情報 */
.sender-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
}

.sender-avatar {
  font-size: 3rem;
}

.sender-details h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-primary);
  font-size: 1.25rem;
}

.gift-date {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

/* メッセージ */
.message-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  border-radius: 12px;
  border-left: 4px solid #f39c12;
}

.message-section h4 {
  margin: 0 0 1rem 0;
  color: #d68910;
}

.message-content p {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.6;
  color: #2c3e50;
}

/* ギフトアイテム */
.gift-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border-radius: 12px;
  border: 2px solid var(--color-primary);
}

.gift-icon {
  font-size: 4rem;
  flex-shrink: 0;
}

.gift-info h2 {
  margin: 0 0 1rem 0;
  color: var(--color-primary);
  font-size: 1.5rem;
}

.gift-description {
  margin: 0 0 1rem 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.gift-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
}

/* サービス一覧 */
.services-section {
  margin-bottom: 2rem;
}

.services-section h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--color-orange-light);
  padding-bottom: 0.5rem;
}

.services-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.services-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #e9ecef;
  color: var(--color-text-primary);
}

.services-list li:last-child {
  border-bottom: none;
}

/* 提携施設 */
.facility-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.facility-section h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.facility-info h5 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text-primary);
}

.facility-info p {
  margin: 0 0 0.25rem 0;
  color: var(--color-text-secondary);
}

.facility-note {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fff3cd;
  border-radius: 8px;
  border-left: 4px solid #f39c12;
}

.facility-note p {
  margin: 0;
  color: #856404;
  font-size: 0.9rem;
}

/* 利用方法 */
.usage-section {
  margin-bottom: 2rem;
}

.usage-section h4 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}

.usage-steps {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
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
  font-weight: 700;
  flex-shrink: 0;
}

.step-content h5 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text-primary);
}

.step-content p {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* QRコード */
.qr-section {
  margin-bottom: 2rem;
  text-align: center;
}

.qr-section h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.qr-code {
  display: inline-block;
  padding: 2rem;
  background: white;
  border: 2px solid var(--color-primary);
  border-radius: 12px;
}

.qr-placeholder {
  text-align: center;
}

.qr-text {
  font-family: monospace;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.qr-placeholder p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

/* 有効期限 */
.expiry-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  border-radius: 12px;
  border-left: 4px solid #28a745;
}

.expiry-section h4 {
  color: #155724;
  margin-bottom: 1rem;
}

.expiry-date {
  font-size: 1.1rem;
  font-weight: 600;
  color: #155724;
  margin: 0 0 0.5rem 0;
}

.expiry-note {
  margin: 0;
  color: #155724;
  font-size: 0.9rem;
}

/* アクションボタン */
.gift-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
}

.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.btn-secondary:hover {
  background: var(--color-primary);
  color: white;
}

/* レスポンシブ */
@media (max-width: 768px) {
  .gift-header h1 {
    font-size: 2rem;
  }
  
  .gift-header p {
    font-size: 1rem;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .gift-details {
    padding: 1.5rem;
  }
  
  .gift-item {
    flex-direction: column;
    text-align: center;
  }
  
  .gift-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style> 