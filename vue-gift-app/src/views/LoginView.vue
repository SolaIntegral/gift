<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-header">
        <h1>🎁 GIFTS</h1>
        <p>健康ギフトプラットフォーム</p>
      </div>

      <div class="login-form">
        <div v-if="!showSignUp" class="signin-section">
          <h2>ログイン</h2>
          <form @submit.prevent="handleSignIn">
            <div class="form-group">
              <label for="email">メールアドレス</label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="form-control"
                placeholder="example@email.com"
              />
            </div>

            <div class="form-group">
              <label for="password">パスワード</label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                class="form-control"
                placeholder="パスワードを入力"
              />
            </div>

            <button type="submit" :disabled="loading" class="btn btn-primary">
              <span v-if="loading" class="loading-spinner"></span>
              {{ loading ? 'ログイン中...' : 'ログイン' }}
            </button>
          </form>

          <div class="form-actions">
            <button @click="showSignUp = true" class="btn btn-link">
              アカウントをお持ちでない方はこちら
            </button>
            <button @click="showResetPassword = true" class="btn btn-link">
              パスワードを忘れた方はこちら
            </button>
          </div>
        </div>

        <div v-if="showSignUp" class="signup-section">
          <h2>アカウント作成</h2>
          <form @submit.prevent="handleSignUp">
            <div class="form-group">
              <label for="signup-name">お名前</label>
              <input
                id="signup-name"
                v-model="name"
                type="text"
                required
                class="form-control"
                placeholder="山田太郎"
              />
            </div>

            <div class="form-group">
              <label for="signup-email">メールアドレス</label>
              <input
                id="signup-email"
                v-model="email"
                type="email"
                required
                class="form-control"
                placeholder="example@email.com"
              />
            </div>

            <div class="form-group">
              <label for="signup-password">パスワード</label>
              <input
                id="signup-password"
                v-model="password"
                type="password"
                required
                class="form-control"
                placeholder="8文字以上で入力"
                minlength="8"
              />
            </div>

            <div class="form-group">
              <label for="signup-confirm-password">パスワード（確認）</label>
              <input
                id="signup-confirm-password"
                v-model="confirmPassword"
                type="password"
                required
                class="form-control"
                placeholder="パスワードを再入力"
              />
            </div>

            <button type="submit" :disabled="loading || !isPasswordMatch" class="btn btn-primary">
              <span v-if="loading" class="loading-spinner"></span>
              {{ loading ? 'アカウント作成中...' : 'アカウント作成' }}
            </button>
          </form>

          <div class="form-actions">
            <button @click="showSignUp = false" class="btn btn-link">
              すでにアカウントをお持ちの方はこちら
            </button>
          </div>
        </div>

        <div v-if="showResetPassword" class="reset-password-section">
          <h2>パスワードリセット</h2>
          <p>登録済みのメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。</p>
          
          <form @submit.prevent="handleResetPassword">
            <div class="form-group">
              <label for="reset-email">メールアドレス</label>
              <input
                id="reset-email"
                v-model="resetEmail"
                type="email"
                required
                class="form-control"
                placeholder="example@email.com"
              />
            </div>

            <button type="submit" :disabled="loading" class="btn btn-primary">
              <span v-if="loading" class="loading-spinner"></span>
              {{ loading ? '送信中...' : 'リセットリンクを送信' }}
            </button>
          </form>

          <div class="form-actions">
            <button @click="showResetPassword = false" class="btn btn-link">
              ログインに戻る
            </button>
          </div>
        </div>
      </div>

      <!-- エラーメッセージ -->
      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="clearError" class="btn btn-secondary">閉じる</button>
      </div>

      <!-- 成功メッセージ -->
      <div v-if="successMessage" class="success-message">
        <p>{{ successMessage }}</p>
        <button @click="successMessage = ''" class="btn btn-secondary">閉じる</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// フォームデータ
const email = ref('')
const password = ref('')
const name = ref('')
const confirmPassword = ref('')
const resetEmail = ref('')

// UI状態
const showSignUp = ref(false)
const showResetPassword = ref(false)
const successMessage = ref('')

// 計算プロパティ
const loading = computed(() => authStore.loading)
const error = computed(() => authStore.error)
const isPasswordMatch = computed(() => password.value === confirmPassword.value && password.value.length >= 8)

// サインイン処理
const handleSignIn = async () => {
  const result = await authStore.signIn(email.value, password.value)
  if (result.success) {
    router.push('/')
  }
}

// サインアップ処理
const handleSignUp = async () => {
  if (!isPasswordMatch.value) {
    return
  }
  
  const result = await authStore.signUp(email.value, password.value, name.value)
  if (result.success) {
    successMessage.value = 'アカウントが作成されました。メールを確認してアカウントを有効化してください。'
    showSignUp.value = false
    // フォームをリセット
    email.value = ''
    password.value = ''
    name.value = ''
    confirmPassword.value = ''
  }
}

// パスワードリセット処理
const handleResetPassword = async () => {
  const result = await authStore.resetPassword(resetEmail.value)
  if (result.success) {
    successMessage.value = 'パスワードリセット用のリンクをメールで送信しました。'
    showResetPassword.value = false
    resetEmail.value = ''
  }
}

// エラークリア
const clearError = () => {
  authStore.clearError()
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  padding: 2rem;
}

.login-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 3rem;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  color: var(--color-primary);
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
}

.login-form h2 {
  color: var(--color-primary);
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--color-gray-light);
  color: var(--color-text-primary);
}

.btn-secondary:hover {
  background: var(--color-gray);
}

.btn-link {
  background: none;
  color: var(--color-primary);
  text-decoration: underline;
  padding: 0.5rem;
  font-size: 0.9rem;
}

.btn-link:hover {
  color: var(--color-secondary);
}

.form-actions {
  margin-top: 1.5rem;
  text-align: center;
}

.form-actions .btn-link {
  display: block;
  margin-bottom: 0.5rem;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message,
.success-message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.error-message {
  background: var(--color-danger);
  color: white;
}

.success-message {
  background: var(--color-success);
  color: white;
}

.error-message button,
.success-message button {
  margin-top: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  width: auto;
  padding: 0.5rem 1rem;
}

.reset-password-section p {
  text-align: center;
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .login-view {
    padding: 1rem;
  }
  
  .login-container {
    padding: 2rem;
  }
  
  .login-header h1 {
    font-size: 2rem;
  }
}
</style> 