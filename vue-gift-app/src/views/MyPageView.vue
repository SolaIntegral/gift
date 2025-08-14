<template>
  <div class="my-page">
    <div class="container">
      <!-- ヘッダー -->
      <div class="page-header">
        <h1>👤 マイページ</h1>
        <p>あなたが贈った健康ギフトの履歴を確認できます</p>
      </div>

      <!-- ログイン状態 -->
      <div v-if="!isLoggedIn" class="login-section">
        <div class="login-card">
          <h3>🔐 ログインが必要です</h3>
          <p>ギフト履歴を確認するには、ログインしてください</p>
          
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
            <h4>ログインすると以下のことができます：</h4>
            <ul>
              <li>贈ったギフトの履歴確認</li>
              <li>ギフトの利用状況チェック</li>
              <li>お気に入りギフトの保存</li>
              <li>新しいギフトの購入</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- ログイン済みの場合 -->
      <div v-else class="user-content">
        <!-- ユーザー情報 -->
        <div class="user-info">
          <div class="user-card">
            <div class="user-avatar">
              <span class="avatar-icon">👤</span>
            </div>
            <div class="user-details">
              <h3>{{ userInfo.name }}</h3>
              <p class="user-email">{{ userInfo.email }}</p>
              <p class="member-since">会員登録日: {{ formatDate(userInfo.memberSince) }}</p>
            </div>
            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-number">{{ giftHistory.length }}</span>
                <span class="stat-label">贈ったギフト</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ activeGifts.length }}</span>
                <span class="stat-label">有効なギフト</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ギフト履歴 -->
        <div class="gift-history">
          <div class="section-header">
            <h3>🎁 贈ったギフトの履歴</h3>
            <div class="filter-options">
              <select v-model="statusFilter" class="filter-select">
                <option value="">全てのステータス</option>
                <option value="active">有効</option>
                <option value="used">利用済み</option>
                <option value="expired">期限切れ</option>
              </select>
            </div>
          </div>

          <div v-if="filteredGifts.length > 0" class="gifts-grid">
            <div 
              v-for="gift in filteredGifts" 
              :key="gift.id"
              class="gift-item"
            >
              <div class="gift-header">
                <div class="gift-icon">{{ getGiftIcon(gift.category) }}</div>
                <div class="gift-status" :class="gift.status">
                  {{ getStatusLabel(gift.status) }}
                </div>
              </div>
              
              <div class="gift-content">
                <h4 class="gift-name">{{ gift.name }}</h4>
                <p class="gift-description">{{ gift.description }}</p>
                
                <div class="gift-details">
                  <div class="detail-row">
                    <span class="label">贈った相手:</span>
                    <span class="value">{{ gift.recipientName }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">贈った日:</span>
                    <span class="value">{{ formatDate(gift.giftedDate) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">有効期限:</span>
                    <span class="value">{{ formatDate(gift.expiryDate) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">価格:</span>
                    <span class="value price">¥{{ gift.price.toLocaleString() }}</span>
                  </div>
                </div>

                <div class="gift-message">
                  <h5>メッセージ:</h5>
                  <p>"{{ gift.message }}"</p>
                </div>

                <div class="gift-actions">
                  <BaseButton
                    @click="viewGiftDetails(gift)"
                    variant="outline"
                    size="sm"
                    class="view-btn"
                  >
                    詳細を見る
                  </BaseButton>
                  
                  <BaseButton
                    @click="resendGift(gift)"
                    variant="outline"
                    size="sm"
                    class="resend-btn"
                  >
                    再送信
                  </BaseButton>
                  
                  <BaseButton
                    @click="checkUsageStatus(gift)"
                    :variant="gift.status === 'active' ? 'primary' : 'outline'"
                    size="sm"
                    class="status-btn"
                  >
                    {{ gift.status === 'active' ? '利用状況確認' : '利用済み' }}
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>

          <!-- ギフトがない場合 -->
          <div v-else class="no-gifts">
            <div class="no-gifts-icon">🎁</div>
            <h4>まだギフトを贈っていません</h4>
            <p>大切な人への健康ギフトを贈ってみませんか？</p>
            <BaseButton
              @click="goToGifts"
              size="lg"
              class="browse-gifts-btn"
            >
              🎁 ギフトを探す
            </BaseButton>
          </div>
        </div>

        <!-- お気に入りギフト -->
        <div class="favorite-gifts">
          <h3>❤️ お気に入りのギフト</h3>
          <div v-if="favoriteGifts.length > 0" class="favorites-grid">
            <div 
              v-for="gift in favoriteGifts" 
              :key="gift.id"
              class="favorite-item"
            >
              <div class="favorite-icon">{{ getGiftIcon(gift.category) }}</div>
              <h4>{{ gift.name }}</h4>
              <p class="favorite-price">¥{{ gift.price.toLocaleString() }}</p>
              <BaseButton
                @click="buyFavoriteGift(gift)"
                size="sm"
                class="buy-favorite-btn"
              >
                購入する
              </BaseButton>
            </div>
          </div>
          <div v-else class="no-favorites">
            <p>お気に入りのギフトはまだありません</p>
            <p>気に入ったギフトを❤️ボタンでお気に入りに追加できます</p>
          </div>
        </div>

        <!-- アクションボタン -->
        <div class="action-buttons">
          <BaseButton
            @click="goToGifts"
            size="lg"
            class="new-gift-btn"
          >
            🎁 新しいギフトを贈る
          </BaseButton>
          
          <BaseButton
            @click="logout"
            variant="outline"
            size="lg"
            class="logout-btn"
          >
            🚪 ログアウト
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()

const isLoggedIn = ref(false)
const statusFilter = ref('')

// ユーザー情報
const userInfo = ref({
  name: '田中 太郎',
  email: 'taro@example.com',
  memberSince: '2024-01-01'
})

// ギフト履歴（実際の実装ではAPIから取得）
const giftHistory = ref([
  {
    id: 'gift-1',
    name: '総合健康診断パック',
    description: '基本検査から詳細検査まで、健康状態を総合的にチェックできるパッケージです。',
    category: 'health_checkup',
    price: 15000,
    recipientName: '田中 花子',
    giftedDate: '2024-12-20',
    expiryDate: '2025-12-20',
    status: 'active',
    message: 'いつまでも元気でいてね。健康第一で頑張ってください。'
  },
  {
    id: 'gift-2',
    name: '歯科検診・クリーニング',
    description: '虫歯チェックと歯石除去で、お口の健康をサポートします。',
    category: 'dental_care',
    price: 8000,
    recipientName: '佐藤 美咲',
    giftedDate: '2024-11-15',
    expiryDate: '2025-11-15',
    status: 'used',
    message: '美しい笑顔を保ってね。歯の健康も大切です。'
  },
  {
    id: 'gift-3',
    name: '肌診断・美容相談',
    description: '肌の状態チェックと美容アドバイスを提供します。',
    category: 'beauty_treatment',
    price: 12000,
    recipientName: '高橋 愛',
    giftedDate: '2024-10-01',
    expiryDate: '2025-10-01',
    status: 'expired',
    message: '内側からも外側からも美しく。自信を持って。'
  }
])

// お気に入りギフト
const favoriteGifts = ref([
  {
    id: 'favorite-1',
    name: 'フィットネス評価・トレーニング',
    category: 'fitness',
    price: 18000
  },
  {
    id: 'favorite-2',
    name: '栄養相談・食事プラン',
    category: 'nutrition',
    price: 10000
  }
])

// 計算プロパティ
const activeGifts = computed(() => {
  return giftHistory.value.filter(gift => gift.status === 'active')
})

const filteredGifts = computed(() => {
  if (!statusFilter.value) return giftHistory.value
  return giftHistory.value.filter(gift => gift.status === statusFilter.value)
})

// メソッド
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

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'active': '有効',
    'used': '利用済み',
    'expired': '期限切れ'
  }
  return labels[status] || status
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loginWithLine = () => {
  // 実際の実装ではLINEログイン処理
  isLoggedIn.value = true
  alert('LINEログインが完了しました（デモ）')
}

const loginWithEmail = () => {
  // 実際の実装ではメールログイン処理
  isLoggedIn.value = true
  alert('メールログインが完了しました（デモ）')
}

const viewGiftDetails = (gift: any) => {
  // ギフト詳細画面に遷移
  console.log('ギフト詳細を表示:', gift)
}

const resendGift = (gift: any) => {
  // ギフト再送信処理
  alert(`${gift.recipientName}さんにギフトを再送信しました`)
}

const checkUsageStatus = (gift: any) => {
  if (gift.status === 'active') {
    alert(`${gift.recipientName}さんはまだギフトを利用していません`)
  } else {
    alert(`${gift.recipientName}さんは既にギフトを利用済みです`)
  }
}

const buyFavoriteGift = (gift: any) => {
  // お気に入りギフトの購入画面に遷移
  router.push(`/purchase/${gift.id}`)
}

const goToGifts = () => {
  router.push('/gifts')
}

const logout = () => {
  isLoggedIn.value = false
  alert('ログアウトしました')
}

onMounted(() => {
  // デモ用にログイン済み状態にする
  isLoggedIn.value = true
})
</script>

<style scoped>
.my-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* ページヘッダー */
.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.page-header p {
  font-size: 1.2rem;
  color: #7f8c8d;
}

/* ログインセクション */
.login-section {
  margin-bottom: 3rem;
}

.login-card {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.login-card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.login-card p {
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.login-options {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.line-login-btn {
  background: #00c300;
  border: none;
  color: white;
  font-size: 1.1rem;
  padding: 1rem 2rem;
  border-radius: 50px;
  box-shadow: 0 5px 15px rgba(0, 195, 0, 0.3);
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
  text-align: left;
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

/* ユーザー情報 */
.user-info {
  margin-bottom: 3rem;
}

.user-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 2rem;
  align-items: center;
}

.user-avatar {
  text-align: center;
}

.avatar-icon {
  font-size: 4rem;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 50%;
  display: block;
}

.user-details h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.user-email {
  color: #667eea;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.member-since {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.user-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* ギフト履歴 */
.gift-history {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h3 {
  color: #2c3e50;
  font-size: 1.5rem;
  margin: 0;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 2px solid #ecf0f1;
  border-radius: 10px;
  font-size: 1rem;
  background: white;
}

.gifts-grid {
  display: grid;
  gap: 2rem;
}

.gift-item {
  border: 2px solid #ecf0f1;
  border-radius: 15px;
  padding: 2rem;
  transition: all 0.3s ease;
}

.gift-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.1);
}

.gift-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.gift-icon {
  font-size: 3rem;
}

.gift-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.gift-status.active {
  background: #d4edda;
  color: #155724;
}

.gift-status.used {
  background: #d1ecf1;
  color: #0c5460;
}

.gift-status.expired {
  background: #f8d7da;
  color: #721c24;
}

.gift-content h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.gift-description {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.gift-details {
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #ecf0f1;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  color: #7f8c8d;
  font-weight: 600;
}

.detail-row .value {
  color: #2c3e50;
}

.detail-row .value.price {
  color: #e74c3c;
  font-weight: 700;
}

.gift-message {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.gift-message h5 {
  color: #667eea;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.gift-message p {
  color: #2c3e50;
  font-style: italic;
  margin: 0;
}

.gift-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.view-btn,
.resend-btn,
.status-btn {
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
}

/* お気に入りギフト */
.favorite-gifts {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
}

.favorite-gifts h3 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.favorite-item {
  text-align: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 15px;
  transition: all 0.3s ease;
}

.favorite-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.favorite-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.favorite-item h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.favorite-price {
  color: #e74c3c;
  font-weight: 700;
  margin-bottom: 1rem;
}

.buy-favorite-btn {
  background: #667eea;
  border: none;
  color: white;
  width: 100%;
}

.no-favorites {
  text-align: center;
  color: #7f8c8d;
  padding: 2rem;
}

.no-favorites p {
  margin-bottom: 0.5rem;
}

/* ギフトがない場合 */
.no-gifts {
  text-align: center;
  padding: 4rem 2rem;
  color: #7f8c8d;
}

.no-gifts-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-gifts h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.no-gifts p {
  margin-bottom: 2rem;
}

.browse-gifts-btn {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 1.2rem;
  padding: 1rem 3rem;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

/* アクションボタン */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.new-gift-btn {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 1.2rem;
  padding: 1rem 3rem;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.logout-btn {
  border: 2px solid #e74c3c;
  color: #e74c3c;
  background: white;
  font-size: 1.2rem;
  padding: 1rem 3rem;
  border-radius: 50px;
}

.logout-btn:hover {
  background: #e74c3c;
  color: white;
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }
  
  .user-card {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1rem;
  }
  
  .user-stats {
    justify-content: center;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .gift-actions {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .login-options {
    flex-direction: column;
  }
}
</style> 