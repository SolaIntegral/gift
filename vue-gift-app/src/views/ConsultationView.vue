<template>
  <div class="consultation-view">
    <div class="page-header">
      <div class="container">
        <h1>🎁 ギフト相談</h1>
        <p>AIが最適な健康ギフトを提案いたします</p>
      </div>
    </div>

    <div class="container">
      <GiftConsultation />
    </div>
  </div>
</template>

<script setup lang="ts">
import GiftConsultation from '@/components/GiftConsultation.vue'
</script>

<style scoped>
.consultation-view {
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
}
</style> 