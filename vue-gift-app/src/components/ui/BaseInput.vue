<template>
  <div class="input-wrapper" :class="wrapperClasses">
    <!-- ラベル -->
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="required-indicator" aria-label="必須">*</span>
    </label>
    
    <!-- 入力フィールド -->
    <div class="input-container" :class="containerClasses">
      <!-- プレフィックスアイコン -->
      <span v-if="prefixIcon" class="input-icon prefix-icon" aria-hidden="true">
        {{ prefixIcon }}
      </span>
      
      <!-- 入力要素 -->
      <component
        :is="inputType === 'textarea' ? 'textarea' : 'input'"
        :id="inputId"
        ref="inputRef"
        v-model="inputValue"
        :type="inputType === 'textarea' ? undefined : inputType"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxlength"
        :minlength="minlength"
        :pattern="pattern"
        :autocomplete="autocomplete"
        :autofocus="autofocus"
        :aria-label="ariaLabel"
        :aria-describedby="ariaDescribedby"
        :aria-invalid="hasError"
        :aria-required="required"
        :rows="inputType === 'textarea' ? rows : undefined"
        :cols="inputType === 'textarea' ? cols : undefined"
        class="base-input"
        :class="inputClasses"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />
      
      <!-- サフィックスアイコン -->
      <span v-if="suffixIcon" class="input-icon suffix-icon" aria-hidden="true">
        {{ suffixIcon }}
      </span>
      
      <!-- クリアボタン -->
      <button
        v-if="clearable && inputValue && !disabled"
        type="button"
        class="clear-button"
        aria-label="入力をクリア"
        @click="clearInput"
      >
        ✕
      </button>
      
      <!-- パスワード表示切り替え -->
      <button
        v-if="inputType === 'password'"
        type="button"
        class="password-toggle"
        :aria-label="showPassword ? 'パスワードを隠す' : 'パスワードを表示'"
        @click="togglePassword"
      >
        {{ showPassword ? '👁️' : '👁️‍🗨️' }}
      </button>
    </div>
    
    <!-- ヘルプテキスト -->
    <p v-if="helpText" class="help-text" :id="`${inputId}-help`">
      {{ helpText }}
    </p>
    
    <!-- エラーメッセージ -->
    <p v-if="errorMessage" class="error-message" :id="`${inputId}-error`">
      {{ errorMessage }}
    </p>
    
    <!-- 文字数カウンター -->
    <p v-if="showCounter" class="character-counter">
      {{ inputValue.length }}{{ maxlength ? `/${maxlength}` : '' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'

interface Props {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea'
  label?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  clearable?: boolean
  showCounter?: boolean
  maxlength?: number
  minlength?: number
  pattern?: string
  autocomplete?: string
  autofocus?: boolean
  prefixIcon?: string
  suffixIcon?: string
  helpText?: string
  errorMessage?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outlined'
  rows?: number
  cols?: number
  ariaLabel?: string
  ariaDescribedby?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'input', event: Event): void
  (e: 'change', event: Event): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'keydown', event: KeyboardEvent): void
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  clearable: false,
  showCounter: false,
  autofocus: false,
  size: 'md',
  variant: 'default',
  rows: 3,
  cols: 20
})

const emit = defineEmits<Emits>()

const inputRef = ref<HTMLInputElement | HTMLTextAreaElement>()
const inputValue = ref(props.modelValue || '')
const showPassword = ref(false)
const isFocused = ref(false)

// ユニークID生成
const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

// 入力タイプ（パスワード表示切り替え対応）
const inputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

// エラー状態
const hasError = computed(() => !!props.errorMessage)

// クラス名
const wrapperClasses = computed(() => [
  'input-wrapper',
  `input-size-${props.size}`,
  {
    'input-error': hasError.value,
    'input-disabled': props.disabled,
    'input-focused': isFocused.value
  }
])

const containerClasses = computed(() => [
  'input-container',
  `input-variant-${props.variant}`,
  {
    'has-prefix': !!props.prefixIcon,
    'has-suffix': !!props.suffixIcon || props.clearable || props.type === 'password'
  }
])

const inputClasses = computed(() => [
  'base-input',
  {
    'input-error': hasError.value,
    'input-disabled': props.disabled,
    'input-focused': isFocused.value
  }
])

// イベントハンドラー
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  inputValue.value = target.value
  emit('update:modelValue', target.value)
  emit('input', event)
}

const handleChange = (event: Event) => {
  emit('change', event)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}

const clearInput = () => {
  inputValue.value = ''
  emit('update:modelValue', '')
  emit('clear')
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// フォーカスメソッド
const focus = () => {
  inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.blur()
}

// 外部からアクセス可能なメソッド
defineExpose({
  focus,
  blur,
  inputRef
})
</script>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  width: 100%;
}

/* ラベル */
.input-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.required-indicator {
  color: var(--color-danger);
  font-weight: var(--font-weight-bold);
}

/* 入力コンテナ */
.input-container {
  position: relative;
  display: flex;
  align-items: center;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-fast);
  min-height: var(--touch-target-size);
}

.input-container:hover:not(.input-disabled) {
  border-color: var(--color-primary-light);
}

.input-container.input-focused {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.input-container.input-error {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

/* 入力バリアント */
.input-variant-default {
  background-color: var(--color-background);
}

.input-variant-filled {
  background-color: var(--color-background-secondary);
}

.input-variant-filled:hover:not(.input-disabled) {
  background-color: var(--color-background-tertiary);
}

.input-variant-outlined {
  background-color: transparent;
  border-width: 2px;
}

/* 入力サイズ */
.input-size-sm .input-container {
  min-height: 36px;
  padding: var(--spacing-2) var(--spacing-3);
}

.input-size-sm .base-input {
  font-size: var(--font-size-sm);
}

.input-size-md .input-container {
  min-height: 44px;
  padding: var(--spacing-3) var(--spacing-4);
}

.input-size-md .base-input {
  font-size: var(--font-size-base);
}

.input-size-lg .input-container {
  min-height: 48px;
  padding: var(--spacing-4) var(--spacing-5);
}

.input-size-lg .base-input {
  font-size: var(--font-size-lg);
}

/* 入力フィールド */
.base-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--color-text-primary);
  font-family: inherit;
  line-height: var(--line-height-normal);
  resize: vertical;
  min-height: inherit;
}

.base-input::placeholder {
  color: var(--color-text-muted);
  opacity: 1;
}

.base-input:disabled {
  color: var(--color-text-muted);
  cursor: not-allowed;
  background-color: var(--color-background-secondary);
}

.base-input:read-only {
  color: var(--color-text-secondary);
  background-color: var(--color-background-secondary);
}

/* アイコン */
.input-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-size: 1.2em;
  line-height: 1;
  flex-shrink: 0;
}

.prefix-icon {
  margin-right: var(--spacing-2);
}

.suffix-icon {
  margin-left: var(--spacing-2);
}

/* ボタン */
.clear-button,
.password-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--spacing-1);
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
  min-height: 32px;
  min-width: 32px;
  margin-left: var(--spacing-2);
}

.clear-button:hover,
.password-toggle:hover {
  background-color: var(--color-background-secondary);
  color: var(--color-text-primary);
}

.clear-button:focus,
.password-toggle:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* ヘルプテキスト */
.help-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--line-height-normal);
}

/* エラーメッセージ */
.error-message {
  font-size: var(--font-size-xs);
  color: var(--color-danger);
  margin: 0;
  line-height: var(--line-height-normal);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.error-message::before {
  content: '⚠️';
  font-size: 1em;
}

/* 文字数カウンター */
.character-counter {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
  text-align: right;
  line-height: var(--line-height-normal);
}

/* フォーカス状態 */
.input-container:focus-within {
  outline: none;
}

/* モバイル最適化 */
@media (max-width: 768px) {
  .input-container {
    border-radius: var(--mobile-border-radius);
    min-height: var(--touch-target-size);
  }
  
  .input-size-sm .input-container {
    min-height: 44px;
    padding: var(--spacing-2) var(--spacing-3);
  }
  
  .input-size-md .input-container {
    min-height: 44px;
    padding: var(--spacing-3) var(--spacing-4);
  }
  
  .input-size-lg .input-container {
    min-height: 48px;
    padding: var(--spacing-4) var(--spacing-5);
  }
  
  /* タッチ操作の最適化 */
  .clear-button,
  .password-toggle {
    min-height: 44px;
    min-width: 44px;
    padding: var(--spacing-2);
  }
  
  /* モバイルでのフォントサイズ調整 */
  .input-size-sm .base-input {
    font-size: 16px; /* iOS Safariでのズーム防止 */
  }
  
  .input-size-md .base-input {
    font-size: 16px;
  }
  
  .input-size-lg .base-input {
    font-size: 16px;
  }
}

/* 高コントラストモード対応 */
@media (prefers-contrast: high) {
  .input-container {
    border-width: 2px;
  }
  
  .input-variant-outlined {
    border-width: 3px;
  }
  
  .clear-button,
  .password-toggle {
    border: 1px solid currentColor;
  }
}

/* アニメーション軽減対応 */
@media (prefers-reduced-motion: reduce) {
  .input-container {
    transition: none;
  }
  
  .clear-button,
  .password-toggle {
    transition: none;
  }
}

/* ダークモード対応 */
@media (prefers-color-scheme: dark) {
  .input-variant-filled {
    background-color: var(--color-background-tertiary);
  }
  
  .input-variant-filled:hover:not(.input-disabled) {
    background-color: var(--color-gray-600);
  }
  
  .base-input:disabled,
  .base-input:read-only {
    background-color: var(--color-background-tertiary);
  }
}
</style> 