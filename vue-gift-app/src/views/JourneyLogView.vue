<template>
  <div class="journey-log">
    <div class="container">
      <!-- ヘッダー -->
      <div class="page-header">
        <h1>📚 ウェルネス・ジャーニー記録</h1>
        <p>あなたの健康への想いと成長の記録を振り返りましょう</p>
      </div>

      <!-- ログイン状態 -->
      <div v-if="!isLoggedIn" class="login-section">
        <div class="login-card">
          <h3>🔐 ログインが必要です</h3>
          <p>ウェルネス・ジャーニーの記録を確認するには、ログインしてください</p>
          
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
        </div>
      </div>

      <!-- ログイン済みの場合 -->
      <div v-else class="user-content">
        <!-- ユーザー情報 -->
        <div class="user-info">
          <div class="user-card">
            <div class="user-avatar">
              <span class="avatar-icon">🌟</span>
            </div>
            <div class="user-details">
              <h3>{{ userInfo.name }}</h3>
              <p class="user-email">{{ userInfo.email }}</p>
              <p class="journey-stats">
                開始日: {{ formatDate(userInfo.journeyStartDate) }} | 
                記録数: {{ journeyRecords.length }}件
              </p>
            </div>
            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-number">{{ journeyRecords.length }}</span>
                <span class="stat-label">記録数</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ completedJourneys.length }}</span>
                <span class="stat-label">完了</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 最新のウェルネス宣言 -->
        <div v-if="latestWellnessDeclaration" class="latest-declaration">
          <h3>🌟 最新のウェルネス宣言</h3>
          <div class="declaration-card">
            <div class="declaration-content">
              <h4>"{{ latestWellnessDeclaration.title }}"</h4>
              <p class="declaration-text">{{ latestWellnessDeclaration.content }}</p>
              <div class="declaration-date">
                作成日: {{ formatDate(latestWellnessDeclaration.createdAt) }}
              </div>
            </div>
            <div class="declaration-image">
              <div class="image-placeholder">
                <span class="image-icon">🖼️</span>
                <p>ウェルネス宣言画像</p>
              </div>
              <div class="image-actions">
                <BaseButton
                  @click="downloadImage(latestWellnessDeclaration)"
                  variant="outline"
                  size="sm"
                  class="download-btn"
                >
                  📥 ダウンロード
                </BaseButton>
                <BaseButton
                  @click="shareImage(latestWellnessDeclaration)"
                  variant="outline"
                  size="sm"
                  class="share-btn"
                >
                  📤 共有
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        <!-- ジャーニー記録一覧 -->
        <div class="journey-records">
          <div class="section-header">
            <h3>📖 ジャーニー記録一覧</h3>
            <div class="filter-options">
              <select v-model="categoryFilter" class="filter-select">
                <option value="">全てのカテゴリ</option>
                <option value="future">未来と夢</option>
                <option value="relationships">大切な人</option>
                <option value="past">過去と現在</option>
                <option value="health">健康への接続</option>
              </select>
            </div>
          </div>

          <div v-if="filteredRecords.length > 0" class="records-grid">
            <div 
              v-for="record in filteredRecords" 
              :key="record.id"
              class="record-item"
              :class="record.status"
            >
              <div class="record-header">
                <div class="record-icon">{{ getCategoryIcon(record.category) }}</div>
                <div class="record-status" :class="record.status">
                  {{ getStatusLabel(record.status) }}
                </div>
              </div>
              
              <div class="record-content">
                <h4 class="record-title">{{ record.title }}</h4>
                <p class="record-description">{{ record.description }}</p>
                
                <div class="record-details">
                  <div class="detail-row">
                    <span class="label">カテゴリ:</span>
                    <span class="value">{{ getCategoryLabel(record.category) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">開始日:</span>
                    <span class="value">{{ formatDate(record.startDate) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">質問数:</span>
                    <span class="value">{{ record.questionCount }}問</span>
                  </div>
                </div>

                <div class="record-actions">
                  <BaseButton
                    @click="viewRecordDetails(record)"
                    variant="outline"
                    size="sm"
                    class="view-btn"
                  >
                    詳細を見る
                  </BaseButton>
                  
                  <BaseButton
                    v-if="record.status === 'in_progress'"
                    @click="continueJourney(record)"
                    size="sm"
                    class="continue-btn"
                  >
                    続きを始める
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>

          <!-- 記録がない場合 -->
          <div v-else class="no-records">
            <div class="no-records-icon">📚</div>
            <h4>まだウェルネス・ジャーニーを始めていません</h4>
            <p>自分自身の健康と未来について考えてみませんか？</p>
            <BaseButton
              @click="startNewJourney"
              size="lg"
              class="start-journey-btn"
            >
              🌟 新しいジャーニーを始める
            </BaseButton>
          </div>
        </div>

        <!-- アクションボタン -->
        <div class="action-buttons">
          <BaseButton
            @click="startNewJourney"
            size="lg"
            class="new-journey-btn"
          >
            🌟 新しいジャーニーを始める
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
const categoryFilter = ref('')

// ユーザー情報
const userInfo = ref({
  name: '田中 花子',
  email: 'hanako@example.com',
  journeyStartDate: '2024-01-01'
})

// ジャーニー記録
const journeyRecords = ref([
  {
    id: 'journey-1',
    title: '未来への夢と健康',
    description: '10年後の自分がどこで、誰と、どんな風に笑っていたいかを考えました。',
    category: 'future',
    status: 'completed',
    startDate: '2024-12-01',
    questionCount: 8
  },
  {
    id: 'journey-2',
    title: '大切な人との絆',
    description: '贈ってくれた人への感謝と、大切な人への想いを深めました。',
    category: 'relationships',
    status: 'completed',
    startDate: '2024-11-15',
    questionCount: 6
  }
])

// 計算プロパティ
const completedJourneys = computed(() => {
  return journeyRecords.value.filter(record => record.status === 'completed')
})

const latestWellnessDeclaration = computed(() => {
  return {
    title: '世界一周への道のり',
    content: '私は、家族と世界一周するという夢を叶えるため、まずは自分の体を大切にすることから始めます！',
    createdAt: '2024-12-05'
  }
})

const filteredRecords = computed(() => {
  if (!categoryFilter.value) return journeyRecords.value
  return journeyRecords.value.filter(record => record.category === categoryFilter.value)
})

// メソッド
const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'future': '🎯',
    'relationships': '💕',
    'past': '📚',
    'health': '🏥'
  }
  return icons[category] || '🌟'
}

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    'future': '未来と夢',
    'relationships': '大切な人',
    'past': '過去と現在',
    'health': '健康への接続'
  }
  return labels[category] || category
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'completed': '完了',
    'in_progress': '進行中',
    'paused': '一時停止'
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
  isLoggedIn.value = true
  alert('LINEログインが完了しました（デモ）')
}

const loginWithEmail = () => {
  isLoggedIn.value = true
  alert('メールログインが完了しました（デモ）')
}

const viewRecordDetails = (record: any) => {
  console.log('記録詳細を表示:', record)
}

const continueJourney = (record: any) => {
  router.push(`/wellness-journey?continue=${record.id}`)
}

const startNewJourney = () => {
  router.push('/wellness-journey')
}

const downloadImage = (declaration: any) => {
  alert('画像をダウンロードしました（デモ）')
}

const shareImage = (declaration: any) => {
  alert('画像を共有しました（デモ）')
}

const logout = () => {
  isLoggedIn.value = false
  alert('ログアウトしました')
}

onMounted(() => {
  isLoggedIn.value = true
})
</script>

<style scoped>
.journey-log {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

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

.journey-stats {
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

.latest-declaration {
  margin-bottom: 3rem;
}

.latest-declaration h3 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  text-align: center;
}

.declaration-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: center;
}

.declaration-content h4 {
  color: #667eea;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  font-style: italic;
}

.declaration-text {
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.declaration-date {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.declaration-image {
  text-align: center;
}

.image-placeholder {
  background: #f8f9fa;
  border: 2px dashed #bdc3c7;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 1rem;
}

.image-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
}

.image-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.download-btn,
.share-btn {
  font-size: 0.8rem;
  padding: 0.5rem 0.75rem;
}

.journey-records {
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

.records-grid {
  display: grid;
  gap: 2rem;
}

.record-item {
  border: 2px solid #ecf0f1;
  border-radius: 15px;
  padding: 2rem;
  transition: all 0.3s ease;
}

.record-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.1);
}

.record-item.completed {
  border-left: 5px solid #27ae60;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.record-icon {
  font-size: 2.5rem;
}

.record-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.record-status.completed {
  background: #d4edda;
  color: #155724;
}

.record-content h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.record-description {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.record-details {
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

.record-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.view-btn,
.continue-btn {
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
}

.continue-btn {
  background: #667eea;
  border: none;
  color: white;
}

.no-records {
  text-align: center;
  padding: 4rem 2rem;
  color: #7f8c8d;
}

.no-records-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-records h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.no-records p {
  margin-bottom: 2rem;
}

.start-journey-btn {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 1.2rem;
  padding: 1rem 3rem;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.new-journey-btn {
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
  
  .declaration-card {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .record-actions {
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