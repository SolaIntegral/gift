import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// import { supabase } from '@/services/supabase' // 一時的に無効化
// import type { User } from '@supabase/supabase-js' // 一時的に無効化

// 一時的なユーザー型定義
interface User {
  id: string
  email: string
  name?: string
}

export const useAuthStore = defineStore('auth', () => {
  // 状態
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 計算プロパティ
  const isAuthenticated = computed(() => !!user.value)
  const isGuest = computed(() => !user.value)

  // 初期化（一時的に無効化）
  const initialize = async () => {
    try {
      loading.value = true
      console.log('Auth store initialized (temporarily disabled)')
      // TODO: Supabase統合を再実装
    } catch (err) {
      console.error('Auth initialization error:', err)
      error.value = '認証の初期化に失敗しました'
    } finally {
      loading.value = false
    }
  }

  // サインアップ（一時的に無効化）
  const signUp = async (email: string, password: string, name: string) => {
    try {
      loading.value = true
      error.value = null
      console.log('Sign up temporarily disabled')
      return { success: false, error: '認証機能は一時的に無効化されています' }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'サインアップに失敗しました'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // サインイン（一時的に無効化）
  const signIn = async (email: string, password: string) => {
    try {
      loading.value = true
      error.value = null
      console.log('Sign in temporarily disabled')
      return { success: false, error: '認証機能は一時的に無効化されています' }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'サインインに失敗しました'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // サインアウト（一時的に無効化）
  const signOut = async () => {
    try {
      loading.value = true
      error.value = null
      console.log('Sign out temporarily disabled')
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'サインアウトに失敗しました'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // パスワードリセット（一時的に無効化）
  const resetPassword = async (email: string) => {
    try {
      loading.value = true
      error.value = null
      console.log('Password reset temporarily disabled')
      return { success: false, error: '認証機能は一時的に無効化されています' }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'パスワードリセットに失敗しました'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // パスワード更新（一時的に無効化）
  const updatePassword = async (newPassword: string) => {
    try {
      loading.value = true
      error.value = null
      console.log('Password update temporarily disabled')
      return { success: false, error: '認証機能は一時的に無効化されています' }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'パスワード更新に失敗しました'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // プロフィール更新（一時的に無効化）
  const updateProfile = async (updates: { name?: string; phone?: string }) => {
    try {
      loading.value = true
      error.value = null
      console.log('Profile update temporarily disabled')
      return { success: false, error: '認証機能は一時的に無効化されています' }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'プロフィール更新に失敗しました'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // エラークリア
  const clearError = () => {
    error.value = null
  }

  return {
    // 状態
    user,
    loading,
    error,
    
    // 計算プロパティ
    isAuthenticated,
    isGuest,
    
    // アクション
    initialize,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    clearError,
  }
}) 