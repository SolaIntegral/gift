<template>
  <div class="profile-view">
    <div class="page-header">
      <div class="container">
        <h1>👤 プロフィール</h1>
        <p>アカウント情報の管理</p>
      </div>
    </div>

    <div class="container">
      <div class="profile-content">
        <p>プロフィールページ（開発中）</p>
        <router-link to="/" class="btn btn-primary">ホームに戻る</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// プロフィール機能の実装は後で追加
</script>

<style scoped>
.profile-view {
  min-height: 100vh;
  background: #f8f9fa;
}

.page-header {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  padding: 3rem 0;
  text-align: center;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.page-header p {
  font-size: 1.25rem;
  opacity: 0.9;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.profile-content {
  background: white;
  border-radius: 12px;
  padding: 3rem;
  margin: 2rem 0;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
}

@media (max-width: 768px) {
  .page-header {
    padding: 2rem 0;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .page-header p {
    font-size: 1rem;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .profile-content {
    padding: 2rem;
  }
}
</style> 