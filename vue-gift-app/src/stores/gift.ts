import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Gift, GiftOrder, ConsultationAnswers, GiftConsultation } from '@/types'
import { giftApi, orderApi, consultationApi } from '@/services/api'
import type { ApiError } from '@/services/api'

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

  // アクション
  const fetchGifts = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await giftApi.getGifts()
      if (response.success && response.data) {
        gifts.value = response.data
      }
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'ギフトの取得に失敗しました'
      console.error('Failed to fetch gifts:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchGiftById = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      const response = await giftApi.getGift(id)
      if (response.success && response.data) {
        selectedGift.value = response.data
        return response.data
      }
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'ギフトの取得に失敗しました'
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
      const response = await giftApi.searchGifts(query)
      if (response.success && response.data) {
        gifts.value = response.data
      }
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'ギフトの検索に失敗しました'
      console.error('Failed to search gifts:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchGiftsByCategory = async (category: string) => {
    try {
      loading.value = true
      error.value = null
      const response = await giftApi.getGiftsByCategory(category)
      if (response.success && response.data) {
        gifts.value = response.data
      }
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'ギフトの取得に失敗しました'
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
      const response = await orderApi.createOrder(orderData)
      if (response.success && response.data) {
        orders.value.push(response.data)
        return response.data
      }
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : '注文の作成に失敗しました'
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
      const response = await orderApi.getOrders()
      if (response.success && response.data) {
        orders.value = response.data
      }
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : '注文の取得に失敗しました'
      console.error('Failed to fetch orders:', err)
    } finally {
      loading.value = false
    }
  }

  const cancelOrder = async (orderId: string) => {
    try {
      loading.value = true
      error.value = null
      await orderApi.cancelOrder(orderId)
      const orderIndex = orders.value.findIndex(order => order.id === orderId)
      if (orderIndex !== -1) {
        orders.value[orderIndex].status = 'cancelled'
      }
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : '注文のキャンセルに失敗しました'
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
      const response = await consultationApi.startConsultation(answers)
      if (response.success && response.data) {
        consultations.value.push(response.data)
        return response.data
      }
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : '相談の開始に失敗しました'
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
      const response = await consultationApi.getConsultations()
      if (response.success && response.data) {
        consultations.value = response.data
      }
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : '相談履歴の取得に失敗しました'
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