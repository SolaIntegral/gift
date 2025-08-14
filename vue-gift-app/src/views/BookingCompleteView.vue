<template>
  <div class="booking-complete">
    <div class="container">
      <!-- 完了メッセージ -->
      <div class="completion-message">
        <div class="success-icon">🎉</div>
        <h1>予約が完了しました！</h1>
        <p>健康ギフトの利用予約が正常に完了しました</p>
      </div>

      <!-- 予約詳細 -->
      <div class="booking-details">
        <h2>📋 予約詳細</h2>
        <div class="details-grid">
          <div class="detail-item">
            <span class="label">予約番号</span>
            <span class="value">{{ bookingNumber }}</span>
          </div>
          <div class="detail-item">
            <span class="label">ギフト名</span>
            <span class="value">{{ giftName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">利用予定日</span>
            <span class="value">{{ formatDate(bookingDate) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">利用時間</span>
            <span class="value">{{ bookingTime }}</span>
          </div>
          <div class="detail-item">
            <span class="label">施設名</span>
            <span class="value">{{ facilityName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">住所</span>
            <span class="value">{{ facilityAddress }}</span>
          </div>
        </div>
      </div>

      <!-- 利用手順 -->
      <div class="usage-steps">
        <h2>📝 利用手順</h2>
        <div class="steps-grid">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>予約確認</h3>
              <p>この画面の予約詳細を確認してください</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>施設到着</h3>
              <p>予約日時に施設にお越しください</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>受付</h3>
              <p>受付で予約番号をお伝えください</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">4</div>
            <div class="step-content">
              <h3>サービス利用</h3>
              <p>健康ギフトのサービスをお楽しみください</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 注意事項 -->
      <div class="important-notices">
        <h2>⚠️ ご利用時の注意事項</h2>
        <div class="notices-list">
          <div class="notice-item">
            <span class="notice-icon">📅</span>
            <span>予約日の前日までにキャンセルをご連絡ください</span>
          </div>
          <div class="notice-item">
            <span class="notice-icon">🕐</span>
            <span>予約時間の15分前にお越しください</span>
          </div>
          <div class="notice-item">
            <span class="notice-icon">📱</span>
            <span>予約番号を忘れた場合は、お電話でお問い合わせください</span>
          </div>
          <div class="notice-item">
            <span class="notice-icon">🏥</span>
            <span>体調が悪い場合は、無理をせずにご連絡ください</span>
          </div>
        </div>
      </div>

      <!-- 登録促進セクション -->
      <div class="registration-promotion">
        <div class="promotion-content">
          <div class="promotion-icon">🌟</div>
          <div class="promotion-text">
            <h3>アカウントを作成すると、もっと便利に！</h3>
            <p>ギフトの利用履歴や今後の予約管理が簡単になります</p>
            <div class="benefits-list">
              <div class="benefit-item">
                <span class="benefit-icon">📊</span>
                <span>利用履歴の管理</span>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon">🔔</span>
                <span>予約日のリマインダー</span>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon">💝</span>
                <span>新しいギフトの購入</span>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon">📱</span>
                <span>LINE通知の設定</span>
              </div>
            </div>
          </div>
          <div class="promotion-actions">
            <BaseButton
              @click="showLoginModal = true"
              size="lg"
              class="register-btn"
            >
              📝 アカウントを作成
            </BaseButton>
            <BaseButton
              @click="skipRegistration"
              variant="outline"
              size="lg"
              class="skip-btn"
            >
              後で作成
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- アクションボタン -->
      <div class="action-buttons">
        <BaseButton
          @click="downloadBookingDetails"
          variant="outline"
          size="lg"
          class="download-btn"
        >
          📥 予約詳細をダウンロード
        </BaseButton>
        
        <BaseButton
          @click="goToHome"
          size="lg"
          class="home-btn"
        >
          🏠 ホームに戻る
        </BaseButton>
      </div>
    </div>

    <!-- ログインモーダル -->
    <div v-if="showLoginModal" class="login-modal-overlay" @click="showLoginModal = false">
      <div class="login-modal" @click.stop>
        <div class="modal-header">
          <h3>🔐 アカウント作成・ログイン</h3>
          <button @click="showLoginModal = false" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-content">
          <div class="login-options">
            <BaseButton
              @click="loginWithLine"
              size="lg"
              class="line-login-btn"
            >
              📱 LINEでログイン
            </BaseButton>
            
            <BaseButton
              @click="loginWithEmail"
              variant="outline"
              size="lg"
              class="email-login-btn"
            >
              📧 メールでログイン
            </BaseButton>
          </div>
          
          <div class="login-benefits">
            <h4>アカウント作成のメリット：</h4>
            <ul>
              <li>予約履歴の永続化</li>
              <li>リマインダー通知</li>
              <li>新しいギフトの購入</li>
              <li>健康管理の継続サポート</li>
              <li>ギフトの再購入</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const route = useRoute()

const showLoginModal = ref(false)

// 予約情報（実際の実装ではAPIから取得）
const bookingNumber = ref('BK-2024-001')
const giftName = ref('総合健康診断パック')
const bookingDate = ref('2025-01-15')
const bookingTime = ref('10:00')
const facilityName = ref('健康診断センター 新宿店')
const facilityAddress = ref('東京都新宿区西新宿2-8-1')

// メソッド
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

const showLoginModal = () => {
  showLoginModal.value = true
}

const loginWithLine = () => {
  // 実際の実装ではLINEログイン処理
  alert('LINEログインが完了しました（デモ）')
  showLoginModal.value = false
}

const loginWithEmail = () => {
  // 実際の実装ではメールログイン処理
  alert('メールログインが完了しました（デモ）')
  showLoginModal.value = false
}

const skipRegistration = () => {
  alert('アカウント作成をスキップしました。いつでも作成できます。')
}

const downloadBookingDetails = () => {
  // 予約詳細をダウンロード
  const data = {
    bookingNumber: bookingNumber.value,
    giftName: giftName.value,
    bookingDate: bookingDate.value,
    bookingTime: bookingTime.value,
    facilityName: facilityName.value,
    facilityAddress: facilityAddress.value
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `booking-${bookingNumber.value}.json`
  link.click()
}

const goToHome = () => {
  router.push('/')
}

onMounted(() => {
  // URLパラメータから予約情報を取得（実際の実装）
  const urlParams = new URLSearchParams(window.location.search)
  const giftId = urlParams.get('giftId')
  
  if (giftId) {
    // ギフトIDに基づいて予約情報を取得
    console.log('ギフトID:', giftId)
  }
})
</script>

<style scoped>
.booking-complete {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 完了メッセージ */
.completion-message {
  text-align: center;
  margin-bottom: 3rem;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.completion-message h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.completion-message p {
  color: #7f8c8d;
  font-size: 1.2rem;
}

/* 予約詳細 */
.booking-details {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
}

.booking-details h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  text-align: center;
}

.details-grid {
  display: grid;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
}

.detail-item .label {
  color: #7f8c8d;
  font-weight: 600;
}

.detail-item .value {
  color: #2c3e50;
  font-weight: 500;
}

/* 利用手順 */
.usage-steps {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
}

.usage-steps h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  text-align: center;
}

.steps-grid {
  display: grid;
  gap: 1.5rem;
}

.step-item {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.step-number {
  background: #667eea;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.step-content h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.step-content p {
  color: #7f8c8d;
  line-height: 1.5;
}

/* 注意事項 */
.important-notices {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
}

.important-notices h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  text-align: center;
}

.notices-list {
  display: grid;
  gap: 1rem;
}

.notice-item {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: #fff3cd;
  border-radius: 10px;
  border-left: 4px solid #ffc107;
}

.notice-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.notice-item span:last-child {
  color: #856404;
  line-height: 1.4;
}

/* 登録促進セクション */
.registration-promotion {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 3rem;
  color: white;
}

.promotion-content {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 2rem;
  align-items: center;
}

.promotion-icon {
  font-size: 3rem;
}

.promotion-text h3 {
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.promotion-text p {
  opacity: 0.9;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.benefits-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.benefit-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.9rem;
}

.benefit-icon {
  font-size: 1.1rem;
}

.promotion-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.register-btn {
  background: white;
  color: #667eea;
  border: none;
  font-size: 1.1rem;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
}

.skip-btn {
  border: 2px solid white;
  color: white;
  background: transparent;
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
}

.skip-btn:hover {
  background: white;
  color: #667eea;
}

/* アクションボタン */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.download-btn {
  border: 2px solid #667eea;
  color: #667eea;
  background: white;
  font-size: 1.1rem;
  padding: 1rem 2rem;
  border-radius: 50px;
}

.home-btn {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 1.1rem;
  padding: 1rem 2rem;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.download-btn:hover {
  background: #667eea;
  color: white;
}

/* ログインモーダル */
.login-modal-overlay {
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

.login-modal {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.modal-header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #7f8c8d;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #2c3e50;
}

.login-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.line-login-btn {
  background: #00c300;
  border: none;
  color: white;
  font-size: 1.1rem;
  padding: 1rem 2rem;
  border-radius: 50px;
}

.email-login-btn {
  border: 2px solid #667eea;
  color: #667eea;
  background: white;
  font-size: 1.1rem;
  padding: 1rem 2rem;
  border-radius: 50px;
}

.login-benefits {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 15px;
}

.login-benefits h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.login-benefits ul {
  list-style: none;
  padding: 0;
}

.login-benefits li {
  color: #7f8c8d;
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.login-benefits li::before {
  content: '✓';
  color: #667eea;
  position: absolute;
  left: 0;
  font-weight: bold;
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
  .completion-message h1 {
    font-size: 2rem;
  }
  
  .promotion-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1rem;
  }
  
  .benefits-list {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .step-item {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .detail-item {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
}
</style> 