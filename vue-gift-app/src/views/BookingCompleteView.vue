<template>
  <div class="booking-complete">
    <div class="container">
      <!-- 完了ヘッダー -->
      <div class="complete-header">
        <div class="success-icon">✅</div>
        <h1>予約完了！</h1>
        <p>健康ギフトの利用予約が完了しました</p>
      </div>

      <!-- 予約詳細 -->
      <div class="booking-details">
        <div class="detail-card">
          <h3>📋 予約内容</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">予約番号</span>
              <span class="value">{{ bookingData.bookingNumber }}</span>
            </div>
            <div class="detail-item">
              <span class="label">利用施設</span>
              <span class="value">{{ bookingData.facilityName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">利用日時</span>
              <span class="value">{{ bookingData.date }} {{ bookingData.time }}</span>
            </div>
            <div class="detail-item">
              <span class="label">予約者</span>
              <span class="value">{{ bookingData.customerName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">連絡先</span>
              <span class="value">{{ bookingData.customerEmail }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 利用時の注意事項 -->
      <div class="important-info">
        <h3>⚠️ 利用時の注意事項</h3>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-icon">🕐</div>
            <div class="info-content">
              <h4>時間厳守</h4>
              <p>予約時間の10分前にはお越しください</p>
            </div>
          </div>
          <div class="info-item">
            <div class="info-icon">🆔</div>
            <div class="info-content">
              <h4>身分証明書</h4>
              <p>運転免許証やマイナンバーカードをご持参ください</p>
            </div>
          </div>
          <div class="info-item">
            <div class="info-icon">💊</div>
            <div class="info-content">
              <h4>服薬情報</h4>
              <p>現在服用中の薬がある場合は、お知らせください</p>
            </div>
          </div>
          <div class="info-item">
            <div class="info-icon">🚫</div>
            <div class="info-content">
              <h4>食事制限</h4>
              <p>検査前の食事制限がある場合は、事前にご確認ください</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 持ち物チェックリスト -->
      <div class="checklist">
        <h3>📝 持ち物チェックリスト</h3>
        <div class="checklist-items">
          <label class="checklist-item" v-for="item in checklistItems" :key="item.id">
            <input type="checkbox" v-model="item.checked" class="checklist-checkbox">
            <span class="checkmark"></span>
            <span class="item-text">{{ item.text }}</span>
          </label>
        </div>
      </div>

      <!-- 施設へのアクセス -->
      <div class="facility-access">
        <h3>📍 施設へのアクセス</h3>
        <div class="access-info">
          <div class="access-detail">
            <h4>{{ bookingData.facilityName }}</h4>
            <p class="address">{{ bookingData.facilityAddress }}</p>
            <div class="access-methods">
              <div class="access-method">
                <span class="method-icon">🚇</span>
                <span class="method-text">{{ bookingData.accessByTrain }}</span>
              </div>
              <div class="access-method">
                <span class="method-icon">🚌</span>
                <span class="method-text">{{ bookingData.accessByBus }}</span>
              </div>
              <div class="access-method">
                <span class="method-icon">🚗</span>
                <span class="method-text">{{ bookingData.accessByCar }}</span>
              </div>
            </div>
          </div>
          <div class="map-placeholder">
            <div class="map-icon">🗺️</div>
            <p>地図が表示されます</p>
            <small>実際の実装ではGoogle Maps等を埋め込み</small>
          </div>
        </div>
      </div>

      <!-- キャンセル・変更について -->
      <div class="cancellation-info">
        <h3>🔄 キャンセル・変更について</h3>
        <div class="cancellation-content">
          <p>予約の変更・キャンセルは利用日の3日前まで可能です。</p>
          <p>緊急の場合は、施設まで直接お電話でご連絡ください。</p>
          <div class="contact-info">
            <span class="contact-icon">📞</span>
            <span>{{ bookingData.facilityPhone }}</span>
          </div>
        </div>
      </div>

      <!-- アクションボタン -->
      <div class="action-buttons">
        <BaseButton
          @click="addToCalendar"
          size="lg"
          class="calendar-btn"
        >
          📅 カレンダーに追加
        </BaseButton>
        
        <BaseButton
          @click="startWellnessJourney"
          variant="outline"
          size="lg"
          class="wellness-btn"
        >
          🌟 ウェルネス・ジャーニーを始める
        </BaseButton>
        
        <BaseButton
          @click="goToJourneyLog"
          variant="outline"
          size="lg"
          class="journey-btn"
        >
          📚 ジャーニーログを見る
        </BaseButton>
      </div>

      <!-- サポート情報 -->
      <div class="support-info">
        <h3>❓ ご不明な点がございましたら</h3>
        <p>お客様サポートまでお気軽にお問い合わせください</p>
        <div class="support-contacts">
          <div class="contact-item">
            <span class="contact-icon">📧</span>
            <span>support@gifts.example.com</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon">📞</span>
            <span>0120-XXX-XXX（平日 9:00-18:00）</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()

// 予約データ（実際の実装ではAPIから取得）
const bookingData = ref({
  bookingNumber: 'BK' + Date.now().toString().slice(-8),
  facilityName: '東京健康診断センター',
  facilityAddress: '東京都渋谷区渋谷1-1-1',
  date: '2025年1月15日',
  time: '10:00',
  customerName: '田中 花子',
  customerEmail: 'hanako@example.com',
  facilityPhone: '03-1234-5678',
  accessByTrain: '渋谷駅から徒歩5分',
  accessByBus: '渋谷駅前バス停から徒歩3分',
  accessByCar: '駐車場あり（要予約）'
})

// チェックリスト
const checklistItems = ref([
  { id: 1, text: '身分証明書（運転免許証・マイナンバーカード等）', checked: false },
  { id: 2, text: '健康保険証', checked: false },
  { id: 3, text: '現在服用中の薬のリスト', checked: false },
  { id: 4, text: '前回の検査結果（ある場合）', checked: false },
  { id: 5, text: '予約確認書（この画面を印刷）', checked: false },
  { id: 6, text: '現金またはクレジットカード', checked: false }
])

// カレンダーに追加
const addToCalendar = () => {
  // 実際の実装では、カレンダーアプリに予約を追加
  alert('カレンダーに予約を追加しました！')
}

// ウェルネス・ジャーニーを始める
const startWellnessJourney = () => {
  router.push('/wellness-journey')
}

// ジャーニーログに移動
const goToJourneyLog = () => {
  router.push('/journey-log')
}

onMounted(() => {
  // ページタイトルを設定
  document.title = '予約完了 - GIFTS'
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

/* 完了ヘッダー */
.complete-header {
  text-align: center;
  margin-bottom: 3rem;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 1s ease-in-out;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.complete-header h1 {
  font-size: 2.5rem;
  color: #27ae60;
  margin-bottom: 1rem;
}

.complete-header p {
  font-size: 1.2rem;
  color: #7f8c8d;
}

/* 予約詳細 */
.booking-details {
  margin-bottom: 3rem;
}

.detail-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.detail-card h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  text-align: center;
}

.detail-grid {
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
  font-weight: 600;
  color: #2c3e50;
}

.detail-item .value {
  color: #667eea;
  font-weight: 600;
}

/* 重要情報 */
.important-info {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
}

.important-info h3 {
  color: #e74c3c;
  margin-bottom: 2rem;
  font-size: 1.3rem;
  text-align: center;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
}

.info-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.info-content h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.info-content p {
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* チェックリスト */
.checklist {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
}

.checklist h3 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.3rem;
  text-align: center;
}

.checklist-items {
  display: grid;
  gap: 1rem;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.checklist-item:hover {
  background: #e9ecef;
}

.checklist-checkbox {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #667eea;
  border-radius: 4px;
  position: relative;
  flex-shrink: 0;
}

.checklist-checkbox:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #667eea;
  font-weight: bold;
}

.item-text {
  color: #2c3e50;
  font-size: 0.95rem;
}

/* 施設アクセス */
.facility-access {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
}

.facility-access h3 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.3rem;
  text-align: center;
}

.access-info {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: start;
}

.access-detail h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.address {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.access-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.access-method {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.method-icon {
  font-size: 1.2rem;
}

.method-text {
  color: #2c3e50;
  font-size: 0.9rem;
}

.map-placeholder {
  background: #f8f9fa;
  border: 2px dashed #bdc3c7;
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  color: #7f8c8d;
}

.map-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.map-placeholder small {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.8rem;
}

/* キャンセル情報 */
.cancellation-info {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
}

.cancellation-info h3 {
  color: #f39c12;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  text-align: center;
}

.cancellation-content p {
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
  color: #667eea;
  font-weight: 600;
}

.contact-icon {
  font-size: 1.2rem;
}

/* アクションボタン */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}

.calendar-btn {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 1.2rem;
  padding: 1rem 3rem;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.calendar-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
}

.wellness-btn,
.journey-btn {
  border: 2px solid #667eea;
  color: #667eea;
  background: white;
  font-size: 1.2rem;
  padding: 1rem 3rem;
  border-radius: 50px;
  transition: all 0.3s ease;
}

.wellness-btn:hover,
.journey-btn:hover {
  background: #667eea;
  color: white;
}

/* サポート情報 */
.support-info {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.support-info h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.support-info p {
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.support-contacts {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.contact-icon {
  font-size: 1.2rem;
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
  .complete-header h1 {
    font-size: 2rem;
  }
  
  .access-info {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style> 