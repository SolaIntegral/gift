<template>
  <div class="not-found-view">
    <div class="page-header">
      <div class="container">
        <h1>404</h1>
        <p>ページが見つかりません</p>
      </div>
    </div>

    <div class="container">
      <div class="not-found-content">
        <div class="error-icon">🔍</div>
        <h2>お探しのページが見つかりませんでした</h2>
        <p>URLが正しいかご確認ください。</p>
        <router-link to="/" class="btn btn-primary">ホームに戻る</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404ページの実装
</script>

<style scoped>
.not-found-view {
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
  font-size: 4rem;
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

.not-found-content {
  background: white;
  border-radius: 12px;
  padding: 3rem;
  margin: 2rem 0;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 2rem;
}

.not-found-content h2 {
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.not-found-content p {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
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
    font-size: 3rem;
  }
  
  .page-header p {
    font-size: 1rem;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .not-found-content {
    padding: 2rem;
  }
  
  .error-icon {
    font-size: 3rem;
  }
}
</style> 