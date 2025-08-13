import { ref, watch } from 'vue'

export interface AccessibilitySettings {
  fontSize: number
  highContrast: boolean
  reducedMotion: boolean
  voiceGuide: boolean
}

export const useAccessibility = () => {
  // アクセシビリティ設定
  const settings = ref<AccessibilitySettings>({
    fontSize: 16,
    highContrast: false,
    reducedMotion: false,
    voiceGuide: false
  })

  // ローカルストレージから設定を読み込み
  const loadSettings = () => {
    const saved = localStorage.getItem('accessibility-settings')
    if (saved) {
      settings.value = { ...settings.value, ...JSON.parse(saved) }
    }
  }

  // 設定をローカルストレージに保存
  const saveSettings = () => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings.value))
  }

  // フォントサイズ調整
  const increaseFontSize = () => {
    if (settings.value.fontSize < 24) {
      settings.value.fontSize += 2
      applyFontSize()
    }
  }

  const decreaseFontSize = () => {
    if (settings.value.fontSize > 12) {
      settings.value.fontSize -= 2
      applyFontSize()
    }
  }

  const resetFontSize = () => {
    settings.value.fontSize = 16
    applyFontSize()
  }

  // フォントサイズをCSSに適用
  const applyFontSize = () => {
    document.documentElement.style.setProperty('--font-size-base', `${settings.value.fontSize}px`)
    document.documentElement.style.setProperty('--font-size-large', `${settings.value.fontSize + 4}px`)
    document.documentElement.style.setProperty('--font-size-small', `${settings.value.fontSize - 2}px`)
  }

  // ハイコントラストモード
  const toggleHighContrast = () => {
    settings.value.highContrast = !settings.value.highContrast
    applyHighContrast()
  }

  const applyHighContrast = () => {
    if (settings.value.highContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }

  // アニメーション軽減
  const toggleReducedMotion = () => {
    settings.value.reducedMotion = !settings.value.reducedMotion
    applyReducedMotion()
  }

  const applyReducedMotion = () => {
    if (settings.value.reducedMotion) {
      document.documentElement.classList.add('reduced-motion')
    } else {
      document.documentElement.classList.remove('reduced-motion')
    }
  }

  // 音声ガイド
  const toggleVoiceGuide = () => {
    settings.value.voiceGuide = !settings.value.voiceGuide
  }

  const speak = (text: string) => {
    if (settings.value.voiceGuide && 'speechSynthesis' in window) {
      // 既存の音声を停止
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ja-JP'
      utterance.rate = 0.9 // 少しゆっくり
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      speechSynthesis.speak(utterance)
    }
  }

  // 設定変更を監視して自動保存
  watch(settings, saveSettings, { deep: true })

  // 初期化
  const initialize = () => {
    loadSettings()
    applyFontSize()
    applyHighContrast()
    applyReducedMotion()
  }

  return {
    settings,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    toggleVoiceGuide,
    speak,
    initialize
  }
} 