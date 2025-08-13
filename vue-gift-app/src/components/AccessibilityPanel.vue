<template>
  <div class="accessibility-panel" :class="{ 'panel-open': isOpen }">
    <!-- アクセシビリティボタン -->
    <button 
      @click="togglePanel" 
      class="accessibility-toggle"
      aria-label="アクセシビリティ設定を開く"
    >
      <span class="icon">♿</span>
      <span class="label">アクセシビリティ</span>
    </button>

    <!-- 設定パネル -->
    <div v-if="isOpen" class="accessibility-settings">
      <div class="settings-header">
        <h3>アクセシビリティ設定</h3>
        <button @click="togglePanel" class="close-button" aria-label="設定を閉じる">
          ✕
        </button>
      </div>

      <div class="settings-content">
        <!-- フォントサイズ調整 -->
        <div class="setting-group">
          <h4>文字サイズ</h4>
          <div class="font-size-controls">
            <button 
              @click="decreaseFontSize" 
              class="size-button"
              :disabled="settings.fontSize <= 12"
              aria-label="文字サイズを小さくする"
            >
              A-
            </button>
            <span class="current-size">{{ settings.fontSize }}px</span>
            <button 
              @click="increaseFontSize" 
              class="size-button"
              :disabled="settings.fontSize >= 24"
              aria-label="文字サイズを大きくする"
            >
              A+
            </button>
            <button 
              @click="resetFontSize" 
              class="reset-button"
              aria-label="文字サイズをリセット"
            >
              リセット
            </button>
          </div>
        </div>

        <!-- ハイコントラストモード -->
        <div class="setting-group">
          <h4>ハイコントラスト</h4>
          <label class="toggle-switch">
            <input 
              type="checkbox" 
              :checked="settings.highContrast"
              @change="toggleHighContrast"
            >
            <span class="slider"></span>
            <span class="label">高コントラストモード</span>
          </label>
          <p class="description">背景と文字のコントラストを高くして、読みやすくします</p>
        </div>

        <!-- アニメーション軽減 -->
        <div class="setting-group">
          <h4>アニメーション</h4>
          <label class="toggle-switch">
            <input 
              type="checkbox" 
              :checked="settings.reducedMotion"
              @change="toggleReducedMotion"
            >
            <span class="slider"></span>
            <span class="label">アニメーションを減らす</span>
          </label>
          <p class="description">動きのある要素を減らして、目への負担を軽減します</p>
        </div>

        <!-- 音声ガイド -->
        <div class="setting-group">
          <h4>音声ガイド</h4>
          <label class="toggle-switch">
            <input 
              type="checkbox" 
              :checked="settings.voiceGuide"
              @change="toggleVoiceGuide"
            >
            <span class="slider"></span>
            <span class="label">音声ガイドを有効にする</span>
          </label>
          <p class="description">重要な情報を音声で読み上げます</p>
          
          <button 
            v-if="settings.voiceGuide"
            @click="testVoiceGuide"
            class="test-voice-button"
          >
            音声ガイドをテスト
          </button>
        </div>

        <!-- キーボードナビゲーション説明 -->
        <div class="setting-group">
          <h4>キーボード操作</h4>
          <div class="keyboard-help">
            <p><strong>Tab</strong>: 次の要素に移動</p>
            <p><strong>Shift + Tab</strong>: 前の要素に移動</p>
            <p><strong>Enter / Space</strong>: 選択・実行</p>
            <p><strong>Esc</strong>: キャンセル・閉じる</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAccessibility } from '@/composables/useAccessibility'

const isOpen = ref(false)
const { 
  settings, 
  increaseFontSize, 
  decreaseFontSize, 
  resetFontSize,
  toggleHighContrast, 
  toggleReducedMotion, 
  toggleVoiceGuide,
  speak,
  initialize 
} = useAccessibility()

const togglePanel = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value && settings.value.voiceGuide) {
    speak('アクセシビリティ設定を開きました')
  }
}

const testVoiceGuide = () => {
  speak('音声ガイドが正常に動作しています。この機能により、重要な情報を音声で確認できます。')
}

onMounted(() => {
  initialize()
})
</script>

<style scoped>
.accessibility-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.accessibility-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: var(--font-size-base);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.accessibility-toggle:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.accessibility-toggle .icon {
  font-size: 18px;
}

.accessibility-settings {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  margin-top: 8px;
  overflow: hidden;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--color-primary);
  color: white;
}

.settings-header h3 {
  margin: 0;
  font-size: var(--font-size-large);
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.settings-content {
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.setting-group {
  margin-bottom: 24px;
}

.setting-group h4 {
  margin: 0 0 12px 0;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.font-size-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.size-button {
  padding: 8px 12px;
  border: 2px solid var(--color-primary);
  background: white;
  color: var(--color-primary);
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

.size-button:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
}

.size-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.current-size {
  min-width: 60px;
  text-align: center;
  font-weight: bold;
  color: var(--color-text-primary);
}

.reset-button {
  padding: 6px 12px;
  border: 1px solid var(--color-text-secondary);
  background: white;
  color: var(--color-text-secondary);
  border-radius: 4px;
  cursor: pointer;
  font-size: var(--font-size-small);
  transition: all 0.2s ease;
}

.reset-button:hover {
  background: var(--color-text-secondary);
  color: white;
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  margin-bottom: 8px;
}

.toggle-switch input {
  display: none;
}

.slider {
  position: relative;
  width: 48px;
  height: 24px;
  background: #ccc;
  border-radius: 12px;
  transition: background-color 0.3s ease;
}

.slider:before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.toggle-switch input:checked + .slider {
  background: var(--color-primary);
}

.toggle-switch input:checked + .slider:before {
  transform: translateX(24px);
}

.toggle-switch .label {
  font-weight: 500;
  color: var(--color-text-primary);
}

.description {
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.test-voice-button {
  margin-top: 8px;
  padding: 8px 16px;
  background: var(--color-secondary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: var(--font-size-small);
  transition: background-color 0.2s ease;
}

.test-voice-button:hover {
  background: var(--color-secondary-dark);
}

.keyboard-help {
  background: var(--color-background-secondary);
  padding: 12px;
  border-radius: 6px;
}

.keyboard-help p {
  margin: 4px 0;
  font-size: var(--font-size-small);
  color: var(--color-text-primary);
}

.keyboard-help strong {
  color: var(--color-primary);
}

/* ハイコントラストモード */
:global(.high-contrast) .accessibility-settings {
  background: black;
  color: white;
}

:global(.high-contrast) .settings-content {
  background: black;
}

:global(.high-contrast) .setting-group h4 {
  color: white;
}

:global(.high-contrast) .toggle-switch .label {
  color: white;
}

:global(.high-contrast) .description {
  color: #ccc;
}

/* アニメーション軽減 */
:global(.reduced-motion) .accessibility-toggle,
:global(.reduced-motion) .size-button,
:global(.reduced-motion) .reset-button,
:global(.reduced-motion) .test-voice-button {
  transition: none;
}

:global(.reduced-motion) .slider,
:global(.reduced-motion) .slider:before {
  transition: none;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .accessibility-settings {
    width: 280px;
    right: -20px;
  }
  
  .accessibility-toggle .label {
    display: none;
  }
  
  .font-size-controls {
    flex-wrap: wrap;
  }
}
</style> 