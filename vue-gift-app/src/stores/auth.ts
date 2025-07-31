import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, AuthTokens, CognitoUser } from '@/types'
import { userApi } from '@/services/api'
import type { ApiError } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // 状態
  const user = ref<User | null>(null)
  const tokens = ref<AuthTokens | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 計算プロパティ
  const isAuthenticated = computed(() => !!user.value && !!tokens.value)
  const isTokenExpired = computed(() => {
    if (!tokens.value) return true
    const now = Date.now()
    const expiresAt = tokens.value.expiresIn * 1000
    return now >= expiresAt
  })

  // アクション
  const login = async (email: string, password: string) => {
    try {
      loading.value = true
      error.value = null
      
      // Cognito認証（実際の実装ではAWS Cognitoを使用）
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('ログインに失敗しました')
      }

      const authData = await response.json()
      tokens.value = authData.tokens
      user.value = authData.user

      // トークンをローカルストレージに保存
      localStorage.setItem('accessToken', authData.tokens.accessToken)
      localStorage.setItem('refreshToken', authData.tokens.refreshToken)
      localStorage.setItem('user', JSON.stringify(authData.user))

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'ログインに失敗しました'
      console.error('Login failed:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const register = async (userData: {
    email: string
    password: string
    name: string
    phone?: string
  }) => {
    try {
      loading.value = true
      error.value = null
      
      // Cognito登録（実際の実装ではAWS Cognitoを使用）
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error('登録に失敗しました')
      }

      const authData = await response.json()
      tokens.value = authData.tokens
      user.value = authData.user

      // トークンをローカルストレージに保存
      localStorage.setItem('accessToken', authData.tokens.accessToken)
      localStorage.setItem('refreshToken', authData.tokens.refreshToken)
      localStorage.setItem('user', JSON.stringify(authData.user))

    } catch (err) {
      error.value = err instanceof Error ? err.message : '登録に失敗しました'
      console.error('Registration failed:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    tokens.value = null
    
    // ローカルストレージから削除
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken')
      if (!refreshTokenValue) {
        throw new Error('リフレッシュトークンがありません')
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      })

      if (!response.ok) {
        throw new Error('トークンの更新に失敗しました')
      }

      const authData = await response.json()
      tokens.value = authData.tokens

      // 新しいトークンをローカルストレージに保存
      localStorage.setItem('accessToken', authData.tokens.accessToken)
      localStorage.setItem('refreshToken', authData.tokens.refreshToken)

    } catch (err) {
      console.error('Token refresh failed:', err)
      logout()
      throw err
    }
  }

  const fetchProfile = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await userApi.getProfile()
      if (response.success && response.data) {
        user.value = response.data
        localStorage.setItem('user', JSON.stringify(response.data))
      }
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'プロフィールの取得に失敗しました'
      console.error('Failed to fetch profile:', err)
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (userData: Partial<User>) => {
    try {
      loading.value = true
      error.value = null
      const response = await userApi.updateProfile(userData)
      if (response.success && response.data) {
        user.value = response.data
        localStorage.setItem('user', JSON.stringify(response.data))
      }
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'プロフィールの更新に失敗しました'
      console.error('Failed to update profile:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAccount = async () => {
    try {
      loading.value = true
      error.value = null
      await userApi.deleteAccount()
      logout()
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'アカウントの削除に失敗しました'
      console.error('Failed to delete account:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const initializeAuth = () => {
    // ローカルストレージから認証情報を復元
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    const userData = localStorage.getItem('user')

    if (accessToken && refreshToken && userData) {
      try {
        tokens.value = {
          accessToken,
          refreshToken,
          expiresIn: Date.now() + 3600000, // 1時間後（実際はJWTから取得）
        }
        user.value = JSON.parse(userData)
      } catch (err) {
        console.error('Failed to restore auth state:', err)
        logout()
      }
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // 状態
    user,
    tokens,
    loading,
    error,
    
    // 計算プロパティ
    isAuthenticated,
    isTokenExpired,
    
    // アクション
    login,
    register,
    logout,
    refreshToken,
    fetchProfile,
    updateProfile,
    deleteAccount,
    initializeAuth,
    clearError,
  }
}) 