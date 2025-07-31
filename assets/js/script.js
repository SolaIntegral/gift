// アプリケーションの状態管理
window.appState = window.appState || {
  currentScreen: "home",
  currentQuestion: 0,
  answers: {},
  selectedGift: null,
  recipientInfo: {},
  giftId: null,
  selectedPaymentMethod: null,
}

// 質問データ
const questions = [
  {
    id: "age",
    title: "贈る相手はどんな方ですか？",
    options: [
      { value: "20s", label: "20代の方", icon: "👩" },
      { value: "30s", label: "30代の方", icon: "👨" },
      { value: "40s", label: "40代の方", icon: "👩‍💼" },
      { value: "50s", label: "50代の方", icon: "👨‍💼" },
      { value: "60plus", label: "60代以上の方", icon: "👴" },
    ],
  },
  {
    id: "budget",
    title: "ご予算はどのくらいをお考えですか？",
    options: [
      { value: "low", label: "5,000円〜10,000円", icon: "💰" },
      { value: "medium", label: "10,000円〜20,000円", icon: "💎" },
      { value: "high", label: "20,000円〜30,000円", icon: "👑" },
      { value: "premium", label: "30,000円以上", icon: "✨" },
    ],
  },
  {
    id: "concern",
    title: "健康について、特に気になることはありますか？（任意）",
    options: [
      { value: "general", label: "全般的な健康チェック", icon: "🏥" },
      { value: "lifestyle", label: "生活習慣病の予防", icon: "🍎" },
      { value: "fitness", label: "運動・フィットネス", icon: "💪" },
      { value: "mental", label: "ストレス・メンタルヘルス", icon: "🧘" },
      { value: "none", label: "特になし", icon: "😊" },
    ],
  },
]

// ギフトデータ
const giftOptions = {
  low: [
    {
      id: "basic-checkup",
      title: "基本健康診断パック",
      description: "血液検査、血圧測定、BMI測定など基本的な健康チェックができるパッケージです。",
      price: "8,800円",
      features: ["血液検査（基本項目）", "血圧・BMI測定", "健康相談（30分）", "結果レポート"],
      popular: false,
    },
    {
      id: "wellness-consultation",
      title: "ウェルネス相談セッション",
      description: "専門カウンセラーによる健康・生活習慣の個別相談セッションです。",
      price: "6,600円",
      features: ["個別相談（60分）", "生活習慣アドバイス", "フォローアップメール", "健康プラン作成"],
      popular: true,
    },
  ],
  medium: [
    {
      id: "comprehensive-checkup",
      title: "総合健康診断パック",
      description: "詳細な血液検査から画像診断まで、総合的な健康状態をチェックできます。",
      price: "15,400円",
      features: ["詳細血液検査", "胸部X線検査", "心電図検査", "医師による結果説明", "健康アドバイス"],
      popular: true,
    },
    {
      id: "fitness-program",
      title: "パーソナルフィットネス体験",
      description: "専属トレーナーによる個別フィットネスプログラムの体験コースです。",
      price: "12,100円",
      features: ["パーソナルトレーニング（3回）", "体組成測定", "運動プログラム作成", "栄養指導"],
      popular: false,
    },
  ],
  high: [
    {
      id: "premium-dock",
      title: "プレミアム人間ドック",
      description: "最新の医療機器を使用した包括的な健康診断プログラムです。",
      price: "25,300円",
      features: ["全身MRI検査", "詳細血液検査", "内視鏡検査", "専門医による診察", "健康管理プラン"],
      popular: true,
    },
    {
      id: "holistic-wellness",
      title: "ホリスティック・ウェルネス体験",
      description: "心と体の両面からアプローチする総合的なウェルネスプログラムです。",
      price: "22,000円",
      features: ["ヨガ・瞑想セッション", "栄養カウンセリング", "アロマセラピー", "ストレス測定", "ライフスタイル提案"],
      popular: false,
    },
  ],
  premium: [
    {
      id: "executive-checkup",
      title: "エグゼクティブ健康診断",
      description: "VIP待遇で受けられる最高級の健康診断プログラムです。",
      price: "38,500円",
      features: ["全身精密検査", "VIP個室利用", "専属医師による診察", "即日結果説明", "1年間健康サポート"],
      popular: true,
    },
    {
      id: "luxury-spa-wellness",
      title: "ラグジュアリー・スパ＆ウェルネス",
      description: "高級スパでの癒しと健康チェックを組み合わせた贅沢なプログラムです。",
      price: "33,000円",
      features: ["高級スパ利用", "健康診断", "エステティック", "栄養指導", "リラクゼーション"],
      popular: false,
    },
  ],
}

// 安全な画面遷移関数
function showScreen(screenId) {
  try {
    const screens = document.querySelectorAll(".screen")
    screens.forEach((screen) => {
      screen.classList.remove("active")
    })

    const targetScreen = document.getElementById(screenId)
    if (targetScreen) {
      targetScreen.classList.add("active")
      window.appState.currentScreen = screenId
    } else {
      console.warn(`Screen with id "${screenId}" not found`)
    }
  } catch (error) {
    console.error("Error in showScreen:", error)
  }
}

function goHome() {
  try {
    if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {
      showScreen("home-screen")
    } else {
      window.location.href = "index.html"
    }
    resetApp()
  } catch (error) {
    console.error("Error in goHome:", error)
  }
}

function resetApp() {
  try {
    window.appState.currentQuestion = 0
    window.appState.answers = {}
    window.appState.selectedGift = null
    window.appState.recipientInfo = {}
    window.appState.giftId = null
    window.appState.selectedPaymentMethod = null
  } catch (error) {
    console.error("Error in resetApp:", error)
  }
}

// ギフト相談開始
function startGiftConsultation() {
  try {
    if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {
      showScreen("question-screen")
      window.appState.currentQuestion = 0
      showQuestion()
    } else {
      window.location.href = "index.html#consultation"
    }
  } catch (error) {
    console.error("Error in startGiftConsultation:", error)
  }
}

// 質問表示
function showQuestion() {
  try {
    const question = questions[window.appState.currentQuestion]
    const progressPercent = ((window.appState.currentQuestion + 1) / questions.length) * 100

    const progressFill = document.getElementById("progress-fill")
    const currentQuestionSpan = document.getElementById("current-question")

    if (progressFill) progressFill.style.width = progressPercent + "%"
    if (currentQuestionSpan) currentQuestionSpan.textContent = window.appState.currentQuestion + 1

    const questionContent = document.getElementById("question-content")
    if (questionContent) {
      questionContent.innerHTML = `
        <h3 class="question-title">${question.title}</h3>
        <div class="question-options">
          ${question.options
            .map(
              (option) => `
            <button class="option-button" onclick="selectOption('${question.id}', '${option.value}')">
              <span style="font-size: 1.5rem; margin-right: 10px;">${option.icon}</span>
              ${option.label}
            </button>
          `,
            )
            .join("")}
        </div>
      `
    }

    updateNextButton()
  } catch (error) {
    console.error("Error in showQuestion:", error)
  }
}

// 選択肢選択
function selectOption(questionId, value) {
  try {
    window.appState.answers[questionId] = value

    // 選択状態の更新
    document.querySelectorAll(".option-button").forEach((btn) => {
      btn.classList.remove("selected")
    })

    if (event && event.target) {
      event.target.classList.add("selected")
    }

    updateNextButton()
  } catch (error) {
    console.error("Error in selectOption:", error)
  }
}

// 次へボタンの状態更新
function updateNextButton() {
  try {
    const currentQuestion = questions[window.appState.currentQuestion]
    const hasAnswer = window.appState.answers[currentQuestion.id]
    const nextButton = document.getElementById("next-button")

    if (nextButton) {
      nextButton.disabled = !hasAnswer
    }
  } catch (error) {
    console.error("Error in updateNextButton:", error)
  }
}

// 次の質問へ
function nextQuestion() {
  try {
    if (window.appState.currentQuestion < questions.length - 1) {
      window.appState.currentQuestion++
      showQuestion()
    } else {
      showGiftProposals()
    }
  } catch (error) {
    console.error("Error in nextQuestion:", error)
  }
}

// ギフト提案表示
function showGiftProposals() {
  try {
    showScreen("proposal-screen")

    const budget = window.appState.answers.budget
    const gifts = giftOptions[budget] || giftOptions["medium"]

    const giftOptionsContainer = document.getElementById("gift-options")
    if (giftOptionsContainer) {
      giftOptionsContainer.innerHTML = gifts
        .map(
          (gift) => `
          <div class="gift-option ${gift.popular ? "popular" : ""}" onclick="selectGiftOption('${gift.id}')">
            <h3 class="gift-title">${gift.title}</h3>
            <p class="gift-description">${gift.description}</p>
            <div class="gift-price">${gift.price}</div>
            <ul class="gift-features">
              ${gift.features.map((feature) => `<li>${feature}</li>`).join("")}
            </ul>
          </div>
        `,
        )
        .join("")
    }

    updateSelectButton()
  } catch (error) {
    console.error("Error in showGiftProposals:", error)
  }
}

// ギフト選択
function selectGiftOption(giftId) {
  try {
    const budget = window.appState.answers.budget
    const gifts = giftOptions[budget] || giftOptions["medium"]
    window.appState.selectedGift = gifts.find((gift) => gift.id === giftId)

    // 選択状態の更新
    document.querySelectorAll(".gift-option").forEach((option) => {
      option.classList.remove("selected")
    })

    if (event && event.target) {
      event.target.classList.add("selected")
    }

    updateSelectButton()
  } catch (error) {
    console.error("Error in selectGiftOption:", error)
  }
}

// ギフト選択ボタンの状態更新
function updateSelectButton() {
  try {
    const selectButton = document.getElementById("select-gift-button")
    if (selectButton) {
      selectButton.disabled = !window.appState.selectedGift
    }
  } catch (error) {
    console.error("Error in updateSelectButton:", error)
  }
}

// ギフト選択完了
function selectGift() {
  try {
    if (window.appState.selectedGift) {
      showScreen("recipient-screen")
    }
  } catch (error) {
    console.error("Error in selectGift:", error)
  }
}

// メッセージテンプレート設定
function setMessage(message) {
  try {
    const messageInput = document.getElementById("gift-message")
    if (messageInput) {
      messageInput.value = message
    }
  } catch (error) {
    console.error("Error in setMessage:", error)
  }
}

// ナビゲーション関数
function showGiftList() {
  try {
    if (window.location.pathname.includes("gift-list.html")) {
      return
    }
    window.location.href = "gift-list.html"
  } catch (error) {
    console.error("Error in showGiftList:", error)
  }
}

function showServiceInfo() {
  try {
    if (window.location.pathname.includes("service-info.html")) {
      return
    }
    window.location.href = "service-info.html"
  } catch (error) {
    console.error("Error in showServiceInfo:", error)
  }
}

function showAdminLogin() {
  try {
    if (window.location.pathname.includes("admin.html")) {
      return
    }
    window.location.href = "admin.html"
  } catch (error) {
    console.error("Error in showAdminLogin:", error)
  }
}

// 安全なクリップボード操作
function copyGiftUrl() {
  try {
    const giftUrlInput = document.getElementById("gift-url")
    if (!giftUrlInput) return

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(giftUrlInput.value)
        .then(() => showCopySuccess())
        .catch(() => fallbackCopyTextToClipboard(giftUrlInput.value))
    } else {
      fallbackCopyTextToClipboard(giftUrlInput.value)
    }
  } catch (error) {
    console.error("Error in copyGiftUrl:", error)
  }
}

function fallbackCopyTextToClipboard(text) {
  try {
    const textArea = document.createElement("textarea")
    textArea.value = text
    textArea.style.position = "fixed"
    textArea.style.left = "-999999px"
    textArea.style.top = "-999999px"
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    let successful = false
    try {
      if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        successful = document.execCommand("copy")
      }
      if (successful) {
        showCopySuccess()
      }
    } catch (err) {
      console.error("コピーに失敗しました:", err)
    }

    document.body.removeChild(textArea)
  } catch (error) {
    console.error("Error in fallbackCopyTextToClipboard:", error)
  }
}

function showCopySuccess() {
  try {
    const copyButton = document.querySelector(".copy-button")
    if (copyButton) {
      const originalText = copyButton.textContent
      copyButton.textContent = "コピー完了！"
      copyButton.style.background = "#4caf50"

      setTimeout(() => {
        copyButton.textContent = originalText
        copyButton.style.background = ""
      }, 2000)
    }
  } catch (error) {
    console.error("Error in showCopySuccess:", error)
  }
}

// SNS共有
function shareToLine() {
  try {
    const giftUrl = document.getElementById("gift-url").value
    const message = `健康のギフトが届きました！ ${giftUrl}`
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(message)}`
    window.open(lineUrl, "_blank")
  } catch (error) {
    console.error("Error in shareToLine:", error)
  }
}

function shareToEmail() {
  try {
    const giftUrl = document.getElementById("gift-url").value
    const subject = "健康のギフトが届きました"
    const body = `${window.appState.recipientInfo.recipientName}様\n\n${window.appState.recipientInfo.senderName}様から健康のギフトが届きました。\n\n${giftUrl}\n\nぜひご確認ください。`
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoUrl
  } catch (error) {
    console.error("Error in shareToEmail:", error)
  }
}

// 初期化処理
document.addEventListener("DOMContentLoaded", () => {
  try {
    console.log("DOM loaded, initializing app...")

    // URLパラメータからギフトIDを取得
    const urlParams = new URLSearchParams(window.location.search)
    const giftId = urlParams.get("gift")

    console.log("Gift ID from URL:", giftId)

    // URLハッシュをチェック
    const hash = window.location.hash.substring(1)

    // ローカルストレージからギフト選択をチェック
    const selectedGiftFromList = getSelectedGiftFromStorage()

    if (giftId) {
      // ギフト表示画面を表示
      console.log("Displaying gift:", giftId)
      displayGift(giftId)
    } else if (selectedGiftFromList) {
      // ギフト一覧から選択されたギフトを処理
      window.appState.selectedGift = selectedGiftFromList
      showScreen("recipient-screen")
      clearSelectedGiftFromStorage()
    } else if (hash === "recipient" && window.appState && window.appState.selectedGift) {
      // ギフト一覧から戻ってきた場合
      showScreen("recipient-screen")
    } else if (hash === "consultation") {
      // 相談開始
      showScreen("question-screen")
      window.appState.currentQuestion = 0
      showQuestion()
    } else {
      // ホーム画面を表示
      const homeScreen = document.getElementById("home-screen")
      if (homeScreen) {
        showScreen("home-screen")
      }
    }

    // フォームイベントリスナーの設定
    const recipientForm = document.getElementById("recipient-form")
    if (recipientForm) {
      recipientForm.addEventListener("submit", (e) => {
        e.preventDefault()

        try {
          const formData = new FormData(recipientForm)
          window.appState.recipientInfo = {
            recipientName: formData.get("recipientName"),
            senderName: formData.get("senderName"),
            giftMessage: formData.get("giftMessage"),
          }

          showPaymentScreen()
        } catch (error) {
          console.error("Error in form submission:", error)
        }
      })
    }
  } catch (error) {
    console.error("Error during initialization:", error)
  }
})

// ローカルストレージからギフト選択を取得する関数を追加
function getSelectedGiftFromStorage() {
  try {
    const storedGift = localStorage.getItem("selectedGift")
    if (storedGift) {
      return JSON.parse(storedGift)
    }
    return null
  } catch (error) {
    console.warn("Error reading from localStorage:", error)
    return null
  }
}

// ローカルストレージからギフト選択をクリアする関数を追加
function clearSelectedGiftFromStorage() {
  try {
    localStorage.removeItem("selectedGift")
  } catch (error) {
    console.warn("Error clearing localStorage:", error)
  }
}

// 決済関連の関数
function selectPaymentMethod(method) {
  try {
    window.appState.selectedPaymentMethod = method

    // 選択状態の更新
    document.querySelectorAll(".payment-method").forEach((element) => {
      element.classList.remove("selected")
    })

    if (event && event.target) {
      event.target.closest(".payment-method").classList.add("selected")
    }

    updatePaymentButton()
  } catch (error) {
    console.error("Error in selectPaymentMethod:", error)
  }
}

function updatePaymentButton() {
  try {
    const paymentButton = document.getElementById("payment-button")
    if (!paymentButton) return

    if (window.appState.selectedPaymentMethod === "paypay") {
      paymentButton.textContent = "PayPayで決済する"
      paymentButton.disabled = false
      paymentButton.className = "payment-button paypay"
    } else if (window.appState.selectedPaymentMethod === "card") {
      paymentButton.textContent = "クレジットカードで決済する"
      paymentButton.disabled = false
      paymentButton.className = "payment-button"
    } else {
      paymentButton.textContent = "決済方法を選択してください"
      paymentButton.disabled = true
      paymentButton.className = "payment-button"
    }
  } catch (error) {
    console.error("Error in updatePaymentButton:", error)
  }
}

function showPaymentScreen() {
  try {
    showScreen("payment-screen")

    const orderSummary = document.getElementById("order-summary")
    if (orderSummary && window.appState.selectedGift && window.appState.recipientInfo) {
      orderSummary.innerHTML = `
        <h3>ご注文内容</h3>
        <div class="order-item">
          <span>商品名</span>
          <span>${window.appState.selectedGift.title}</span>
        </div>
        <div class="order-item">
          <span>受取人</span>
          <span>${window.appState.recipientInfo.recipientName}様</span>
        </div>
        <div class="order-item">
          <span>合計金額</span>
          <span>${window.appState.selectedGift.price}</span>
        </div>
      `
    }

    updatePaymentButton()
  } catch (error) {
    console.error("Error in showPaymentScreen:", error)
  }
}

function processPayment() {
  try {
    if (!window.appState.selectedPaymentMethod) {
      alert("決済方法を選択してください")
      return
    }

    let processingMessage = ""
    if (window.appState.selectedPaymentMethod === "paypay") {
      processingMessage = "PayPayで決済中..."
    } else {
      processingMessage = "クレジットカードで決済中..."
    }

    // 決済処理中の表示
    const paymentButton = document.getElementById("payment-button")
    if (paymentButton) {
      paymentButton.textContent = processingMessage
      paymentButton.disabled = true
    }

    // ダミーの決済処理
    setTimeout(() => {
      window.appState.giftId = generateGiftId()
      showCompletionScreen()
    }, 2000)
  } catch (error) {
    console.error("Error in processPayment:", error)
  }
}

function generateGiftId() {
  return "gift_" + Math.random().toString(36).substr(2, 9)
}

function showCompletionScreen() {
  try {
    showScreen("completion-screen")

    const completionMessage = document.getElementById("completion-message")
    if (completionMessage && window.appState.recipientInfo) {
      completionMessage.innerHTML = `
        ${window.appState.recipientInfo.recipientName}様へ、健康のGIFTが届きました！<br>
        大切な人へ、あなたの想いが届きますように。
      `
    }

    const giftUrl = `${window.location.origin}${window.location.pathname}?gift=${window.appState.giftId}`
    const giftUrlInput = document.getElementById("gift-url")
    if (giftUrlInput) {
      giftUrlInput.value = giftUrl
    }
  } catch (error) {
    console.error("Error in showCompletionScreen:", error)
  }
}

// ギフト表示関数を修正
function displayGift(giftId) {
  try {
    console.log("Attempting to display gift:", giftId)

    // ギフトデータを取得（実際の実装ではサーバーから取得）
    const giftData = getGiftDataById(giftId)

    console.log("Gift data found:", giftData)

    if (giftData) {
      showScreen("gift-receive-screen")
      showGiftReceiveAnimation(giftData)
    } else {
      console.warn(`Gift with id "${giftId}" not found, showing default gift`)
      // ギフトが見つからない場合はデフォルトギフトを表示
      const defaultGift = createDefaultGift(giftId)
      showScreen("gift-receive-screen")
      showGiftReceiveAnimation(defaultGift)
    }
  } catch (error) {
    console.error("Error in displayGift:", error)
    // エラーが発生した場合もデフォルトギフトを表示
    const defaultGift = createDefaultGift(giftId)
    showScreen("gift-receive-screen")
    showGiftReceiveAnimation(defaultGift)
  }
}

// デフォルトギフト作成関数を追加
function createDefaultGift(giftId) {
  return {
    id: giftId,
    name: "総合健康診断パック",
    category: "checkup",
    price: 15400,
    description: "詳細な血液検査から画像診断まで、総合的な健康状態をチェックできます。",
    features: ["詳細血液検査", "胸部X線検査", "心電図検査", "医師による結果説明", "健康アドバイス"],
    partner: "健康クリニック東京",
    icon: "🏥",
    senderName: "大切な人",
    recipientName: "あなた",
    message: "いつまでも健康でいてほしいという想いを込めて、健康診断のギフトを贈ります。ぜひご利用ください。",
    validUntil: "2024年12月31日",
    status: "active",
  }
}

// ギフトデータ取得関数を拡張
function getGiftDataById(giftId) {
  console.log("Looking for gift data for ID:", giftId)

  // 実際の実装ではサーバーAPIから取得
  // ここではダミーデータを返す
  const sampleGifts = {
    gift_abc123456: {
      id: "gift_abc123456",
      name: "総合健康診断パック",
      category: "checkup",
      price: 15400,
      description: "詳細な血液検査から画像診断まで、総合的な健康状態をチェックできます。",
      features: ["詳細血液検査", "胸部X線検査", "心電図検査", "医師による結果説明", "健康アドバイス"],
      partner: "健康クリニック東京",
      icon: "🏥",
      senderName: "田中 花子",
      recipientName: "山田 太郎",
      message:
        "お父さん、いつまでも健康でいてほしいから。なかなか予約しないだろうと思って、人間ドックを贈るよ。これを機にしっかり見てきてね！",
      validUntil: "2024年12月31日",
      status: "active",
    },
    gift_def789012: {
      id: "gift_def789012",
      name: "パーソナルフィットネス体験",
      category: "fitness",
      price: 12100,
      description: "専属トレーナーによる個別フィットネスプログラムの体験コースです。",
      features: ["パーソナルトレーニング（3回）", "体組成測定", "運動プログラム作成", "栄養指導"],
      partner: "フィットネスジムB",
      icon: "💪",
      senderName: "佐藤 美咲",
      recipientName: "鈴木 恵子",
      message:
        "恵子ちゃん、出産お疲れ様！育児で忙しいと思うけど、自分の体も大切にしてほしいから、近所のフィットネスジムのチケットを贈るね。気分転換にもなるし、気軽に利用してみて！",
      validUntil: "2024年10月31日",
      status: "active",
    },
    gift_m4n59rrb8: {
      id: "gift_m4n59rrb8",
      name: "ウェルネス相談セッション",
      category: "wellness",
      price: 6600,
      description: "専門カウンセラーによる健康・生活習慣の個別相談セッションです。",
      features: ["個別相談（60分）", "生活習慣アドバイス", "フォローアップメール", "健康プラン作成"],
      partner: "ウェルネスセンターC",
      icon: "🧘",
      senderName: "高橋 愛",
      recipientName: "佐々木 健",
      message:
        "健康について一緒に考える時間を作ってほしくて、ウェルネス相談のギフトを贈ります。専門家のアドバイスを受けて、より良い生活習慣を身につけてくださいね。",
      validUntil: "2024年11月30日",
      status: "active",
    },
  }

  const foundGift = sampleGifts[giftId]
  console.log("Found gift:", foundGift)

  return foundGift || null
}

// ギフト受取アニメーション表示
function showGiftReceiveAnimation(giftData) {
  try {
    console.log("Showing gift receive animation for:", giftData)

    const openingAnimation = document.getElementById("gift-opening-receive")
    const contentDisplay = document.getElementById("gift-content-display")

    if (openingAnimation && contentDisplay) {
      // アニメーション表示
      openingAnimation.style.display = "block"
      contentDisplay.style.display = "none"

      // 3秒後にギフト内容を表示
      setTimeout(() => {
        openingAnimation.style.display = "none"
        contentDisplay.style.display = "block"
        populateGiftContent(giftData)
      }, 3000)
    } else {
      console.warn("Animation elements not found, showing content directly")
      // アニメーション要素が見つからない場合は直接コンテンツを表示
      if (contentDisplay) {
        contentDisplay.style.display = "block"
        populateGiftContent(giftData)
      }
    }
  } catch (error) {
    console.error("Error in showGiftReceiveAnimation:", error)
  }
}

// ギフト内容を画面に表示
function populateGiftContent(giftData) {
  try {
    console.log("Populating gift content:", giftData)

    // 送り主名
    const senderNameEl = document.getElementById("gift-sender-name")
    if (senderNameEl) senderNameEl.textContent = giftData.senderName

    // メッセージ
    const messageEl = document.getElementById("gift-personal-message")
    if (messageEl) messageEl.textContent = giftData.message

    // ギフト詳細
    const itemIconEl = document.getElementById("gift-item-icon")
    const itemNameEl = document.getElementById("gift-item-name")
    const itemCategoryEl = document.getElementById("gift-item-category")
    const itemPriceEl = document.getElementById("gift-item-price")
    const itemDescEl = document.getElementById("gift-item-desc")
    const partnerNameEl = document.getElementById("gift-item-partner-name")

    if (itemIconEl) itemIconEl.textContent = giftData.icon
    if (itemNameEl) itemNameEl.textContent = giftData.name
    if (itemCategoryEl) itemCategoryEl.textContent = getCategoryName(giftData.category)
    if (itemPriceEl) itemPriceEl.textContent = `¥${giftData.price.toLocaleString()}`
    if (itemDescEl) itemDescEl.textContent = giftData.description
    if (partnerNameEl) partnerNameEl.textContent = giftData.partner

    // 特徴リスト
    const featuresListEl = document.getElementById("gift-item-features-list")
    if (featuresListEl && giftData.features) {
      featuresListEl.innerHTML = giftData.features.map((feature) => `<li>${feature}</li>`).join("")
    }

    // QRコード
    const codeTextEl = document.getElementById("gift-code-text")
    if (codeTextEl) codeTextEl.textContent = giftData.id.toUpperCase()

    // 有効期限
    const validityDateEl = document.getElementById("gift-validity-date")
    if (validityDateEl) validityDateEl.textContent = `${giftData.validUntil}まで`

    console.log("Gift content populated successfully")
  } catch (error) {
    console.error("Error in populateGiftContent:", error)
  }
}

// カテゴリー名取得関数を追加
function getCategoryName(category) {
  const categoryNames = {
    checkup: "健康診断",
    fitness: "フィットネス",
    wellness: "ウェルネス",
    consultation: "相談・指導",
  }
  return categoryNames[category] || category
}

// 利用方法詳細表示
function showUsageInstructions() {
  alert(
    "利用方法の詳細:\n\n1. 提携施設に電話またはWebサイトから予約を取ってください\n2. 来店時にQRコードを提示してください\n3. スタッフがQRコードを確認後、サービスを受けられます\n\n※予約時に「GIFTを利用」とお伝えください",
  )
}

// ギフト共有機能
function shareGift() {
  try {
    const currentUrl = window.location.href

    if (navigator.share) {
      navigator.share({
        title: "GIFT - 健康のギフトが届きました",
        text: "健康のギフトを受け取りました！",
        url: currentUrl,
      })
    } else {
      // フォールバック: URLをクリップボードにコピー
      if (navigator.clipboard) {
        navigator.clipboard.writeText(currentUrl).then(() => {
          alert("ギフトURLをクリップボードにコピーしました！")
        })
      } else {
        alert(`ギフトURL: ${currentUrl}`)
      }
    }
  } catch (error) {
    console.error("Error in shareGift:", error)
  }
}

console.log("Script.js loaded successfully")
