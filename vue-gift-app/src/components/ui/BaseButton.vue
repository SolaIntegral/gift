<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    :aria-label="ariaLabel"
    :aria-describedby="ariaDescribedby"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <!-- ローディングスピナー -->
    <span v-if="loading" class="button-spinner" aria-hidden="true">
      <svg class="spinner" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="31.416">
          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
        </circle>
      </svg>
    </span>
    
    <!-- アイコン（左） -->
    <span v-if="iconLeft" class="button-icon icon-left" aria-hidden="true">
      {{ iconLeft }}
    </span>
    
    <!-- ボタンテキスト -->
    <span v-if="$slots.default" class="button-text">
      <slot />
    </span>
    
    <!-- アイコン（右） -->
    <span v-if="iconRight" class="button-icon icon-right" aria-hidden="true">
      {{ iconRight }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
  rounded?: boolean
  iconLeft?: string
  iconRight?: string
  ariaLabel?: string
  ariaDescribedby?: string
}

interface Emits {
  (e: 'click', event: MouseEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  fullWidth: false,
  rounded: false
})

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => [
  'base-button',
  `button-${props.variant}`,
  `button-${props.size}`,
  {
    'button-full-width': props.fullWidth,
    'button-rounded': props.rounded,
    'button-loading': props.loading,
    'button-disabled': props.disabled
  }
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}
</script>

<style scoped>
.base-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  font-family: var(--font-family);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  border: none;
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  min-height: var(--touch-target-size);
  min-width: var(--touch-target-size);
}

/* ボタンサイズ */
.button-xs {
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-xs);
  min-height: 32px;
  min-width: 32px;
}

.button-sm {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  min-height: 36px;
  min-width: 36px;
}

.button-md {
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-base);
  min-height: 44px;
  min-width: 44px;
}

.button-lg {
  padding: var(--spacing-4) var(--spacing-5);
  font-size: var(--font-size-lg);
  min-height: 48px;
  min-width: 48px;
}

.button-xl {
  padding: var(--spacing-5) var(--spacing-6);
  font-size: var(--font-size-xl);
  min-height: 56px;
  min-width: 56px;
}

/* ボタンバリアント */
.button-primary {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-sm);
}

.button-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.button-primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.button-secondary {
  background-color: var(--color-secondary);
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-sm);
}

.button-secondary:hover:not(:disabled) {
  background-color: var(--color-secondary-dark);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.button-secondary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.button-success {
  background-color: var(--color-success);
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-sm);
}

.button-success:hover:not(:disabled) {
  background-color: var(--color-success-light);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.button-danger {
  background-color: var(--color-danger);
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-sm);
}

.button-danger:hover:not(:disabled) {
  background-color: var(--color-danger-light);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.button-warning {
  background-color: var(--color-warning);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-sm);
}

.button-warning:hover:not(:disabled) {
  background-color: var(--color-warning-light);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.button-info {
  background-color: var(--color-info);
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-sm);
}

.button-info:hover:not(:disabled) {
  background-color: var(--color-info-light);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.button-ghost {
  background-color: transparent;
  color: var(--color-text-primary);
  border: 1px solid transparent;
}

.button-ghost:hover:not(:disabled) {
  background-color: var(--color-background-secondary);
  border-color: var(--color-border);
}

.button-outline {
  background-color: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.button-outline:hover:not(:disabled) {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  transform: translateY(-1px);
}

/* フル幅 */
.button-full-width {
  width: 100%;
}

/* 角丸 */
.button-rounded {
  border-radius: var(--border-radius-full);
}

/* ローディング状態 */
.button-loading {
  cursor: wait;
}

.button-loading .button-text {
  opacity: 0.7;
}

/* 無効状態 */
.button-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.button-disabled:hover {
  transform: none;
  box-shadow: var(--shadow-sm);
}

/* アイコン */
.button-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  line-height: 1;
}

.icon-left {
  margin-right: var(--spacing-1);
}

.icon-right {
  margin-left: var(--spacing-1);
}

/* スピナー */
.button-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-2);
}

.spinner {
  width: 1em;
  height: 1em;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* フォーカス状態 */
.base-button:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* モバイル最適化 */
@media (max-width: 768px) {
  .base-button {
    /* タッチターゲットの最小サイズ確保 */
    min-height: var(--touch-target-size);
    min-width: var(--touch-target-size);
  }
  
  .button-xs {
    min-height: 44px;
    min-width: 44px;
  }
  
  .button-sm {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* モバイルでのパディング調整 */
  .button-md {
    padding: var(--spacing-3) var(--spacing-4);
  }
  
  .button-lg {
    padding: var(--spacing-4) var(--spacing-5);
  }
  
  .button-xl {
    padding: var(--spacing-5) var(--spacing-6);
  }
}

/* 高コントラストモード対応 */
@media (prefers-contrast: high) {
  .base-button {
    border: 2px solid currentColor;
  }
  
  .button-outline {
    border-width: 3px;
  }
}

/* アニメーション軽減対応 */
@media (prefers-reduced-motion: reduce) {
  .base-button {
    transition: none;
  }
  
  .base-button:hover {
    transform: none;
  }
  
  .spinner {
    animation: none;
  }
}
</style> 