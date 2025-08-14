import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 一時的なユーザー型定義
interface User {
  id: string
  email: string
  name?: string
}

export const useAuthStore = defineStore('auth', () => {
  // 状態（常にゲストユーザー）
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 計算プロパティ（常にゲスト）
  const isAuthenticated = computed(() => false)
  const isGuest = computed(() => true)

  // 初期化（無効化）
  const initialize = async () => {
    console.log('Auth store initialized (authentication disabled)')
  }

  // サインアップ（無効化）
  const signUp = async (email: string, password: string, name: string) => {
    console.log('Sign up disabled - redirecting to registration promotion')
    return { success: false, error: '認証機能は無効化されています' }
  }

  // サインイン（無効化）
  const signIn = async (email: string, password: string) => {
    console.log('Sign in disabled - redirecting to registration promotion')
    return { success: false, error: '認証機能は無効化されています' }
  }

  // サインアウト（無効化）
  const signOut = async () => {
    console.log('Sign out disabled')
    return { success: true }
  }

  // パスワードリセット（無効化）
  const resetPassword = async (email: string) => {
    console.log('Password reset disabled')
    return { success: false, error: '認証機能は無効化されています' }
  }

  // パスワード更新（無効化）
  const updatePassword = async (newPassword: string) => {
    console.log('Password update disabled')
    return { success: false, error: '認証機能は無効化されています' }
  }

  // プロフィール更新（無効化）
  const updateProfile = async (updates: { name?: string; phone?: string }) => {
    console.log('Profile update disabled')
    return { success: false, error: '認証機能は無効化されています' }
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