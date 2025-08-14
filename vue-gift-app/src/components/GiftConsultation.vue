<template>
  <div class="gift-consultation">
    <div class="consultation-header">
      <h2>🎁 健康ギフト相談</h2>
      <p>いくつかの質問にお答えいただき、最適な健康ギフトをご提案いたします</p>
    </div>

    <!-- 相談フォーム -->
    <form v-if="!showRecommendations" @submit.prevent="findGifts" class="consultation-form">
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
            <option value="newyear">お正月</option>
            <option value="graduation">卒業・入学</option>
            <option value="other">その他</option>
          </select>
        </div>
      </div>

      <div class="form-actions">
        <BaseButton 
          type="submit" 
          :loading="loading"
          :disabled="!isFormValid"
          class="submit-button"
        >
          {{ loading ? '検索中...' : 'ギフトを提案してもらう' }}
        </BaseButton>
      </div>
    </form>

    <!-- ギフト推薦結果 -->
    <div v-if="showRecommendations" class="recommendations">
      <div class="recommendations-header">
        <h3>🎯 あなたに合うギフト</h3>
        <p>条件に合う{{ filteredGifts.length }}件のギフトが見つかりました</p>
        <BaseButton @click="backToForm" variant="outline" size="sm">
          ← 条件を変更する
        </BaseButton>
      </div>

      <!-- フィルタリングオプション -->
      <div class="filter-options">
        <div class="filter-group">
          <label>カテゴリで絞り込み:</label>
          <div class="filter-buttons">
            <button 
              v-for="category in availableCategories" 
              :key="category.value"
              @click="toggleCategoryFilter(category.value)"
              :class="['filter-btn', { active: selectedCategories.includes(category.value) }]"
            >
              {{ category.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- ギフト一覧 -->
      <div v-if="filteredGifts.length > 0" class="gifts-grid">
        <div 
          v-for="gift in filteredGifts" 
          :key="gift.id"
          class="gift-card"
          @click="selectGift(gift)"
        >
          <div class="gift-image">
            <span class="gift-icon">{{ getGiftIcon(gift.category) }}</span>
          </div>
          <div class="gift-info">
            <h4 class="gift-name">{{ gift.name }}</h4>
            <p class="gift-description">{{ gift.description }}</p>
            <div class="gift-meta">
              <span class="gift-price">¥{{ gift.price.toLocaleString() }}</span>
              <span class="gift-category">{{ getCategoryLabel(gift.category) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ギフトが見つからない場合 -->
      <div v-else class="no-gifts">
        <p>条件に合うギフトが見つかりませんでした。</p>
        <p>条件を変更して再度お試しください。</p>
        <BaseButton @click="backToForm" class="mt-2">
          条件を変更する
        </BaseButton>
      </div>
    </div>

    <!-- 選択されたギフトの詳細 -->
    <div v-if="selectedGift" class="selected-gift-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>選択されたギフト</h3>
          <button @click="selectedGift = null" class="close-btn">&times;</button>
        </div>
        <div class="gift-detail">
          <div class="gift-image-large">
            <span class="gift-icon-large">{{ getGiftIcon(selectedGift.category) }}</span>
          </div>
          <h4>{{ selectedGift.name }}</h4>
          <p>{{ selectedGift.description }}</p>
          <div class="gift-price-large">¥{{ selectedGift.price.toLocaleString() }}</div>
          <div class="gift-actions">
            <BaseButton @click="proceedToOrder" class="order-btn">
              注文に進む
            </BaseButton>
            <BaseButton @click="selectedGift = null" variant="outline">
              キャンセル
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { Gift, ConsultationAnswers } from '@/types'

const router = useRouter()

// 状態管理
const loading = ref(false)
const showRecommendations = ref(false)
const selectedGift = ref<Gift | null>(null)
const selectedCategories = ref<string[]>([])

// フォームデータ
const answers = reactive<ConsultationAnswers>({
  age: '',
  gender: '',
  relationship: '',
  budget: '',
  healthConcerns: [],
  occasion: '',
})

// 利用可能なギフトデータ
const availableGifts: Gift[] = [
  {
    id: 'gift-1',
    name: '総合健康診断パック',
    description: '基本検査から詳細検査まで、健康状態を総合的にチェック',
    price: 15000,
    category: 'health_checkup',
    partnerId: 'partner-1',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gift-2',
    name: '歯科検診・クリーニング',
    description: '虫歯チェックと歯石除去で、お口の健康をサポート',
    price: 8000,
    category: 'dental_care',
    partnerId: 'partner-2',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gift-3',
    name: '肌診断・美容相談',
    description: '肌の状態チェックと美容アドバイス',
    price: 12000,
    category: 'beauty_treatment',
    partnerId: 'partner-3',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gift-4',
    name: 'フィットネス評価・トレーニング',
    description: '体力測定と個人に合った運動プラン',
    price: 18000,
    category: 'fitness',
    partnerId: 'partner-4',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gift-5',
    name: '栄養相談・食事プラン',
    description: '個人に合わせた栄養指導と食事プラン作成',
    price: 10000,
    category: 'nutrition',
    partnerId: 'partner-5',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gift-6',
    name: 'ストレスチェック・メンタルケア',
    description: 'ストレス度測定とメンタルヘルスサポート',
    price: 15000,
    category: 'mental_health',
    partnerId: 'partner-6',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gift-7',
    name: '骨密度測定・骨粗鬆症予防',
    description: '骨の健康状態チェックと予防アドバイス',
    price: 12000,
    category: 'health_checkup',
    partnerId: 'partner-7',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gift-8',
    name: 'ホルモン検査・更年期サポート',
    description: 'ホルモンバランスチェックと更年期対策',
    price: 25000,
    category: 'health_checkup',
    partnerId: 'partner-8',
    status: 'active',
    createdAt: new Date().toISOString()
  }
]

// 計算プロパティ
const isFormValid = computed(() => {
  return answers.age && answers.budget && answers.healthConcerns.length > 0
})

const availableCategories = computed(() => [
  { value: 'health_checkup', label: '健康診断' },
  { value: 'dental_care', label: '歯科ケア' },
  { value: 'beauty_treatment', label: '美容ケア' },
  { value: 'fitness', label: 'フィットネス' },
  { value: 'nutrition', label: '栄養相談' },
  { value: 'mental_health', label: 'メンタルヘルス' }
])

const filteredGifts = computed(() => {
  let gifts = availableGifts.filter(gift => {
    // 予算フィルター
    const budgetMatch = filterByBudget(gift.price, answers.budget)
    if (!budgetMatch) return false

    // 健康への関心事フィルター
    const healthConcernMatch = filterByHealthConcern(gift.category, answers.healthConcerns)
    if (!healthConcernMatch) return false

    // カテゴリフィルター
    if (selectedCategories.value.length > 0 && !selectedCategories.value.includes(gift.category)) {
      return false
    }

    return true
  })

  // 年齢と性別に基づく優先度調整
  gifts = sortGiftsByRelevance(gifts, answers.age, answers.gender)

  return gifts
})

// フォーム送信
const findGifts = async () => {
  if (!isFormValid.value) return

  loading.value = true
  
  // シミュレーション用の遅延
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  loading.value = false
  showRecommendations.value = true
  
  // 初期カテゴリフィルターを設定
  selectedCategories.value = answers.healthConcerns.map(concern => {
    const mapping: Record<string, string> = {
      'general-health': 'health_checkup',
      'dental-care': 'dental_care',
      'beauty-care': 'beauty_treatment',
      'fitness': 'fitness',
      'nutrition': 'nutrition',
      'mental-health': 'mental_health'
    }
    return mapping[concern] || concern
  })
}

// フォームに戻る
const backToForm = () => {
  showRecommendations.value = false
  selectedGift.value = null
  selectedCategories.value = []
}

// カテゴリフィルターの切り替え
const toggleCategoryFilter = (category: string) => {
  const index = selectedCategories.value.indexOf(category)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
  } else {
    selectedCategories.value.push(category)
  }
}

// ギフト選択
const selectGift = (gift: Gift) => {
  selectedGift.value = gift
}

// 注文に進む
const proceedToOrder = () => {
  if (selectedGift.value) {
    router.push(`/order/${selectedGift.value.id}`)
  }
}

// フィルタリング関数
const filterByBudget = (giftPrice: number, budgetRange: string): boolean => {
  switch (budgetRange) {
    case '5000-10000':
      return giftPrice >= 5000 && giftPrice <= 10000
    case '10000-20000':
      return giftPrice >= 10000 && giftPrice <= 20000
    case '20000-30000':
      return giftPrice >= 20000 && giftPrice <= 30000
    case '30000-50000':
      return giftPrice >= 30000 && giftPrice <= 50000
    case '50000+':
      return giftPrice >= 50000
    default:
      return true
  }
}

const filterByHealthConcern = (giftCategory: string, healthConcerns: string[]): boolean => {
  const categoryMapping: Record<string, string[]> = {
    'general-health': ['health_checkup'],
    'dental-care': ['dental_care'],
    'beauty-care': ['beauty_treatment'],
    'fitness': ['fitness'],
    'nutrition': ['nutrition'],
    'mental-health': ['mental_health']
  }

  return healthConcerns.some(concern => {
    const categories = categoryMapping[concern] || []
    return categories.includes(giftCategory)
  })
}

const sortGiftsByRelevance = (gifts: Gift[], age: string, gender: string): Gift[] => {
  return gifts.sort((a, b) => {
    let scoreA = 0
    let scoreB = 0

    // 年齢に基づくスコア
    if (age === '20-29' || age === '30-39') {
      if (a.category === 'fitness' || a.category === 'beauty_treatment') scoreA += 2
      if (b.category === 'fitness' || b.category === 'beauty_treatment') scoreB += 2
    } else if (age === '40-49' || age === '50-59') {
      if (a.category === 'health_checkup' || a.category === 'nutrition') scoreA += 2
      if (b.category === 'health_checkup' || b.category === 'nutrition') scoreB += 2
    } else if (age === '60-69' || age === '70+') {
      if (a.category === 'health_checkup' || a.category === 'dental_care') scoreA += 2
      if (b.category === 'health_checkup' || b.category === 'dental_care') scoreB += 2
    }

    // 性別に基づくスコア
    if (gender === 'female') {
      if (a.category === 'beauty_treatment' || a.category === 'mental_health') scoreA += 1
      if (b.category === 'beauty_treatment' || b.category === 'mental_health') scoreB += 1
    } else if (gender === 'male') {
      if (a.category === 'fitness' || a.category === 'health_checkup') scoreA += 1
      if (b.category === 'fitness' || b.category === 'health_checkup') scoreB += 1
    }

    return scoreB - scoreA
  })
}

// ユーティリティ関数
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

onMounted(() => {
  console.log('Gift Consultation component mounted')
})
</script>

<style scoped>
.gift-consultation {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.consultation-header {
  text-align: center;
  margin-bottom: 3rem;
}

.consultation-header h2 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.consultation-header p {
  font-size: 1.2rem;
  color: #7f8c8d;
}

/* フォーム */
.consultation-form {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  color: #667eea;
  margin-bottom: 1rem;
  font-size: 1.3rem;
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
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.checkbox-item:hover {
  background-color: #f8f9fa;
}

.checkbox-item input[type="checkbox"] {
  margin-right: 0.5rem;
}

.form-actions {
  text-align: center;
  margin-top: 2rem;
}

.submit-button {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 1.2rem;
  padding: 1rem 3rem;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 推薦結果 */
.recommendations {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.recommendations-header {
  text-align: center;
  margin-bottom: 2rem;
}

.recommendations-header h3 {
  color: #27ae60;
  font-size: 2rem;
  margin-bottom: 1rem;
}

.recommendations-header p {
  color: #7f8c8d;
  margin-bottom: 1rem;
}

/* フィルター */
.filter-options {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 15px;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #ecf0f1;
  border-radius: 20px;
  background: white;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  border-color: #667eea;
}

.filter-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* ギフト一覧 */
.gifts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.gift-card {
  background: white;
  border: 2px solid #ecf0f1;
  border-radius: 15px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.gift-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
}

.gift-image {
  text-align: center;
  margin-bottom: 1rem;
}

.gift-icon {
  font-size: 3rem;
}

.gift-info h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.gift-description {
  color: #7f8c8d;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.gift-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gift-price {
  color: #e74c3c;
  font-weight: 600;
  font-size: 1.1rem;
}

.gift-category {
  background: #667eea;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
}

/* ギフトが見つからない場合 */
.no-gifts {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

/* 選択されたギフトのモーダル */
.selected-gift-modal {
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

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  color: #2c3e50;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #7f8c8d;
  cursor: pointer;
}

.gift-detail {
  text-align: center;
}

.gift-image-large {
  margin-bottom: 1rem;
}

.gift-icon-large {
  font-size: 4rem;
}

.gift-detail h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.gift-detail p {
  color: #7f8c8d;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.gift-price-large {
  color: #e74c3c;
  font-weight: 600;
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.gift-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.order-btn {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
  .gift-consultation {
    padding: 1rem;
  }
  
  .consultation-header h2 {
    font-size: 2rem;
  }
  
  .gifts-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-buttons {
    flex-direction: column;
  }
  
  .gift-actions {
    flex-direction: column;
  }
}
</style> 