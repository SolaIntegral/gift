<template>
  <div
    :class="cardClasses"
    :role="role"
    :aria-label="ariaLabel"
    :aria-describedby="ariaDescribedby"
  >
    <!-- カードヘッダー -->
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
        <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
      </slot>
    </div>
    
    <!-- カード画像 -->
    <div v-if="$slots.image" class="card-image">
      <slot name="image" />
    </div>
    
    <!-- カードコンテンツ -->
    <div class="card-content">
      <slot />
    </div>
    
    <!-- カードフッター -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled'
  size?: 'sm' | 'md' | 'lg'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  rounded?: boolean
  interactive?: boolean
  disabled?: boolean
  title?: string
  subtitle?: string
  role?: string
  ariaLabel?: string
  ariaDescribedby?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  padding: 'md',
  rounded: true,
  interactive: false,
  disabled: false
})

const cardClasses = computed(() => [
  'base-card',
  `card-${props.variant}`,
  `card-${props.size}`,
  `card-padding-${props.padding}`,
  {
    'card-rounded': props.rounded,
    'card-interactive': props.interactive,
    'card-disabled': props.disabled
  }
])
</script>

<style scoped>
.base-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  transition: all var(--transition-normal);
  min-height: 0;
}

/* カードバリアント */
.card-default {
  box-shadow: var(--shadow-sm);
}

.card-elevated {
  box-shadow: var(--shadow-lg);
}

.card-elevated:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-2px);
}

.card-outlined {
  border: 2px solid var(--color-border);
  box-shadow: none;
}

.card-outlined:hover {
  border-color: var(--color-primary);
}

.card-filled {
  background-color: var(--color-background-secondary);
  border: none;
  box-shadow: none;
}

.card-filled:hover {
  background-color: var(--color-background-tertiary);
}

/* カードサイズ */
.card-sm {
  max-width: 320px;
}

.card-md {
  max-width: 480px;
}

.card-lg {
  max-width: 640px;
}

/* パディング */
.card-padding-none .card-content {
  padding: 0;
}

.card-padding-sm .card-content {
  padding: var(--spacing-3);
}

.card-padding-md .card-content {
  padding: var(--spacing-4);
}

.card-padding-lg .card-content {
  padding: var(--spacing-6);
}

/* 角丸 */
.card-rounded {
  border-radius: var(--border-radius-xl);
}

/* インタラクティブ */
.card-interactive {
  cursor: pointer;
  user-select: none;
}

.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.card-interactive:active {
  transform: translateY(0);
  box-shadow: var(--shadow-md);
}

/* 無効状態 */
.card-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.card-disabled:hover {
  transform: none;
  box-shadow: var(--shadow-sm);
}

/* カードヘッダー */
.card-header {
  padding: var(--spacing-4);
  padding-bottom: var(--spacing-2);
  border-bottom: 1px solid var(--color-border-light);
  background-color: var(--color-background-secondary);
}

.card-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

.card-subtitle {
  margin: var(--spacing-1) 0 0 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

/* カード画像 */
.card-image {
  position: relative;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: auto;
  display: block;
}

/* カードコンテンツ */
.card-content {
  flex: 1;
  padding: var(--spacing-4);
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);
}

/* カードフッター */
.card-footer {
  padding: var(--spacing-4);
  padding-top: var(--spacing-2);
  border-top: 1px solid var(--color-border-light);
  background-color: var(--color-background-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-3);
}

/* フォーカス状態 */
.base-card:focus-within {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* モバイル最適化 */
@media (max-width: 768px) {
  .base-card {
    border-radius: var(--mobile-border-radius);
  }
  
  .card-rounded {
    border-radius: var(--mobile-border-radius);
  }
  
  /* モバイルでのパディング調整 */
  .card-padding-sm .card-content {
    padding: var(--spacing-2);
  }
  
  .card-padding-md .card-content {
    padding: var(--spacing-3);
  }
  
  .card-padding-lg .card-content {
    padding: var(--spacing-4);
  }
  
  .card-header {
    padding: var(--spacing-3);
    padding-bottom: var(--spacing-2);
  }
  
  .card-footer {
    padding: var(--spacing-3);
    padding-top: var(--spacing-2);
  }
  
  /* モバイルでのサイズ調整 */
  .card-sm,
  .card-md,
  .card-lg {
    max-width: none;
    width: 100%;
  }
  
  /* タッチ操作の最適化 */
  .card-interactive {
    -webkit-tap-highlight-color: transparent;
  }
  
  .card-interactive:active {
    transform: scale(0.98);
  }
}

/* 高コントラストモード対応 */
@media (prefers-contrast: high) {
  .base-card {
    border-width: 2px;
  }
  
  .card-outlined {
    border-width: 3px;
  }
  
  .card-header,
  .card-footer {
    border-width: 2px;
  }
}

/* アニメーション軽減対応 */
@media (prefers-reduced-motion: reduce) {
  .base-card {
    transition: none;
  }
  
  .card-interactive:hover,
  .card-elevated:hover {
    transform: none;
  }
  
  .card-interactive:active {
    transform: none;
  }
}

/* ダークモード対応 */
@media (prefers-color-scheme: dark) {
  .card-header,
  .card-footer {
    background-color: var(--color-background-tertiary);
    border-color: var(--color-border);
  }
  
  .card-filled {
    background-color: var(--color-background-tertiary);
  }
  
  .card-filled:hover {
    background-color: var(--color-gray-600);
  }
}
</style> 