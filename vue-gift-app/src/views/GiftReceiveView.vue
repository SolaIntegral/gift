<template>
  <div class="gift-receive">
    <div class="container">
      <!-- ギフト受け取りヘッダー -->
      <div class="receive-header">
        <div class="gift-icon-large">🎁</div>
        <h1>ギフトが届きました！</h1>
        <p>大切な人からの想いが込められた健康ギフトです</p>
      </div>

      <!-- ギフト情報 -->
      <div v-if="giftData" class="gift-content">
        <!-- GIFTERからのメッセージ -->
        <div class="message-section">
          <div class="message-card">
            <div class="gifter-info">
              <div class="gifter-avatar">👤</div>
              <div class="gifter-details">
                <h3>{{ giftData.gifterName }}より、心を込めて</h3>
                <p class="gift-date">{{ formatDate(giftData.createdAt) }}</p>
              </div>
            </div>
            <div class="message-content">
              <p>{{ giftData.message }}</p>
            </div>
          </div>
        </div>

        <!-- ギフトの詳細 -->
        <div class="gift-details">
          <div class="gift-card">
            <div class="gift-icon">{{ getGiftIcon(giftData.gift.category) }}</div>
            <h3>{{ giftData.gift.name }}</h3>
            <p class="gift-description">{{ giftData.gift.description }}</p>
            <div class="gift-category">{{ getCategoryLabel(giftData.gift.category) }}</div>
          </div>
        </div>

        <!-- 利用方法 -->
        <div class="usage-info">
          <h3>📋 利用方法</h3>
          <div class="usage-steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>予約する</h4>
                <p>希望する日時と施設を選択して予約を行います</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>施設で利用</h4>
                <p>予約した日時に施設を訪れてサービスを受けます</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>健康管理</h4>
                <p>結果を基に継続的な健康管理を行います</p>
              </div>
            </div>
          </div>
        </div>

        <!-- アクションボタン -->
        <div class="action-buttons">
          <BaseButton
            @click="proceedToBooking"
            size="lg"
            class="booking-btn"
          >
            📅 利用予約をする
          </BaseButton>
          
          <BaseButton
            @click="startWellnessJourney"
            variant="outline"
            size="lg"
            class="wellness-btn"
          >
            🌟 ウェルネス・ジャーニーを始める
          </BaseButton>
        </div>

        <!-- よくある質問 -->
        <div class="faq-section">
          <h3>❓ よくある質問</h3>
          <div class="faq-list">
            <div class="faq-item">
              <h4>Q: 有効期限はありますか？</h4>
              <p>A: 購入から1年間有効です。期限内にご利用ください。</p>
            </div>
            <div class="faq-item">
              <h4>Q: どの地域で利用できますか？</h4>
              <p>A: 全国の提携医療機関・健康施設でご利用いただけます。</p>
            </div>
            <div class="faq-item">
              <h4>Q: 予約の変更は可能ですか？</h4>
              <p>A: 利用日の3日前までであれば変更可能です。</p>
            </div>
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
        <p>URLが正しいかご確認ください。</p>
      </div>
    </div>

    <!-- ウェルネス・ジャーニーのフローティングボタン -->
    <div class="floating-wellness-btn" @click="startWellnessJourney">
      <span class="btn-icon">🌟</span>
      <span class="btn-text">ウェルネス・ジャーニー</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { Gift } from '@/types'

const route = useRoute()
const router = useRouter()

const giftData = ref<any>(null)
const loading = ref(true)

// ギフトデータ（実際の実装ではAPIから取得）
const mockGiftData = {
  id: 'gift_receive_123',
  gifterName: '田中 太郎',
  message: 'いつまでも元気でいてね。健康第一で頑張ってください。あなたの笑顔が一番の宝物です。',
  createdAt: new Date().toISOString(),
  gift: {
    id: 'gift-1',
    name: '総合健康診断パック',
    description: '基本検査から詳細検査まで、健康状態を総合的にチェックできるパッケージです。生活習慣病の早期発見から、がん検診まで幅広く対応しています。',
    price: 15000,
    category: 'health_checkup',
    partnerId: 'partner-1',
    status: 'active',
    createdAt: new Date().toISOString()
  }
}

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

// 日付をフォーマット
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 予約に進む
const proceedToBooking = () => {
  if (giftData.value) {
    router.push(`/booking/${giftData.value.id}`)
  }
}

// ウェルネス・ジャーニーを始める
const startWellnessJourney = () => {
  router.push('/wellness-journey')
}

// ギフトデータを取得
const fetchGiftData = async () => {
  const uniqueId = route.params.uniqueId as string
  
  // シミュレーション用の遅延
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 実際の実装では、uniqueIdを使ってAPIからギフトデータを取得
  // ここではモックデータを使用
  giftData.value = mockGiftData
  
  loading.value = false
}

onMounted(() => {
  fetchGiftData()
})
</script>

<style scoped>
.gift-receive {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
  position: relative;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 受け取りヘッダー */
.receive-header {
  text-align: center;
  margin-bottom: 3rem;
}

.gift-icon-large {
  font-size: 5rem;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
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

.receive-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.receive-header p {
  font-size: 1.2rem;
  color: #7f8c8d;
}

/* メッセージセクション */
.message-section {
  margin-bottom: 3rem;
}

.message-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-left: 5px solid #667eea;
}

.gifter-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.gifter-avatar {
  font-size: 2rem;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 50%;
}

.gifter-details h3 {
  color: #667eea;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.gift-date {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.message-content p {
  color: #2c3e50;
  font-size: 1.1rem;
  line-height: 1.6;
  font-style: italic;
}

/* ギフト詳細 */
.gift-details {
  margin-bottom: 3rem;
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
  font-size: 1.5rem;
}

.gift-description {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.gift-category {
  background: #667eea;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  font-size: 0.9rem;
  display: inline-block;
}

/* 利用方法 */
.usage-info {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
}

.usage-info h3 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.3rem;
  text-align: center;
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
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.step-content h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.step-content p {
  color: #7f8c8d;
  line-height: 1.5;
}

/* アクションボタン */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}

.booking-btn {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 1.2rem;
  padding: 1rem 3rem;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.booking-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
}

.wellness-btn {
  border: 2px solid #667eea;
  color: #667eea;
  background: white;
  font-size: 1.2rem;
  padding: 1rem 3rem;
  border-radius: 50px;
  transition: all 0.3s ease;
}

.wellness-btn:hover {
  background: #667eea;
  color: white;
}

/* よくある質問 */
.faq-section {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
}

.faq-section h3 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.3rem;
  text-align: center;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.faq-item {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 15px;
  border-left: 4px solid #667eea;
}

.faq-item h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.faq-item p {
  color: #7f8c8d;
  line-height: 1.5;
}

/* フローティングボタン */
.floating-wellness-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1000;
}

.floating-wellness-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
}

.btn-icon {
  font-size: 1.2rem;
}

.btn-text {
  font-weight: 600;
  white-space: nowrap;
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

/* レスポンシブデザイン */
@media (max-width: 768px) {
  .receive-header h1 {
    font-size: 2rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .floating-wellness-btn {
    bottom: 1rem;
    right: 1rem;
    padding: 0.75rem 1rem;
  }
  
  .btn-text {
    display: none;
  }
}
</style> 