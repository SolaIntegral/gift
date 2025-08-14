<template>
  <div class="booking">
    <div class="container">
      <!-- ヘッダー -->
      <div class="booking-header">
        <h1>📅 利用予約</h1>
        <p>希望する日時と施設を選択して予約を行います</p>
      </div>

      <!-- ギフト情報 -->
      <div v-if="giftData" class="gift-summary">
        <div class="gift-card">
          <div class="gift-icon">{{ getGiftIcon(giftData.gift.category) }}</div>
          <h3>{{ giftData.gift.name }}</h3>
          <p class="gift-description">{{ giftData.gift.description }}</p>
          <div class="gift-category">{{ getCategoryLabel(giftData.gift.category) }}</div>
        </div>
      </div>

      <!-- 予約フォーム -->
      <div class="booking-form">
        <form @submit.prevent="confirmBooking">
          <!-- 施設選択 -->
          <div class="form-section">
            <h3>🏥 利用施設を選択</h3>
            <div class="facility-selection">
              <div class="facility-filters">
                <div class="filter-group">
                  <label>地域で絞り込み:</label>
                  <select v-model="selectedRegion" class="form-control">
                    <option value="">全ての地域</option>
                    <option value="tokyo">東京都</option>
                    <option value="osaka">大阪府</option>
                    <option value="kyoto">京都府</option>
                    <option value="kanagawa">神奈川県</option>
                    <option value="aichi">愛知県</option>
                  </select>
                </div>
                <div class="filter-group">
                  <label>施設タイプ:</label>
                  <select v-model="selectedFacilityType" class="form-control">
                    <option value="">全てのタイプ</option>
                    <option value="hospital">総合病院</option>
                    <option value="clinic">クリニック</option>
                    <option value="center">健康診断センター</option>
                    <option value="gym">フィットネスジム</option>
                  </select>
                </div>
              </div>

              <div class="facilities-list">
                <div 
                  v-for="facility in filteredFacilities" 
                  :key="facility.id"
                  :class="['facility-item', { selected: selectedFacility?.id === facility.id }]"
                  @click="selectFacility(facility)"
                >
                  <div class="facility-info">
                    <h4>{{ facility.name }}</h4>
                    <p class="facility-address">{{ facility.address }}</p>
                    <p class="facility-type">{{ getFacilityTypeLabel(facility.type) }}</p>
                    <div class="facility-rating">
                      <span class="stars">⭐⭐⭐⭐⭐</span>
                      <span class="rating-text">{{ facility.rating }}/5</span>
                    </div>
                  </div>
                  <div class="facility-actions">
                    <BaseButton
                      @click.stop="selectFacility(facility)"
                      :variant="selectedFacility?.id === facility.id ? 'primary' : 'outline'"
                      size="sm"
                    >
                      {{ selectedFacility?.id === facility.id ? '選択中' : '選択' }}
                    </BaseButton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 日時選択 -->
          <div class="form-section">
            <h3>📅 希望日時を選択</h3>
            <div class="date-time-selection">
              <div class="calendar-section">
                <h4>日付を選択</h4>
                <div class="calendar">
                  <div class="calendar-header">
                    <button type="button" @click="previousMonth" class="nav-btn">&lt;</button>
                    <h5>{{ currentMonthYear }}</h5>
                    <button type="button" @click="nextMonth" class="nav-btn">&gt;</button>
                  </div>
                  <div class="calendar-grid">
                    <div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
                    <div 
                      v-for="date in calendarDates" 
                      :key="date.key"
                      :class="['calendar-date', { 
                        'other-month': !date.currentMonth,
                        'available': date.available,
                        'selected': selectedDate === date.key,
                        'disabled': !date.available
                      }]"
                      @click="selectDate(date)"
                    >
                      {{ date.day }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="time-section">
                <h4>時間を選択</h4>
                <div class="time-slots">
                  <div 
                    v-for="timeSlot in availableTimeSlots" 
                    :key="timeSlot"
                    :class="['time-slot', { selected: selectedTime === timeSlot }]"
                    @click="selectTime(timeSlot)"
                  >
                    {{ timeSlot }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 予約者情報 -->
          <div class="form-section">
            <h3>👤 予約者情報</h3>
            <div class="form-grid">
              <div class="form-group">
                <label for="name">お名前 *</label>
                <input
                  id="name"
                  v-model="formData.name"
                  type="text"
                  required
                  placeholder="例：田中 花子"
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label for="email">メールアドレス *</label>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  required
                  placeholder="例：hanako@example.com"
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label for="phone">電話番号 *</label>
                <input
                  id="phone"
                  v-model="formData.phone"
                  type="tel"
                  required
                  placeholder="例：090-1234-5678"
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label for="birthdate">生年月日</label>
                <input
                  id="birthdate"
                  v-model="formData.birthdate"
                  type="date"
                  class="form-control"
                />
              </div>
            </div>
          </div>

          <!-- 特記事項 -->
          <div class="form-section">
            <h3>📝 特記事項</h3>
            <div class="form-group">
              <label for="notes">ご要望・ご質問など</label>
              <textarea
                id="notes"
                v-model="formData.notes"
                rows="4"
                placeholder="例：初回利用です。分からないことがあれば事前にご連絡ください。"
                class="form-control"
              ></textarea>
            </div>
          </div>

          <!-- 予約確認 -->
          <div v-if="isFormValid" class="booking-summary">
            <h3>📋 予約内容の確認</h3>
            <div class="summary-content">
              <div class="summary-item">
                <span class="label">施設:</span>
                <span class="value">{{ selectedFacility?.name }}</span>
              </div>
              <div class="summary-item">
                <span class="label">日時:</span>
                <span class="value">{{ selectedDate }} {{ selectedTime }}</span>
              </div>
              <div class="summary-item">
                <span class="label">予約者:</span>
                <span class="value">{{ formData.name }}</span>
              </div>
              <div class="summary-item">
                <span class="label">連絡先:</span>
                <span class="value">{{ formData.email }}</span>
              </div>
            </div>
          </div>

          <!-- 予約ボタン -->
          <div class="booking-actions">
            <BaseButton
              type="submit"
              :loading="processing"
              :disabled="!isFormValid"
              size="lg"
              class="confirm-btn"
            >
              {{ processing ? '予約処理中...' : '予約を確定する' }}
            </BaseButton>
            
            <BaseButton
              @click="goBack"
              variant="outline"
              size="lg"
              class="cancel-btn"
            >
              キャンセル
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'

const route = useRoute()
const router = useRouter()

const giftData = ref<any>(null)
const selectedFacility = ref<any>(null)
const selectedDate = ref<string>('')
const selectedTime = ref<string>('')
const selectedRegion = ref('')
const selectedFacilityType = ref('')
const processing = ref(false)

// フォームデータ
const formData = ref({
  name: '',
  email: '',
  phone: '',
  birthdate: '',
  notes: ''
})

// カレンダー関連
const currentDate = ref(new Date())
const weekdays = ['日', '月', '火', '水', '木', '金', '土']

// 施設データ（実際の実装ではAPIから取得）
const facilities = ref([
  {
    id: 'facility-1',
    name: '東京健康診断センター',
    address: '東京都渋谷区渋谷1-1-1',
    type: 'center',
    region: 'tokyo',
    rating: 4.8,
    availableDates: ['2025-01-15', '2025-01-16', '2025-01-17']
  },
  {
    id: 'facility-2',
    name: '青山クリニック',
    address: '東京都港区南青山2-2-2',
    type: 'clinic',
    region: 'tokyo',
    rating: 4.6,
    availableDates: ['2025-01-15', '2025-01-18', '2025-01-19']
  },
  {
    id: 'facility-3',
    name: '大阪総合病院',
    address: '大阪府大阪市中央区本町3-3-3',
    type: 'hospital',
    region: 'osaka',
    rating: 4.9,
    availableDates: ['2025-01-20', '2025-01-21', '2025-01-22']
  },
  {
    id: 'facility-4',
    name: '京都フィットネスジム',
    address: '京都府京都市中京区四条通4-4-4',
    type: 'gym',
    region: 'kyoto',
    rating: 4.5,
    availableDates: ['2025-01-15', '2025-01-16', '2025-01-23']
  }
])

// 利用可能時間
const availableTimeSlots = [
  '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'
]

// 計算プロパティ
const currentMonthYear = computed(() => {
  return `${currentDate.value.getFullYear()}年${currentDate.value.getMonth() + 1}月`
})

const filteredFacilities = computed(() => {
  let filtered = facilities.value

  if (selectedRegion.value) {
    filtered = filtered.filter(f => f.region === selectedRegion.value)
  }

  if (selectedFacilityType.value) {
    filtered = filtered.filter(f => f.type === selectedFacilityType.value)
  }

  return filtered
})

const calendarDates = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const dates = []
  const currentDateObj = new Date(startDate)

  while (currentDateObj <= lastDay || dates.length < 42) {
    const dateKey = currentDateObj.toISOString().split('T')[0]
    const isCurrentMonth = currentDateObj.getMonth() === month
    const isAvailable = selectedFacility.value?.availableDates.includes(dateKey) || false

    dates.push({
      key: dateKey,
      day: currentDateObj.getDate(),
      currentMonth: isCurrentMonth,
      available: isAvailable
    })

    currentDateObj.setDate(currentDateObj.getDate() + 1)
  }

  return dates
})

const isFormValid = computed(() => {
  return selectedFacility.value &&
         selectedDate.value &&
         selectedTime.value &&
         formData.value.name &&
         formData.value.email &&
         formData.value.phone
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

const getFacilityTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'hospital': '総合病院',
    'clinic': 'クリニック',
    'center': '健康診断センター',
    'gym': 'フィットネスジム'
  }
  return labels[type] || type
}

const selectFacility = (facility: any) => {
  selectedFacility.value = facility
  selectedDate.value = '' // 施設変更時は日付をリセット
}

const selectDate = (date: any) => {
  if (date.available) {
    selectedDate.value = date.key
  }
}

const selectTime = (time: string) => {
  selectedTime.value = time
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const confirmBooking = async () => {
  if (!isFormValid.value) return

  processing.value = true

  try {
    // シミュレーション用の遅延
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 実際の実装では、ここでAPIを呼び出して予約処理を行う
    const bookingData = {
      facilityId: selectedFacility.value.id,
      date: selectedDate.value,
      time: selectedTime.value,
      ...formData.value
    }

    console.log('予約データ:', bookingData)

    // 予約完了画面に遷移
    router.push('/booking/complete')
  } catch (error) {
    console.error('予約処理エラー:', error)
    alert('予約処理に失敗しました。もう一度お試しください。')
  } finally {
    processing.value = false
  }
}

const goBack = () => {
  router.back()
}

// 初期化
onMounted(() => {
  // 実際の実装では、uniqueIdを使ってAPIからギフトデータを取得
  // ここではモックデータを使用
  giftData.value = {
    id: 'gift_receive_123',
    gift: {
      id: 'gift-1',
      name: '総合健康診断パック',
      description: '基本検査から詳細検査まで、健康状態を総合的にチェックできるパッケージです。',
      category: 'health_checkup'
    }
  }
})
</script>

<style scoped>
.booking {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* ヘッダー */
.booking-header {
  text-align: center;
  margin-bottom: 3rem;
}

.booking-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.booking-header p {
  font-size: 1.2rem;
  color: #7f8c8d;
}

/* ギフトサマリー */
.gift-summary {
  margin-bottom: 3rem;
}

.gift-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
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

.gift-category {
  background: #667eea;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  display: inline-block;
}

/* 予約フォーム */
.booking-form {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 3rem;
}

.form-section h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 0.5rem;
}

/* 施設選択 */
.facility-filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-group label {
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

.facilities-list {
  display: grid;
  gap: 1rem;
}

.facility-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border: 2px solid #ecf0f1;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.facility-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
}

.facility-item.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
}

.facility-info h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.facility-address {
  color: #7f8c8d;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.facility-type {
  color: #667eea;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.facility-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  font-size: 0.8rem;
}

.rating-text {
  color: #7f8c8d;
  font-size: 0.8rem;
}

/* 日時選択 */
.date-time-selection {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

.calendar-section h4,
.time-section h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.calendar {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 1.5rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.calendar-header h5 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.1rem;
}

.nav-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.nav-btn:hover {
  background: #5a6fd8;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: #667eea;
  padding: 0.5rem;
  font-size: 0.9rem;
}

.calendar-date {
  text-align: center;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.calendar-date.other-month {
  color: #bdc3c7;
}

.calendar-date.available {
  background: white;
  color: #2c3e50;
}

.calendar-date.available:hover {
  background: #667eea;
  color: white;
}

.calendar-date.selected {
  background: #667eea;
  color: white;
}

.calendar-date.disabled {
  background: #ecf0f1;
  color: #bdc3c7;
  cursor: not-allowed;
}

.time-slots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.5rem;
}

.time-slot {
  text-align: center;
  padding: 0.75rem;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.time-slot:hover {
  border-color: #667eea;
}

.time-slot.selected {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* フォーム */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
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

/* 予約確認 */
.booking-summary {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.booking-summary h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.summary-content {
  display: grid;
  gap: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
}

.summary-item .label {
  font-weight: 600;
  color: #2c3e50;
}

.summary-item .value {
  color: #667eea;
  font-weight: 600;
}

/* 予約アクション */
.booking-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.confirm-btn {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 1.2rem;
  padding: 1rem 3rem;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  border: 2px solid #667eea;
  color: #667eea;
  background: white;
  font-size: 1.2rem;
  padding: 1rem 3rem;
  border-radius: 50px;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #667eea;
  color: white;
}

/* レスポンシブデザイン */
@media (max-width: 1024px) {
  .date-time-selection {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .booking-header h1 {
    font-size: 2rem;
  }
  
  .facility-filters {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .booking-actions {
    flex-direction: column;
  }
  
  .booking-form {
    padding: 2rem 1rem;
  }
}
</style> 