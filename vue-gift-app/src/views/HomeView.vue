<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToCategory = (category: string) => {
  router.push({ name: 'Gifts', query: { category } })
}
</script>

<template>
  <div class="home">
    <!-- ヒーローセクション -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          🎁 健康を贈る、新しい体験
        </h1>
        <p class="hero-subtitle">
          AIが最適な健康ギフトを提案。<br>
          大切な人への想いを、健康という形で。
        </p>
        <div class="hero-actions">
          <router-link to="/consultation" class="btn btn-primary">
            🎁 ギフト相談を始める
          </router-link>
          <router-link to="/gifts" class="btn btn-secondary">
            📋 ギフト一覧を見る
          </router-link>
        </div>
      </div>
      <div class="hero-image">
        <div class="gift-animation">🎁</div>
      </div>
    </section>

    <!-- 特徴セクション -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">GIFTSの特徴</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🤖</div>
            <h3>AI推薦システム</h3>
            <p>年齢、性別、健康関心事に基づいて、最適な健康ギフトをAIが提案します。</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💝</div>
            <h3>パーソナライズ</h3>
            <p>受取人の好みや状況に合わせて、個別にカスタマイズされたギフトを提供。</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>LINE連携</h3>
            <p>LINE公式アカウントでギフト相談や注文状況確認が簡単にできます。</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🏥</div>
            <h3>信頼できる提携先</h3>
            <p>厳選された医療機関・健康施設との提携で、安心・安全なサービスを提供。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ギフトカテゴリーセクション -->
    <section class="categories">
      <div class="container">
        <h2 class="section-title">ギフトカテゴリー</h2>
        <div class="categories-grid">
          <div class="category-card" @click="goToCategory('health_checkup')">
            <div class="category-icon">🏥</div>
            <h3>健康診断</h3>
            <p>基本検査から詳細検査まで、健康状態をチェック</p>
          </div>
          <div class="category-card" @click="goToCategory('dental_care')">
            <div class="category-icon">🦷</div>
            <h3>歯科ケア</h3>
            <p>歯の健康をサポートする検診・クリーニング</p>
          </div>
          <div class="category-card" @click="goToCategory('beauty_treatment')">
            <div class="category-icon">✨</div>
            <h3>美容ケア</h3>
            <p>肌の状態チェックと美容アドバイス</p>
          </div>
          <div class="category-card" @click="goToCategory('fitness')">
            <div class="category-icon">💪</div>
            <h3>フィットネス</h3>
            <p>運動習慣のサポートとトレーニング指導</p>
          </div>
          <div class="category-card" @click="goToCategory('nutrition')">
            <div class="category-icon">🥗</div>
            <h3>栄養相談</h3>
            <p>個人に合わせた栄養指導と食事プラン</p>
          </div>
          <div class="category-card" @click="goToCategory('mental_health')">
            <div class="category-icon">🧠</div>
            <h3>メンタルヘルス</h3>
            <p>ストレスチェックとメンタルヘルスサポート</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 利用フローセクション -->
    <section class="flow">
      <div class="container">
        <h2 class="section-title">利用フロー</h2>
        <div class="flow-steps">
          <div class="flow-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>ギフト相談</h3>
              <p>簡単な質問に答えて、AIが最適なギフトを提案</p>
            </div>
          </div>
          <div class="flow-arrow">→</div>
          <div class="flow-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>ギフト選択</h3>
              <p>提案されたギフトからお気に入りを選択</p>
            </div>
          </div>
          <div class="flow-arrow">→</div>
          <div class="flow-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>注文・決済</h3>
              <p>安全な決済システムでギフトを購入</p>
            </div>
          </div>
          <div class="flow-arrow">→</div>
          <div class="flow-step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h3>ギフトURL発行</h3>
              <p>受取人に送るギフトURLを発行</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTAセクション -->
    <section class="cta">
      <div class="container">
        <h2>今すぐ始めませんか？</h2>
        <p>大切な人への健康ギフトで、新しい体験を。</p>
        <router-link to="/consultation" class="btn btn-primary btn-large">
          🎁 無料でギフト相談を始める
        </router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
}

/* ヒーローセクション */
.hero {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  padding: 4rem 2rem;
  display: flex;
  align-items: center;
  min-height: 80vh;
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  line-height: 1.6;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.gift-animation {
  font-size: 8rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
}

/* コンテナ */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* セクション共通 */
.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 3rem;
}

/* 特徴セクション */
.features {
  padding: 5rem 0;
  background: #f8f9fa;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.feature-card p {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* カテゴリーセクション */
.categories {
  padding: 5rem 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.category-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.category-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-primary);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.2);
}

.category-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.category-card h3 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

.category-card p {
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* フローセクション */
.flow {
  padding: 5rem 0;
  background: #f8f9fa;
}

.flow-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.flow-step {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  min-width: 200px;
}

.step-number {
  background: var(--color-primary);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
}

.step-content h3 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.step-content p {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
}

.flow-arrow {
  font-size: 2rem;
  color: var(--color-primary);
  font-weight: 700;
}

/* CTAセクション */
.cta {
  padding: 5rem 0;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  text-align: center;
}

.cta h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.cta p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

/* ボタン */
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
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.btn-large {
  padding: 1.25rem 3rem;
  font-size: 1.25rem;
}

/* レスポンシブ */
@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1rem;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .gift-animation {
    font-size: 4rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .flow-steps {
    flex-direction: column;
  }
  
  .flow-arrow {
    transform: rotate(90deg);
  }
  
  .container {
    padding: 0 1rem;
  }
}
</style>
