<template>
  <div class="gifts-view">
    <div class="page-header">
      <div class="container">
        <h1>📋 ギフト一覧</h1>
        <p>健康ギフトのカテゴリー別一覧</p>
      </div>
    </div>

    <div class="container">
      <!-- 検索・フィルター -->
      <div class="filters-section">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="ギフトを検索..." 
            class="search-input"
            @input="handleSearch"
          >
          <button @click="handleSearch" class="search-btn">🔍</button>
        </div>
        
        <div class="category-filters">
          <button 
            v-for="category in categories" 
            :key="category.value"
            @click="filterByCategory(category.value)"
            :class="['category-btn', { active: selectedCategory === category.value }]"
          >
            {{ category.label }}
          </button>
        </div>
      </div>

      <!-- ローディング状態 -->
      <div v-if="giftStore.loading" class="loading">
        <div class="spinner"></div>
        <p>ギフトを読み込み中...</p>
      </div>

      <!-- エラー状態 -->
      <div v-else-if="giftStore.error" class="error-message">
        <p>{{ giftStore.error }}</p>
        <button @click="loadGifts" class="btn btn-primary">再試行</button>
      </div>

      <!-- ギフト一覧 -->
      <div v-else-if="displayedGifts.length > 0" class="gifts-grid">
        <div 
          v-for="gift in displayedGifts" 
          :key="gift.id" 
          class="gift-card"
          @click="viewGift(gift)"
        >
          <div class="gift-image">
            <img :src="gift.imageUrl || '/images/gift-placeholder.jpg'" :alt="gift.name">
          </div>
          <div class="gift-info">
            <h3 class="gift-name">{{ gift.name }}</h3>
            <p class="gift-description">{{ gift.description }}</p>
            <div class="gift-meta">
              <div class="rating">
                <span class="stars">★★★★★</span>
                <span class="rating-text">4.5</span>
                <span class="reviews">(120件)</span>
              </div>
              <div class="price">¥{{ gift.price.toLocaleString() }}</div>
            </div>
            <div class="gift-actions">
              <button @click.stop="viewGift(gift)" class="btn btn-outline">詳細を見る</button>
              <button @click.stop="addToCart(gift)" class="btn btn-primary">カートに追加</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空の状態 -->
      <div v-else class="empty-state">
        <div class="empty-icon">🎁</div>
        <h3>ギフトが見つかりません</h3>
        <p>検索条件を変更するか、カテゴリーを選択してください。</p>
        <button @click="clearFilters" class="btn btn-primary">フィルターをクリア</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGiftStore } from '@/stores/gift'
import type { Gift } from '@/types'

const router = useRouter()
const giftStore = useGiftStore()

// 状態
const searchQuery = ref('')
const selectedCategory = ref('')

// カテゴリー定義
const categories = [
  { value: '', label: 'すべて' },
  { value: 'health', label: '健康管理' },
  { value: 'fitness', label: 'フィットネス' },
  { value: 'nutrition', label: '栄養・食事' },
  { value: 'beauty', label: '美容・スキンケア' },
  { value: 'mental', label: 'メンタルヘルス' }
]

// 表示するギフトを計算
const displayedGifts = computed(() => {
  let gifts = giftStore.gifts

  // カテゴリーフィルター
  if (selectedCategory.value) {
    gifts = gifts.filter(gift => gift.category === selectedCategory.value)
  }

  // 検索フィルター
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    gifts = gifts.filter(gift => 
      gift.name.toLowerCase().includes(query) ||
      gift.description.toLowerCase().includes(query)
    )
  }

  return gifts
})

// メソッド
const loadGifts = async () => {
  await giftStore.fetchGifts()
}

const handleSearch = () => {
  // 検索はリアクティブなので自動で実行される
}

const filterByCategory = (category: string) => {
  selectedCategory.value = category
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
}

const viewGift = (gift: Gift) => {
  router.push(`/gifts/${gift.id}`)
}

const addToCart = (gift: Gift) => {
  // TODO: カート機能の実装
  console.log('Added to cart:', gift)
  alert(`${gift.name}をカートに追加しました`)
}

// 初期化
onMounted(() => {
  loadGifts()
})
</script>

<style scoped>
.gifts-view {
  min-height: 100vh;
  background: #f8f9fa;
}

.page-header {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  padding: 3rem 0;
  text-align: center;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.page-header p {
  font-size: 1.25rem;
  opacity: 0.9;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* フィルターセクション */
.filters-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.search-box {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 1;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.search-btn {
  padding: 1rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
}

.category-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.category-btn {
  padding: 0.75rem 1.5rem;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.category-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.category-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* ギフトグリッド */
.gifts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.gift-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.gift-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.gift-image {
  height: 200px;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gift-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gift-info {
  padding: 1.5rem;
}

.gift-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.gift-description {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.gift-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  color: #ffc107;
  font-size: 0.9rem;
}

.rating-text {
  font-weight: 600;
  color: var(--color-text-primary);
}

.reviews {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.price {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.gift-actions {
  display: flex;
  gap: 1rem;
}

/* ボタンスタイル */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
}

.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.btn-outline:hover {
  background: var(--color-primary);
  color: white;
}

/* ローディング状態 */
.loading {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
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
  padding: 3rem;
  background: white;
  border-radius: 12px;
  margin: 2rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 空の状態 */
.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  margin: 2rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

/* レスポンシブ */
@media (max-width: 768px) {
  .page-header {
    padding: 2rem 0;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .page-header p {
    font-size: 1rem;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .gifts-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .category-filters {
    justify-content: center;
  }
  
  .gift-actions {
    flex-direction: column;
  }
}
</style> 