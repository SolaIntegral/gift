import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Gift, GiftOrder, ConsultationAnswers, GiftConsultation } from '@/types'
// import { giftApi, orderApi, consultationApi } from '@/services/api' // 一時的に無効化
// import { ApiError } from '@/services/api' // 一時的に無効化

export const useGiftStore = defineStore('gift', () => {
  // 状態
  const gifts = ref<Gift[]>([])
  const selectedGift = ref<Gift | null>(null)
  const orders = ref<GiftOrder[]>([])
  const consultations = ref<GiftConsultation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 計算プロパティ
  const activeGifts = computed(() => 
    gifts.value.filter(gift => gift.status === 'active')
  )

  const giftsByCategory = computed(() => {
    const grouped: Record<string, Gift[]> = {}
    activeGifts.value.forEach(gift => {
      if (!grouped[gift.category]) {
        grouped[gift.category] = []
      }
      grouped[gift.category].push(gift)
    })
    return grouped
  })

  const pendingOrders = computed(() => 
    orders.value.filter(order => order.status === 'pending')
  )

  const completedOrders = computed(() => 
    orders.value.filter(order => order.status === 'completed')
  )

  // アクション（一時的に無効化）
  const fetchGifts = async () => {
    try {
      loading.value = true
      error.value = null
      console.log('Fetch gifts temporarily disabled')
      // TODO: API統合を再実装
    } catch (err) {
      error.value = 'ギフトの取得に失敗しました'
      console.error('Failed to fetch gifts:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchGiftById = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      console.log('Fetch gift by ID temporarily disabled')
      return null
    } catch (err) {
      error.value = 'ギフトの取得に失敗しました'
      console.error('Failed to fetch gift:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const searchGifts = async (query: string) => {
    try {
      loading.value = true
      error.value = null
      console.log('Search gifts temporarily disabled')
      // TODO: API統合を再実装
    } catch (err) {
      error.value = 'ギフトの検索に失敗しました'
      console.error('Failed to search gifts:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchGiftsByCategory = async (category: string) => {
    try {
      loading.value = true
      error.value = null
      console.log('Fetch gifts by category temporarily disabled')
      // TODO: API統合を再実装
    } catch (err) {
      error.value = 'ギフトの取得に失敗しました'
      console.error('Failed to fetch gifts by category:', err)
    } finally {
      loading.value = false
    }
  }

  const createOrder = async (orderData: {
    giftId: string
    recipientName: string
    recipientEmail: string
    message?: string
  }) => {
    try {
      loading.value = true
      error.value = null
      console.log('Create order temporarily disabled')
      throw new Error('注文機能は一時的に無効化されています')
    } catch (err) {
      error.value = '注文の作成に失敗しました'
      console.error('Failed to create order:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchOrders = async () => {
    try {
      loading.value = true
      error.value = null
      console.log('Fetch orders temporarily disabled')
      // TODO: API統合を再実装
    } catch (err) {
      error.value = '注文の取得に失敗しました'
      console.error('Failed to fetch orders:', err)
    } finally {
      loading.value = false
    }
  }

  const cancelOrder = async (orderId: string) => {
    try {
      loading.value = true
      error.value = null
      console.log('Cancel order temporarily disabled')
      throw new Error('注文キャンセル機能は一時的に無効化されています')
    } catch (err) {
      error.value = '注文のキャンセルに失敗しました'
      console.error('Failed to cancel order:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const startConsultation = async (answers: ConsultationAnswers) => {
    try {
      loading.value = true
      error.value = null
      console.log('Start consultation temporarily disabled')
      throw new Error('相談機能は一時的に無効化されています')
    } catch (err) {
      error.value = '相談の開始に失敗しました'
      console.error('Failed to start consultation:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchConsultations = async () => {
    try {
      loading.value = true
      error.value = null
      console.log('Fetch consultations temporarily disabled')
      // TODO: API統合を再実装
    } catch (err) {
      error.value = '相談履歴の取得に失敗しました'
      console.error('Failed to fetch consultations:', err)
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearSelectedGift = () => {
    selectedGift.value = null
  }

  return {
    // 状態
    gifts,
    selectedGift,
    orders,
    consultations,
    loading,
    error,
    
    // 計算プロパティ
    activeGifts,
    giftsByCategory,
    pendingOrders,
    completedOrders,
    
    // アクション
    fetchGifts,
    fetchGiftById,
    searchGifts,
    fetchGiftsByCategory,
    createOrder,
    fetchOrders,
    cancelOrder,
    startConsultation,
    fetchConsultations,
    clearError,
    clearSelectedGift,
  }
}) 