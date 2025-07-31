// サービス紹介ページのJavaScript

// ページ初期化
function initServiceInfoPage() {
  console.log("Initializing service info page...")

  // イベントリスナーの設定
  setupEventListeners()

  // アニメーション設定
  setupAnimations()

  console.log("Service info page initialized successfully")
}

// イベントリスナー設定
function setupEventListeners() {
  // FAQ アコーディオン
  const faqItems = document.querySelectorAll(".faq-item")
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question")
    if (question) {
      question.addEventListener("click", () => toggleFaq(item))
    }
  })

  // スムーススクロール
  const anchorLinks = document.querySelectorAll('a[href^="#"]')
  anchorLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const targetId = link.getAttribute("href").substring(1)
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // CTAボタン
  const ctaButtons = document.querySelectorAll(".cta-button")
  ctaButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const action = button.dataset.action
      if (action === "consultation") {
        startGiftConsultation()
      } else if (action === "gift-list") {
        showGiftList()
      }
    })
  })
}

// アニメーション設定
function setupAnimations() {
  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in")
      }
    })
  }, observerOptions)

  // アニメーション対象要素を監視
  const animateElements = document.querySelectorAll(".animate-on-scroll")
  animateElements.forEach((el) => observer.observe(el))
}

// FAQ トグル
function toggleFaq(faqItem) {
  const isActive = faqItem.classList.contains("active")

  // 他のFAQを閉じる
  document.querySelectorAll(".faq-item").forEach((item) => {
    item.classList.remove("active")
  })

  // クリックされたFAQの状態を切り替え
  if (!isActive) {
    faqItem.classList.add("active")
  }
}

// ギフト相談開始
function startGiftConsultation() {
  window.location.href = "index.html#consultation"
}

// ナビゲーション関数
function goHome() {
  window.location.href = "index.html"
}

function showGiftList() {
  window.location.href = "gift-list.html"
}

function showServiceInfo() {
  // 既にサービス紹介ページにいる場合は何もしない
  return
}

function showAdminLogin() {
  window.location.href = "admin.html"
}

// 統計カウンターアニメーション
function animateCounter(element, target, duration = 2000) {
  const start = 0
  const increment = target / (duration / 16)
  let current = start

  const timer = setInterval(() => {
    current += increment
    if (current >= target) {
      current = target
      clearInterval(timer)
    }
    element.textContent = Math.floor(current).toLocaleString()
  }, 16)
}

// 統計セクションが表示されたときにカウンターを開始
function startCounterAnimations() {
  const counters = document.querySelectorAll(".stat-number")
  counters.forEach((counter) => {
    const target = Number.parseInt(counter.dataset.target)
    if (target) {
      animateCounter(counter, target)
    }
  })
}

// スクロール位置に応じた処理
function handleScroll() {
  const scrollTop = window.pageYOffset
  const windowHeight = window.innerHeight

  // ヘッダーの背景透明度調整
  const header = document.querySelector(".header")
  if (header) {
    const opacity = Math.min(scrollTop / 100, 0.95)
    header.style.backgroundColor = `rgba(26, 188, 156, ${opacity})`
  }

  // 統計セクションのカウンター開始
  const statsSection = document.querySelector(".stats-section")
  if (statsSection && !statsSection.classList.contains("animated")) {
    const rect = statsSection.getBoundingClientRect()
    if (rect.top < windowHeight * 0.8) {
      statsSection.classList.add("animated")
      startCounterAnimations()
    }
  }
}

// スクロールイベントリスナー
window.addEventListener("scroll", handleScroll)

// ページ読み込み完了時に初期化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initServiceInfoPage)
} else {
  initServiceInfoPage()
}

console.log("Service info script loaded")
