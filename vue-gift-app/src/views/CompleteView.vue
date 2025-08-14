<template>
  <div class="complete">
    <div class="container">
      <!-- 完了ヘッダー -->
      <div class="complete-header">
        <div class="success-icon">🎉</div>
        <h1>購入完了！</h1>
        <p>大切な人への健康ギフトが正常に処理されました</p>
      </div>

      <!-- ギフト情報 -->
      <div class="gift-info">
        <div class="gift-card">
          <div class="gift-icon">{{ getGiftIcon(gift?.category) }}</div>
          <h3>{{ gift?.name }}</h3>
          <p class="gift-description">{{ gift?.description }}</p>
          <div class="gift-price">¥{{ gift?.price?.toLocaleString() }}</div>
        </div>
      </div>

      <!-- ギフトURL -->
      <div class="gift-url-section">
        <h3>🎁 ギフトURL</h3>
        <p>受取人にこのURLを共有してください</p>
        
        <div class="url-box">
          <input
            type="text"
            :value="giftUrl"
            readonly
            class="url-input"
            @click="selectAll"
          />
          <BaseButton
            @click="copyUrl"
            :loading="copying"
            class="copy-btn"
          >
            {{ copying ? 'コピー中...' : 'URLをコピー' }}
          </BaseButton>
        </div>

        <div class="url-actions">
          <BaseButton
            @click="shareOnLine"
            variant="outline"
            class="share-btn"
          >
            📱 LINEで共有
          </BaseButton>
          
          <BaseButton
            @click="shareByEmail"
            variant="outline"
            class="share-btn"
          >
            📧 メールで共有
          </BaseButton>
        </div>
      </div>

      <!-- 次のステップ -->
      <div class="next-steps">
        <h3>📋 次のステップ</h3>
        <div class="steps-grid">
          <div class="step-item">
            <div class="step-number">1</div>
            <h4>URLを共有</h4>
            <p>受取人にギフトURLを送信してください</p>
          </div>
          <div class="step-item">
            <div class="step-number">2</div>
            <h4>受取人確認</h4>
            <p>受取人がURLにアクセスしてギフトを確認</p>
          </div>
          <div class="step-item">
            <div class="step-number">3</div>
            <h4>利用予約</h4>
            <p>受取人が施設での利用予約を行う</p>
          </div>
        </div>
      </div>

      <!-- アクションボタン -->
      <div class="action-buttons">
        <BaseButton
          @click="createNewGift"
          size="lg"
          class="new-gift-btn"
        >
          🎁 新しいギフトを作る
        </BaseButton>
        
        <BaseButton
          @click="goToMyPage"
          variant="outline"
          size="lg"
          class="my-page-btn"
        >
          👤 マイページを見る
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
import type { Gift } from '@/types'

const router = useRouter()

const gift = ref<Gift | null>(null)
const giftUrl = ref('')
const copying = ref(false)

// ギフトデータ（実際の実装では購入データから取得）
const giftData: Gift = {
  id: 'gift-1',
  name: '総合健康診断パック',
  description: '基本検査から詳細検査まで、健康状態を総合的にチェックできるパッケージです。',
  price: 15000,
  category: 'health_checkup',
  partnerId: 'partner-1',
  status: 'active',
  createdAt: new Date().toISOString()
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

// URLをコピー
const copyUrl = async () => {
  copying.value = true
  
  try {
    await navigator.clipboard.writeText(giftUrl.value)
    
    // 成功メッセージを表示
    const copyBtn = document.querySelector('.copy-btn')
    if (copyBtn) {
      const originalText = copyBtn.textContent
      copyBtn.textContent = '✅ コピー完了！'
      setTimeout(() => {
        copyBtn.textContent = originalText
      }, 2000)
    }
  } catch (error) {
    console.error('URLのコピーに失敗しました:', error)
    alert('URLのコピーに失敗しました。手動でコピーしてください。')
  } finally {
    copying.value = false
  }
}

// URLを全選択
const selectAll = (event: Event) => {
  const target = event.target as HTMLInputElement
  target.select()
}

// LINEで共有
const shareOnLine = () => {
  const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(`健康のギフトが届きました！\n\n${giftUrl.value}\n\n大切なあなたの健康を願って贈りました。`)}`
  window.open(lineUrl, '_blank')
}

// メールで共有
const shareByEmail = () => {
  const subject = encodeURIComponent('健康のギフトが届きました')
  const body = encodeURIComponent(`健康のギフトが届きました！

以下のURLからギフトを確認してください：
${giftUrl.value}

大切なあなたの健康を願って贈りました。
いつまでも元気でいてくださいね。`)
  
  const mailtoUrl = `mailto:?subject=${subject}&body=${body}`
  window.location.href = mailtoUrl
}

// 新しいギフトを作る
const createNewGift = () => {
  router.push('/gifts')
}

// マイページに移動
const goToMyPage = () => {
  router.push('/my-page')
}

// 初期化
onMounted(() => {
  // 実際の実装では、購入完了データからギフト情報を取得
  gift.value = giftData
  
  // ギフトURLを生成（実際の実装では購入完了時に生成される）
  const baseUrl = window.location.origin
  const uniqueId = `gift_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  giftUrl.value = `${baseUrl}/gift/${uniqueId}`
})
</script>

<style scoped>
.complete {
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

/* ギフト情報 */
.gift-info {
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
  font-size: 3rem;
  margin-bottom: 1rem;
}

.gift-card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.gift-description {
  color: #7f8c8d;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.gift-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e74c3c;
}

/* ギフトURL */
.gift-url-section {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
  text-align: center;
}

.gift-url-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.gift-url-section p {
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.url-box {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.url-input {
  flex: 1;
  padding: 1rem;
  border: 2px solid #ecf0f1;
  border-radius: 10px;
  font-size: 1rem;
  background: #f8f9fa;
  color: #2c3e50;
  cursor: pointer;
}

.url-input:focus {
  outline: none;
  border-color: #667eea;
}

.copy-btn {
  background: #667eea;
  border: none;
  color: white;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.url-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.share-btn {
  border: 2px solid #667eea;
  color: #667eea;
  background: white;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
}

.share-btn:hover {
  background: #667eea;
  color: white;
}

/* 次のステップ */
.next-steps {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
}

.next-steps h3 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.3rem;
  text-align: center;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.step-item {
  text-align: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 15px;
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
  margin: 0 auto 1rem;
}

.step-item h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.step-item p {
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* アクションボタン */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}

.new-gift-btn {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 1.2rem;
  padding: 1rem 3rem;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.new-gift-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
}

.my-page-btn {
  border: 2px solid #667eea;
  color: #667eea;
  background: white;
  font-size: 1.2rem;
  padding: 1rem 3rem;
  border-radius: 50px;
  transition: all 0.3s ease;
}

.my-page-btn:hover {
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
  
  .url-box {
    flex-direction: column;
  }
  
  .url-actions {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .steps-grid {
    grid-template-columns: 1fr;
  }
}
</style> 