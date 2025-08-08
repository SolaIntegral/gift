import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  // 状態
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 計算プロパティ
  const isAuthenticated = computed(() => !!user.value)
  const isGuest = computed(() => !user.value)

  // 初期化
  const initialize = async () => {
    try {
      loading.value = true
      
      // 現在のセッションを取得
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user ?? null

      // 認証状態の変更を監視
      supabase.auth.onAuthStateChange((event, session) => {
        user.value = session?.user ?? null
      })
    } catch (err) {
      console.error('Auth initialization error:', err)
      error.value = '認証の初期化に失敗しました'
    } finally {
      loading.value = false
    }
  }

  // サインアップ
  const signUp = async (email: string, password: string, name: string) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      })

      if (signUpError) throw signUpError

      if (data.user) {
        // ユーザープロフィールを作成
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name: name
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }
      }

      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'サインアップに失敗しました'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // サインイン
  const signIn = async (email: string, password: string) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) throw signInError

      user.value = data.user
      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'サインインに失敗しました'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // サインアウト
  const signOut = async () => {
    try {
      loading.value = true
      error.value = null

      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError

      user.value = null
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'サインアウトに失敗しました'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // パスワードリセット
  const resetPassword = async (email: string) => {
    try {
      loading.value = true
      error.value = null

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (resetError) throw resetError

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'パスワードリセットに失敗しました'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // パスワード更新
  const updatePassword = async (newPassword: string) => {
    try {
      loading.value = true
      error.value = null

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'パスワード更新に失敗しました'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // プロフィール更新
  const updateProfile = async (updates: { name?: string; phone?: string }) => {
    try {
      loading.value = true
      error.value = null

      if (!user.value) {
        throw new Error('ユーザーが認証されていません')
      }

      const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.value.id)

      if (updateError) throw updateError

      return { success: true }
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