// 管理者画面のJavaScript

// 管理者認証状態
let isAdminAuthenticated = false

// サンプルギフトデータ（実際の実装ではサーバーから取得）
const adminGiftData = [
  {
    id: "gift_abc123456",
    name: "総合健康診断パック",
    recipientName: "山田 太郎",
    senderName: "田中 花子",
    price: 15400,
    status: "active",
    createdAt: "2024-01-15",
    validUntil: "2024-12-31",
    usedAt: null,
    qrCode: "GIFT_ABC123456",
  },
  {
    id: "gift_def789012",
    name: "パーソナルフィットネス体験",
    recipientName: "鈴木 恵子",
    senderName: "佐藤 美咲",
    price: 12100,
    status: "used",
    createdAt: "2024-01-10",
    validUntil: "2024-10-31",
    usedAt: "2024-01-25",
    qrCode: "GIFT_DEF789012",
  },
  {
    id: "gift_ghi345678",
    name: "ウェルネス相談セッション",
    recipientName: "佐々木 健",
    senderName: "高橋 愛",
    price: 6600,
    status: "expired",
    createdAt: "2023-12-01",
    validUntil: "2024-01-01",
    usedAt: null,
    qrCode: "GIFT_GHI345678",
  },
  {
    id: "gift_m4n59rrb8",
    name: "ウェルネス相談セッション",
    recipientName: "佐々木 健",
    senderName: "高橋 愛",
    price: 6600,
    status: "active",
    createdAt: "2024-01-20",
    validUntil: "2024-11-30",
    usedAt: null,
    qrCode: "GIFT_M4N59RRB8",
  },
]

// ページ初期化
function initAdminPage() {
  console.log("Initializing admin page...")

  // ログイン状態をチェック
  checkAuthStatus()

  // イベントリスナーの設定
  setupEventListeners()

  console.log("Admin page initialized successfully")
}

// 認証状態チェック
function checkAuthStatus() {
  // セッションストレージから認証状態を確認
  const authStatus = sessionStorage.getItem("adminAuth")
  if (authStatus === "true") {
    isAdminAuthenticated = true
    showDashboard()
  } else {
    showLoginForm()
  }
}

// イベントリスナー設定
function setupEventListeners() {
  // ログインフォーム
  const loginForm = document.getElementById("admin-login-form")
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin)
  }

  // QRコードスキャナー
  const qrScanButton = document.getElementById("qr-scan-button")
  if (qrScanButton) {
    qrScanButton.addEventListener("click", startQRScan)
  }

  // ログアウトボタン
  const logoutButton = document.getElementById("logout-button")
  if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout)
  }

  // 検索機能
  const searchInput = document.getElementById("gift-search")
  if (searchInput) {
    searchInput.addEventListener("input", handleSearch)
  }

  // フィルター機能
  const statusFilter = document.getElementById("status-filter")
  if (statusFilter) {
    statusFilter.addEventListener("change", handleFilter)
  }
}

// ログイン処理
function handleLogin(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const username = formData.get("username")
  const password = formData.get("password")

  // 簡単な認証（実際の実装ではサーバー認証）
  if (username === "admin" && password === "gift2024") {
    isAdminAuthenticated = true
    sessionStorage.setItem("adminAuth", "true")
    showDashboard()
  } else {
    showError("ユーザー名またはパスワードが正しくありません")
  }
}

// ログアウト処理
function handleLogout() {
  isAdminAuthenticated = false
  sessionStorage.removeItem("adminAuth")
  showLoginForm()
}

// ログインフォーム表示
function showLoginForm() {
  const loginScreen = document.getElementById("login-screen")
  const dashboardScreen = document.getElementById("dashboard-screen")

  if (loginScreen) loginScreen.style.display = "block"
  if (dashboardScreen) dashboardScreen.style.display = "none"
}

// ダッシュボード表示
function showDashboard() {
  const loginScreen = document.getElementById("login-screen")
  const dashboardScreen = document.getElementById("dashboard-screen")

  if (loginScreen) loginScreen.style.display = "none"
  if (dashboardScreen) dashboardScreen.style.display = "block"

  // ダッシュボードデータを読み込み
  loadDashboardData()
}

// ダッシュボードデータ読み込み
function loadDashboardData() {
  // 統計情報の表示
  updateStatistics()

  // ギフト一覧の表示
  displayGiftList(adminGiftData)
}

// 統計情報更新
function updateStatistics() {
  const totalGifts = adminGiftData.length
  const activeGifts = adminGiftData.filter((gift) => gift.status === "active").length
  const usedGifts = adminGiftData.filter((gift) => gift.status === "used").length
  const expiredGifts = adminGiftData.filter((gift) => gift.status === "expired").length

  const totalRevenue = adminGiftData.filter((gift) => gift.status === "used").reduce((sum, gift) => sum + gift.price, 0)

  // 統計表示を更新
  updateStatElement("total-gifts", totalGifts)
  updateStatElement("active-gifts", activeGifts)
  updateStatElement("used-gifts", usedGifts)
  updateStatElement("expired-gifts", expiredGifts)
  updateStatElement("total-revenue", `¥${totalRevenue.toLocaleString()}`)
}

// 統計要素更新
function updateStatElement(id, value) {
  const element = document.getElementById(id)
  if (element) {
    element.textContent = value
  }
}

// ギフト一覧表示
function displayGiftList(gifts) {
  const giftListContainer = document.getElementById("gift-list-container")
  if (!giftListContainer) return

  if (gifts.length === 0) {
    giftListContainer.innerHTML = '<p class="no-data">ギフトデータがありません</p>'
    return
  }

  const html = gifts
    .map(
      (gift) => `
    <div class="gift-item ${gift.status}" data-gift-id="${gift.id}">
      <div class="gift-item-header">
        <h3>${gift.name}</h3>
        <span class="status-badge ${gift.status}">${getStatusText(gift.status)}</span>
      </div>
      <div class="gift-item-details">
        <div class="detail-row">
          <span class="label">受取人:</span>
          <span class="value">${gift.recipientName}</span>
        </div>
        <div class="detail-row">
          <span class="label">送り主:</span>
          <span class="value">${gift.senderName}</span>
        </div>
        <div class="detail-row">
          <span class="label">金額:</span>
          <span class="value">¥${gift.price.toLocaleString()}</span>
        </div>
        <div class="detail-row">
          <span class="label">作成日:</span>
          <span class="value">${gift.createdAt}</span>
        </div>
        <div class="detail-row">
          <span class="label">有効期限:</span>
          <span class="value">${gift.validUntil}</span>
        </div>
        ${
          gift.usedAt
            ? `
        <div class="detail-row">
          <span class="label">利用日:</span>
          <span class="value">${gift.usedAt}</span>
        </div>
        `
            : ""
        }
        <div class="detail-row">
          <span class="label">QRコード:</span>
          <span class="value qr-code">${gift.qrCode}</span>
        </div>
      </div>
      <div class="gift-item-actions">
        ${
          gift.status === "active"
            ? `
          <button class="action-button use" onclick="markAsUsed('${gift.id}')">利用済みにする</button>
        `
            : ""
        }
        <button class="action-button details" onclick="showGiftDetails('${gift.id}')">詳細</button>
      </div>
    </div>
  `,
    )
    .join("")

  giftListContainer.innerHTML = html
}

// ステータステキスト取得
function getStatusText(status) {
  const statusTexts = {
    active: "有効",
    used: "利用済み",
    expired: "期限切れ",
  }
  return statusTexts[status] || status
}

// ギフトを利用済みにする
function markAsUsed(giftId) {
  const gift = adminGiftData.find((g) => g.id === giftId)
  if (gift && gift.status === "active") {
    gift.status = "used"
    gift.usedAt = new Date().toISOString().split("T")[0]

    // 表示を更新
    updateStatistics()
    displayGiftList(adminGiftData)

    showSuccess(`ギフト ${gift.name} を利用済みにしました`)
  }
}

// ギフト詳細表示
function showGiftDetails(giftId) {
  const gift = adminGiftData.find((g) => g.id === giftId)
  if (gift) {
    alert(
      `ギフト詳細:\n\nID: ${gift.id}\n名前: ${gift.name}\n受取人: ${gift.recipientName}\n送り主: ${gift.senderName}\n金額: ¥${gift.price.toLocaleString()}\nステータス: ${getStatusText(gift.status)}\n作成日: ${gift.createdAt}\n有効期限: ${gift.validUntil}\n${gift.usedAt ? `利用日: ${gift.usedAt}\n` : ""}QRコード: ${gift.qrCode}`,
    )
  }
}

// QRコードスキャン開始
function startQRScan() {
  // 実際の実装ではカメラAPIを使用
  const qrCode = prompt("QRコードまたはギフトコードを入力してください:")
  if (qrCode) {
    processQRCode(qrCode)
  }
}

// QRコード処理
function processQRCode(qrCode) {
  const gift = adminGiftData.find((g) => g.qrCode === qrCode.toUpperCase())

  if (!gift) {
    showError("無効なQRコードです")
    return
  }

  if (gift.status === "used") {
    showError("このギフトは既に利用済みです")
    return
  }

  if (gift.status === "expired") {
    showError("このギフトは期限切れです")
    return
  }

  // ギフト利用確認
  const confirmed = confirm(
    `以下のギフトを利用済みにしますか？\n\n${gift.name}\n受取人: ${gift.recipientName}\n金額: ¥${gift.price.toLocaleString()}`,
  )

  if (confirmed) {
    markAsUsed(gift.id)
  }
}

// 検索処理
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase()
  const filteredGifts = adminGiftData.filter(
    (gift) =>
      gift.name.toLowerCase().includes(searchTerm) ||
      gift.recipientName.toLowerCase().includes(searchTerm) ||
      gift.senderName.toLowerCase().includes(searchTerm) ||
      gift.qrCode.toLowerCase().includes(searchTerm),
  )
  displayGiftList(filteredGifts)
}

// フィルター処理
function handleFilter(e) {
  const status = e.target.value
  const filteredGifts = status ? adminGiftData.filter((gift) => gift.status === status) : adminGiftData
  displayGiftList(filteredGifts)
}

// エラー表示
function showError(message) {
  alert(`エラー: ${message}`)
}

// 成功メッセージ表示
function showSuccess(message) {
  alert(`成功: ${message}`)
}

// ナビゲーション関数
function goHome() {
  window.location.href = "index.html"
}

function showGiftList() {
  window.location.href = "gift-list.html"
}

function showServiceInfo() {
  window.location.href = "service-info.html"
}

function showAdminLogin() {
  // 既に管理者ページにいる場合は何もしない
  return
}

// ページ読み込み完了時に初期化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAdminPage)
} else {
  initAdminPage()
}

console.log("Admin script loaded")
