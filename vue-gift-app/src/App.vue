<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(() => {
  // 認証状態の初期化
  authStore.initialize()
})
</script>

<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<style>
/* グローバルスタイル */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
  line-height: 1.6;
  color: var(--color-text-primary);
  background-color: var(--color-background);
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* CSS変数の定義 */
:root {
  --color-primary: #ff6b35;
  --color-secondary: #f7931e;
  --color-accent: #4ecdc4;
  --color-success: #2ecc71;
  --color-danger: #e74c3c;
  --color-warning: #f39c12;
  --color-info: #3498db;
  
  --color-text-primary: #2c3e50;
  --color-text-secondary: #7f8c8d;
  --color-text-light: #95a5a6;
  
  --color-background: #ffffff;
  --color-background-secondary: #f8f9fa;
  --color-background-dark: #2c3e50;
  
  --color-border: #e9ecef;
  --color-border-light: #f1f3f4;
  
  --color-gray-light: #f8f9fa;
  --color-gray: #6c757d;
  --color-gray-dark: #495057;
  
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1);
  
  --border-radius: 8px;
  --border-radius-sm: 4px;
  --border-radius-lg: 12px;
  
  --transition: all 0.3s ease;
}

/* ダークモード対応 */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text-primary: #ecf0f1;
    --color-text-secondary: #bdc3c7;
    --color-background: #2c3e50;
    --color-background-secondary: #34495e;
    --color-border: #34495e;
  }
}

/* ユーティリティクラス */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition);
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: var(--color-gray-light);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-gray);
  color: white;
}

.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.btn-outline:hover {
  background: var(--color-primary);
  color: white;
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
  .container {
    padding: 0 0.5rem;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
