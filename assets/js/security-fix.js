// セキュリティ関連の修正とベストプラクティス

// XSS攻撃対策
function sanitizeInput(input) {
  if (typeof input !== "string") return input

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

// HTMLエスケープ関数
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// 安全なDOM操作
function safeSetTextContent(element, text) {
  if (element && typeof text === "string") {
    element.textContent = sanitizeInput(text)
  }
}

function safeSetInnerHTML(element, html) {
  if (element && typeof html === "string") {
    element.innerHTML = sanitizeInput(html)
  }
}

// CSRFトークン生成（ダミー実装）
function generateCSRFToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// 安全なローカルストレージ操作
const SafeStorage = {
  set: (key, value) => {
    try {
      if (typeof key !== "string") {
        throw new Error("Key must be a string")
      }
      const sanitizedKey = sanitizeInput(key)
      const sanitizedValue = typeof value === "string" ? sanitizeInput(value) : JSON.stringify(value)
      localStorage.setItem(sanitizedKey, sanitizedValue)
    } catch (error) {
      console.error("Storage error:", error)
    }
  },

  get: (key) => {
    try {
      if (typeof key !== "string") {
        throw new Error("Key must be a string")
      }
      const sanitizedKey = sanitizeInput(key)
      const value = localStorage.getItem(sanitizedKey)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error("Storage error:", error)
      return null
    }
  },

  remove: (key) => {
    try {
      if (typeof key !== "string") {
        throw new Error("Key must be a string")
      }
      const sanitizedKey = sanitizeInput(key)
      localStorage.removeItem(sanitizedKey)
    } catch (error) {
      console.error("Storage error:", error)
    }
  },
}

// 入力値検証
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePhoneNumber(phone) {
  const phoneRegex = /^[\d\-+$$$$\s]+$/
  return phoneRegex.test(phone) && phone.length >= 10
}

function validateGiftId(giftId) {
  const giftIdRegex = /^gift_[a-zA-Z0-9]{9}$/
  return giftIdRegex.test(giftId)
}

// レート制限（簡易実装）
const RateLimit = {
  attempts: new Map(),

  isAllowed: function (key, maxAttempts = 5, timeWindow = 300000) {
    // 5分間で5回まで
    const now = Date.now()
    const attempts = this.attempts.get(key) || []

    // 時間窓外の試行を削除
    const validAttempts = attempts.filter((time) => now - time < timeWindow)

    if (validAttempts.length >= maxAttempts) {
      return false
    }

    validAttempts.push(now)
    this.attempts.set(key, validAttempts)
    return true
  },

  reset: function (key) {
    this.attempts.delete(key)
  },
}

// セキュアなランダム文字列生成
function generateSecureRandomString(length = 16) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""

  if (window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length)
    window.crypto.getRandomValues(array)
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length]
    }
  } else {
    // フォールバック（セキュリティが低い）
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
  }

  return result
}

// Content Security Policy 違反の監視
if (typeof window !== "undefined") {
  document.addEventListener("securitypolicyviolation", (e) => {
    console.warn("CSP Violation:", {
      blockedURI: e.blockedURI,
      violatedDirective: e.violatedDirective,
      originalPolicy: e.originalPolicy,
    })

    // 本番環境では適切なログ収集サービスに送信
    // sendToSecurityLog(e)
  })
}

// 安全なイベントリスナー追加
function addSafeEventListener(element, event, handler, options = {}) {
  if (!element || typeof handler !== "function") {
    console.error("Invalid parameters for event listener")
    return
  }

  const safeHandler = function (e) {
    try {
      handler.call(this, e)
    } catch (error) {
      console.error("Event handler error:", error)
    }
  }

  element.addEventListener(event, safeHandler, options)
}

// フォーム送信時のセキュリティチェック
function secureFormSubmit(form, submitHandler) {
  if (!form || typeof submitHandler !== "function") {
    console.error("Invalid form or handler")
    return
  }

  addSafeEventListener(form, "submit", (e) => {
    e.preventDefault()

    // レート制限チェック
    const formId = form.id || "unknown-form"
    if (!RateLimit.isAllowed(formId)) {
      alert("送信回数が制限を超えました。しばらく待ってから再試行してください。")
      return
    }

    // フォームデータの検証
    const formData = new FormData(form)
    let isValid = true

    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value.length > 1000) {
        console.warn("Form field too long:", key)
        isValid = false
      }
    }

    if (!isValid) {
      alert("入力データが無効です。")
      return
    }

    submitHandler(formData)
  })
}

// セキュリティヘッダーの確認（開発用）
function checkSecurityHeaders() {
  if (typeof window === "undefined") return

  const requiredHeaders = ["X-Content-Type-Options", "X-Frame-Options", "X-XSS-Protection"]

  // 実際の実装では fetch でヘッダーをチェック
  console.log("Security headers should be checked on server side")
}

// エクスポート（モジュール環境用）
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    sanitizeInput,
    escapeHtml,
    safeSetTextContent,
    safeSetInnerHTML,
    generateCSRFToken,
    SafeStorage,
    validateEmail,
    validatePhoneNumber,
    validateGiftId,
    RateLimit,
    generateSecureRandomString,
    addSafeEventListener,
    secureFormSubmit,
    checkSecurityHeaders,
  }
}

console.log("Security fixes loaded")
