// ギフト一覧ページのJavaScript

// ギフトデータ（実際の実装ではサーバーから取得）
const giftListData = [
  {
    id: "basic-checkup",
    title: "基本健康診断パック",
    description: "血液検査、血圧測定、BMI測定など基本的な健康チェックができるパッケージです。",
    price: 8800,
    originalPrice: null,
    category: "checkup",
    features: ["血液検査（基本項目）", "血圧・BMI測定", "健康相談（30分）", "結果レポート"],
    partner: "健康クリニック東京",
    rating: 4.2,
    reviewCount: 156,
    popular: false,
    new: false,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "comprehensive-checkup",
    title: "総合健康診断パック",
    description: "詳細な血液検査から画像診断まで、総合的な健康状態をチェックできます。",
    price: 15400,
    originalPrice: null,
    category: "checkup",
    features: ["詳細血液検査", "胸部X線検査", "心電図検査", "医師による結果説明", "健康アドバイス"],
    partner: "健康クリニック東京",
    rating: 4.7,
    reviewCount: 234,
    popular: true,
    new: false,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "fitness-program",
    title: "パーソナルフィットネス体験",
    description: "専属トレーナーによる個別フィットネスプログラムの体験コースです。",
    price: 12100,
    originalPrice: 15000,
    category: "fitness",
    features: ["パーソナルトレーニング（3回）", "体組成測定", "運動プログラム作成", "栄養指導"],
    partner: "フィットネスジムB",
    rating: 4.5,
    reviewCount: 189,
    popular: false,
    new: true,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "wellness-consultation",
    title: "ウェルネス相談セッション",
    description: "専門カウンセラーによる健康・生活習慣の個別相談セッションです。",
    price: 6600,
    originalPrice: null,
    category: "wellness",
    features: ["個別相談（60分）", "生活習慣アドバイス", "フォローアップメール", "健康プラン作成"],
    partner: "ウェルネスセンターC",
    rating: 4.3,
    reviewCount: 98,
    popular: true,
    new: false,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "premium-dock",
    title: "プレミアム人間ドック",
    description: "最新の医療機器を使用した包括的な健康診断プログラムです。",
    price: 25300,
    originalPrice: null,
    category: "checkup",
    features: ["全身MRI検査", "詳細血液検査", "内視鏡検査", "専門医による診察", "健康管理プラン"],
    partner: "プレミアム医療センター",
    rating: 4.8,
    reviewCount: 67,
    popular: true,
    new: false,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "holistic-wellness",
    title: "ホリスティック・ウェルネス体験",
    description: "心と体の両面からアプローチする総合的なウェルネスプログラムです。",
    price: 22000,
    originalPrice: null,
    category: "wellness",
    features: ["ヨガ・瞑想セッション", "栄養カウンセリング", "アロマセラピー", "ストレス測定", "ライフスタイル提案"],
    partner: "ホリスティックセンター",
    rating: 4.6,
    reviewCount: 123,
    popular: false,
    new: true,
    image: "/placeholder.svg?height=200&width=300",
  },
]

// フィルター状態
const currentFilters = {
  category: "all",
  priceRange: "all",
  sortBy: "popular",
}

// ページ初期化
function initGiftListPage() {
  console.log("Initializing gift list page...")

  // イベントリスナーの設定
  setupEventListeners()

  // 初期表示
  displayGifts(giftListData)
  updateFilterCounts()

  console.log("Gift list page initialized successfully")
}

// イベントリスナー設定
function setupEventListeners() {
  // カテゴリーフィルター
  const categoryButtons = document.querySelectorAll(".category-filter")
  categoryButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const category = e.target.dataset.category
      setActiveFilter("category", category, e.target)
      applyFilters()
    })
  })

  // 価格フィルター
  const priceButtons = document.querySelectorAll(".price-filter")
  priceButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const priceRange = e.target.dataset.price
      setActiveFilter("priceRange", priceRange, e.target)
      applyFilters()
    })
  })

  // ソート
  const sortSelect = document.getElementById("sort-select")
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentFilters.sortBy = e.target.value
      applyFilters()
    })
  }

  // 検索
  const searchInput = document.getElementById("search-input")
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      applySearch(e.target.value)
    })
  }
}

// アクティブフィルター設定
function setActiveFilter(filterType, value, element) {
  currentFilters[filterType] = value

  // ボタンの状態更新
  const filterGroup = element.parentElement
  filterGroup.querySelectorAll("button").forEach((btn) => {
    btn.classList.remove("active")
  })
  element.classList.add("active")
}

// フィルター適用
function applyFilters() {
  let filteredGifts = [...giftListData]

  // カテゴリーフィルター
  if (currentFilters.category !== "all") {
    filteredGifts = filteredGifts.filter((gift) => gift.category === currentFilters.category)
  }

  // 価格フィルター
  if (currentFilters.priceRange !== "all") {
    filteredGifts = filteredGifts.filter((gift) => {
      switch (currentFilters.priceRange) {
        case "low":
          return gift.price < 10000
        case "medium":
          return gift.price >= 10000 && gift.price < 20000
        case "high":
          return gift.price >= 20000
        default:
          return true
      }
    })
  }

  // ソート
  filteredGifts = sortGifts(filteredGifts, currentFilters.sortBy)

  displayGifts(filteredGifts)
  updateFilterCounts()
}

// 検索適用
function applySearch(searchTerm) {
  if (!searchTerm.trim()) {
    applyFilters()
    return
  }

  const searchResults = giftListData.filter(
    (gift) =>
      gift.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gift.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gift.partner.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  displayGifts(searchResults)
}

// ギフトソート
function sortGifts(gifts, sortBy) {
  switch (sortBy) {
    case "popular":
      return gifts.sort((a, b) => {
        if (a.popular && !b.popular) return -1
        if (!a.popular && b.popular) return 1
        return b.rating - a.rating
      })
    case "price-low":
      return gifts.sort((a, b) => a.price - b.price)
    case "price-high":
      return gifts.sort((a, b) => b.price - a.price)
    case "rating":
      return gifts.sort((a, b) => b.rating - a.rating)
    case "new":
      return gifts.sort((a, b) => {
        if (a.new && !b.new) return -1
        if (!a.new && b.new) return 1
        return 0
      })
    default:
      return gifts
  }
}

// ギフト表示
function displayGifts(gifts) {
  const giftGrid = document.getElementById("gift-grid")
  if (!giftGrid) return

  if (gifts.length === 0) {
    giftGrid.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>該当するギフトが見つかりませんでした</h3>
        <p>検索条件を変更してお試しください</p>
      </div>
    `
    return
  }

  const html = gifts
    .map(
      (gift) => `
    <div class="gift-card" data-gift-id="${gift.id}">
      ${gift.popular ? '<div class="badge popular-badge">人気</div>' : ""}
      ${gift.new ? '<div class="badge new-badge">新着</div>' : ""}
      
      <div class="gift-image">
        <img src="${gift.image}" alt="${gift.title}" loading="lazy">
      </div>
      
      <div class="gift-content">
        <div class="gift-header">
          <h3 class="gift-title">${gift.title}</h3>
          <div class="gift-rating">
            <div class="stars">
              ${generateStars(gift.rating)}
            </div>
            <span class="rating-text">${gift.rating} (${gift.reviewCount})</span>
          </div>
        </div>
        
        <p class="gift-description">${gift.description}</p>
        
        <div class="gift-features">
          <h4>含まれるサービス</h4>
          <ul>
            ${gift.features
              .slice(0, 3)
              .map((feature) => `<li>${feature}</li>`)
              .join("")}
            ${gift.features.length > 3 ? `<li class="more-features">他${gift.features.length - 3}項目</li>` : ""}
          </ul>
        </div>
        
        <div class="gift-partner">
          <span class="partner-label">提携施設:</span>
          <span class="partner-name">${gift.partner}</span>
        </div>
        
        <div class="gift-footer">
          <div class="gift-price">
            ${
              gift.originalPrice
                ? `
              <span class="original-price">¥${gift.originalPrice.toLocaleString()}</span>
              <span class="current-price">¥${gift.price.toLocaleString()}</span>
              <span class="discount">
                ${Math.round(((gift.originalPrice - gift.price) / gift.originalPrice) * 100)}% OFF
              </span>
            `
                : `<span class="current-price">¥${gift.price.toLocaleString()}</span>`
            }
          </div>
          
          <button class="select-gift-button" onclick="selectGiftFromList('${gift.id}')">
            このギフトを選ぶ
          </button>
        </div>
      </div>
    </div>
  `,
    )
    .join("")

  giftGrid.innerHTML = html
}

// 星評価生成
function generateStars(rating) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return "★".repeat(fullStars) + (hasHalfStar ? "☆" : "") + "☆".repeat(emptyStars)
}

// フィルター件数更新
function updateFilterCounts() {
  const resultCount = document.getElementById("result-count")
  if (resultCount) {
    const visibleGifts = document.querySelectorAll(".gift-card").length
    resultCount.textContent = `${visibleGifts}件のギフト`
  }
}

// ギフト選択（一覧から）
function selectGiftFromList(giftId) {
  try {
    console.log("Selecting gift from list:", giftId)

    const selectedGift = giftListData.find((gift) => gift.id === giftId)
    if (!selectedGift) {
      console.error("Gift not found:", giftId)
      return
    }

    console.log("Selected gift:", selectedGift)

    // ギフトデータを適切な形式に変換
    const giftForPurchase = {
      id: selectedGift.id,
      title: selectedGift.title,
      description: selectedGift.description,
      price: `${selectedGift.price.toLocaleString()}円`,
      features: selectedGift.features,
      popular: selectedGift.popular,
    }

    console.log("Gift for purchase:", giftForPurchase)

    // ローカルストレージに保存
    localStorage.setItem("selectedGift", JSON.stringify(giftForPurchase))

    console.log("Gift saved to localStorage")

    // メインページに遷移
    window.location.href = "index.html"
  } catch (error) {
    console.error("Error in selectGiftFromList:", error)
    alert("エラーが発生しました。もう一度お試しください。")
  }
}

// ギフト詳細表示
function showGiftDetails(giftId) {
  const gift = giftListData.find((g) => g.id === giftId)
  if (!gift) return

  // モーダルまたは詳細ページを表示（実装予定）
  alert(
    `ギフト詳細:\n\n${gift.title}\n\n${gift.description}\n\n価格: ¥${gift.price.toLocaleString()}\n提携施設: ${gift.partner}`,
  )
}

// ナビゲーション関数
function goHome() {
  window.location.href = "index.html"
}

function showServiceInfo() {
  window.location.href = "service-info.html"
}

function showAdminLogin() {
  window.location.href = "admin.html"
}

function showGiftList() {
  // 既にギフト一覧ページにいる場合は何もしない
  return
}

// ページ読み込み完了時に初期化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGiftListPage)
} else {
  initGiftListPage()
}

console.log("Gift list script loaded")
