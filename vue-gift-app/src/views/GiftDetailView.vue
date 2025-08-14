<template>
  <div class="gift-detail">
    <div class="container">
      <!-- パンくずリスト -->
      <nav class="breadcrumb">
        <router-link to="/">ホーム</router-link>
        <span class="separator">/</span>
        <router-link to="/gifts">ギフト一覧</router-link>
        <span class="separator">/</span>
        <span>{{ gift?.name }}</span>
      </nav>

      <!-- ギフト詳細 -->
      <div v-if="gift" class="gift-content">
        <div class="gift-header">
          <div class="gift-image">
            <span class="gift-icon">{{ getGiftIcon(gift.category) }}</span>
          </div>
          <div class="gift-info">
            <h1 class="gift-title">{{ gift.name }}</h1>
            <div class="gift-price">¥{{ gift.price.toLocaleString() }}</div>
            <div class="gift-category">{{ getCategoryLabel(gift.category) }}</div>
            <p class="gift-description">{{ gift.description }}</p>
          </div>
        </div>

        <!-- ギフトの詳細情報 -->
        <div class="gift-details">
          <div class="detail-section">
            <h3>🎯 このギフトの特徴</h3>
            <ul class="feature-list">
              <li v-for="feature in getGiftFeatures(gift.category)" :key="feature">
                {{ feature }}
              </li>
            </ul>
          </div>

          <div class="detail-section">
            <h3>🏥 利用可能施設</h3>
            <div class="facility-info">
              <p>全国の提携医療機関・健康施設でご利用いただけます。</p>
              <div class="facility-types">
                <span class="facility-tag">総合病院</span>
                <span class="facility-tag">クリニック</span>
                <span class="facility-tag">健康診断センター</span>
                <span class="facility-tag">フィットネスジム</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>📋 利用条件・注意事項</h3>
            <ul class="terms-list">
              <li>有効期限：購入から1年間</li>
              <li>年齢制限：18歳以上</li>
              <li>事前予約が必要です</li>
              <li>一部地域では利用できない場合があります</li>
            </ul>
          </div>
        </div>

        <!-- アクションボタン -->
        <div class="action-section">
          <BaseButton 
            @click="proceedToPurchase" 
            size="lg"
            class="purchase-btn"
          >
            🎁 このギフトを贈る
          </BaseButton>
          
          <BaseButton 
            @click="addToFavorites" 
            variant="outline"
            size="lg"
            class="favorite-btn"
          >
            ❤️ お気に入りに追加
          </BaseButton>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { Gift } from '@/types'

const route = useRoute()
const router = useRouter()

const gift = ref<Gift | null>(null)
const loading = ref(true)

// ギフトデータ（実際の実装ではAPIから取得）
const giftsData: Gift[] = [
  {
    id: 'gift-1',
    name: '総合健康診断パック',
    description: '基本検査から詳細検査まで、健康状態を総合的にチェックできるパッケージです。生活習慣病の早期発見から、がん検診まで幅広く対応しています。',
    price: 15000,
    category: 'health_checkup',
    partnerId: 'partner-1',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gift-2',
    name: '歯科検診・クリーニング',
    description: '虫歯チェックと歯石除去で、お口の健康をサポートします。定期的なケアで、美しい歯と健康な口腔環境を維持しましょう。',
    price: 8000,
    category: 'dental_care',
    partnerId: 'partner-2',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gift-3',
    name: '肌診断・美容相談',
    description: '肌の状態チェックと美容アドバイスを提供します。個人の肌質に合わせたケア方法を提案し、美しい肌を目指します。',
    price: 12000,
    category: 'beauty_treatment',
    partnerId: 'partner-3',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gift-4',
    name: 'フィットネス評価・トレーニング',
    description: '体力測定と個人に合った運動プランを作成します。安全で効果的な運動習慣を身につけ、健康的な体づくりをサポートします。',
    price: 18000,
    category: 'fitness',
    partnerId: 'partner-4',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gift-5',
    name: '栄養相談・食事プラン',
    description: '個人に合わせた栄養指導と食事プラン作成を行います。健康的な食生活の習慣化をサポートし、理想的な体づくりを目指します。',
    price: 10000,
    category: 'nutrition',
    partnerId: 'partner-5',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gift-6',
    name: 'ストレスチェック・メンタルケア',
    description: 'ストレス度測定とメンタルヘルスサポートを提供します。心の健康状態を把握し、適切なケア方法を提案します。',
    price: 15000,
    category: 'mental_health',
    partnerId: 'partner-6',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gift-7',
    name: '骨密度測定・骨粗鬆症予防',
    description: '骨の健康状態チェックと予防アドバイスを提供します。加齢に伴う骨の変化を早期に発見し、適切な対策を提案します。',
    price: 12000,
    category: 'health_checkup',
    partnerId: 'partner-7',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gift-8',
    name: 'ホルモン検査・更年期サポート',
    description: 'ホルモンバランスチェックと更年期対策を提供します。女性の健康をサポートし、快適な生活を送るためのアドバイスを行います。',
    price: 25000,
    category: 'health_checkup',
    partnerId: 'partner-8',
    status: 'active',
    createdAt: new Date().toISOString()
  }
]

// ギフトの特徴を取得
const getGiftFeatures = (category: string): string[] => {
  const features: Record<string, string[]> = {
    'health_checkup': [
      '専門医による詳細な診察',
      '最新の検査機器を使用',
      '結果の詳しい説明',
      '生活習慣のアドバイス'
    ],
    'dental_care': [
      '痛みの少ない治療',
      '最新の歯科技術',
      '予防歯科の指導',
      '美しい歯のケア'
    ],
    'beauty_treatment': [
      '肌質の詳細分析',
      '個人に合ったケア方法',
      '美容の専門家による相談',
      '継続的なサポート'
    ],
    'fitness': [
      '体力レベルの測定',
      '個人に合った運動プラン',
      '専門トレーナーの指導',
      '安全な運動方法の習得'
    ],
    'nutrition': [
      '現在の食生活の分析',
      '個人に合った食事プラン',
      '栄養士による指導',
      '継続的なサポート'
    ],
    'mental_health': [
      'ストレス度の測定',
      '専門家による相談',
      '心の健康状態の把握',
      '適切なケア方法の提案'
    ]
  }
  return features[category] || ['詳細な検査・診察', '専門家による指導', '継続的なサポート']
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

// 購入に進む
const proceedToPurchase = () => {
  if (gift.value) {
    router.push(`/purchase/${gift.value.id}`)
  }
}

// お気に入りに追加
const addToFavorites = () => {
  // TODO: お気に入り機能の実装
  console.log('お気に入りに追加:', gift.value?.name)
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
.gift-detail {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
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

/* ギフト詳細 */
.gift-content {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.gift-header {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 3rem;
  margin-bottom: 3rem;
  align-items: center;
}

.gift-image {
  text-align: center;
}

.gift-icon {
  font-size: 8rem;
  display: block;
}

.gift-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.gift-price {
  font-size: 2rem;
  font-weight: 700;
  color: #e74c3c;
  margin-bottom: 1rem;
}

.gift-category {
  display: inline-block;
  background: #667eea;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.gift-description {
  font-size: 1.1rem;
  color: #7f8c8d;
  line-height: 1.6;
}

/* 詳細情報 */
.gift-details {
  margin-bottom: 3rem;
}

.detail-section {
  margin-bottom: 2rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 15px;
}

.detail-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.feature-list,
.terms-list {
  list-style: none;
  padding: 0;
}

.feature-list li,
.terms-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
  color: #2c3e50;
}

.feature-list li:last-child,
.terms-list li:last-child {
  border-bottom: none;
}

.feature-list li::before {
  content: '✓';
  color: #27ae60;
  font-weight: bold;
  margin-right: 0.5rem;
}

.facility-info p {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.facility-types {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.facility-tag {
  background: #667eea;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
}

/* アクションボタン */
.action-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
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

.purchase-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
}

.favorite-btn {
  border: 2px solid #667eea;
  color: #667eea;
  background: white;
  font-size: 1.2rem;
  padding: 1rem 3rem;
  border-radius: 50px;
  transition: all 0.3s ease;
}

.favorite-btn:hover {
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
@media (max-width: 768px) {
  .gift-header {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  
  .gift-icon {
    font-size: 6rem;
  }
  
  .gift-title {
    font-size: 2rem;
  }
  
  .gift-price {
    font-size: 1.5rem;
  }
  
  .action-section {
    flex-direction: column;
  }
  
  .gift-content {
    padding: 2rem 1rem;
  }
}
</style> 