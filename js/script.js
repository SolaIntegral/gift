// GIFT アプリ共通JavaScript

// 仮データ
const giftData = {
    gifts: [
        { id: 1, name: "人間ドックギフト", price: 50000, description: "総合的な健康診断", icon: "🏥" },
        { id: 2, name: "健康相談チケット", price: 15000, description: "専門医による健康相談", icon: "👨‍⚕️" },
        { id: 3, name: "栄養指導セッション", price: 8000, description: "管理栄養士による栄養指導", icon: "🥗" },
        { id: 4, name: "運動指導プログラム", price: 12000, description: "パーソナルトレーナーによる指導", icon: "💪" },
        { id: 5, name: "ストレスケアセッション", price: 10000, description: "メンタルヘルスケア", icon: "🧘‍♀️" },
        { id: 6, name: "睡眠改善プログラム", price: 18000, description: "睡眠専門家による指導", icon: "😴" }
    ],
    
    history: [
        { id: 1, type: "sent", giftName: "人間ドックギフト", recipient: "田中太郎", date: "2024-01-15", status: "使用済み" },
        { id: 2, type: "received", giftName: "健康相談チケット", sender: "佐藤花子", date: "2024-01-10", status: "未使用" },
        { id: 3, type: "sent", giftName: "栄養指導セッション", recipient: "山田次郎", date: "2024-01-05", status: "使用済み" },
        { id: 4, type: "received", giftName: "運動指導プログラム", sender: "鈴木美咲", date: "2024-01-01", status: "未使用" },
        { id: 5, type: "sent", giftName: "ストレスケアセッション", recipient: "高橋一郎", date: "2023-12-25", status: "使用済み" },
        { id: 6, type: "received", giftName: "睡眠改善プログラム", sender: "伊藤恵子", date: "2023-12-20", status: "未使用" },
        { id: 7, type: "sent", giftName: "人間ドックギフト", recipient: "渡辺健太", date: "2023-12-15", status: "使用済み" },
        { id: 8, type: "received", giftName: "健康相談チケット", sender: "中村雅子", date: "2023-12-10", status: "使用済み" },
        { id: 9, type: "sent", giftName: "栄養指導セッション", recipient: "小林優子", date: "2023-12-05", status: "使用済み" },
        { id: 10, type: "received", giftName: "運動指導プログラム", sender: "加藤大輔", date: "2023-12-01", status: "未使用" }
    ],
    
    userProfile: {
        name: "田中花子",
        email: "tanaka.hanako@example.com",
        phone: "090-1234-5678",
        address: "東京都渋谷区1-1-1"
    }
};

// ページ遷移関数
function navigateTo(page) {
    window.location.href = page;
}

// ローカルストレージ管理
const storage = {
    set: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    },
    get: (key) => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    },
    remove: (key) => {
        localStorage.removeItem(key);
    }
};

// 選択されたギフトを管理
let selectedGift = null;

// ギフト選択機能
function selectGift(giftId) {
    selectedGift = giftData.gifts.find(gift => gift.id === giftId);
    storage.set('selectedGift', selectedGift);
    
    // 選択状態の視覚的フィードバック
    document.querySelectorAll('.gift-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`[data-gift-id="${giftId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    console.log('選択されたギフト:', selectedGift);
}

// フォーム送信処理
function handleFormSubmit(formId, callback) {
    const form = document.getElementById(formId);
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            console.log('フォームデータ:', data);
            
            if (callback) {
                callback(data);
            }
        });
    }
}

// 決済処理シミュレーション
function processPayment() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.innerHTML = '<p>決済処理中...</p>';
    
    const mainContent = document.querySelector('.main-content');
    mainContent.appendChild(loadingDiv);
    
    // 3秒後に完了メッセージを表示
    setTimeout(() => {
        loadingDiv.innerHTML = '<div class="alert alert-success">決済が完了しました！ギフトが送信されました。</div>';
        
        // 5秒後にマイページに遷移
        setTimeout(() => {
            navigateTo('mypage.html');
        }, 5000);
    }, 3000);
}

// タブ機能
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const target = button.getAttribute('data-tab');
            
            // アクティブクラスを切り替え
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });
}

// 履歴表示機能
function displayHistory(containerId, type = 'all') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let filteredHistory = giftData.history;
    if (type !== 'all') {
        filteredHistory = giftData.history.filter(item => item.type === type);
    }
    
    const historyHTML = filteredHistory.map(item => {
        const date = new Date(item.date).toLocaleDateString('ja-JP');
        
        if (item.type === 'sent') {
            return `
                <tr>
                    <td>${date}</td>
                    <td>${item.giftName}</td>
                    <td>${item.recipient}</td>
                    <td><span class="badge ${item.status === '使用済み' ? 'badge-success' : 'badge-warning'}">${item.status}</span></td>
                </tr>
            `;
        } else {
            return `
                <tr>
                    <td>${date}</td>
                    <td>${item.giftName}</td>
                    <td>${item.sender}</td>
                    <td><span class="badge ${item.status === '使用済み' ? 'badge-success' : 'badge-warning'}">${item.status}</span></td>
                </tr>
            `;
        }
    }).join('');
    
    container.innerHTML = historyHTML;
}

// ギフト提案機能
function suggestGifts(answers) {
    const suggestions = [];
    
    // 簡単な提案ロジック（ダミー）
    if (answers.age === '20-30') {
        suggestions.push(giftData.gifts[2], giftData.gifts[4]); // 栄養指導、ストレスケア
    } else if (answers.age === '40-50') {
        suggestions.push(giftData.gifts[0], giftData.gifts[3]); // 人間ドック、運動指導
    } else {
        suggestions.push(giftData.gifts[1], giftData.gifts[5]); // 健康相談、睡眠改善
    }
    
    if (answers.healthFocus === 'prevention') {
        suggestions.push(giftData.gifts[0]); // 人間ドック
    } else if (answers.healthFocus === 'lifestyle') {
        suggestions.push(giftData.gifts[2], giftData.gifts[3]); // 栄養指導、運動指導
    }
    
    // 重複を除去
    const uniqueSuggestions = suggestions.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
    );
    
    return uniqueSuggestions.slice(0, 3); // 最大3つまで
}

// アラート表示機能
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(alertDiv, mainContent.firstChild);
    
    // 5秒後に自動削除
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    // フェードインアニメーション
    const elements = document.querySelectorAll('.card, .hero, .gift-card');
    elements.forEach(element => {
        element.classList.add('fade-in');
    });
    
    // タブ機能の初期化
    initTabs();
    
    // 選択されたギフトを復元
    const savedGift = storage.get('selectedGift');
    if (savedGift) {
        selectedGift = savedGift;
    }
    
    // ページ固有の初期化
    const currentPage = window.location.pathname.split('/').pop();
    
    switch (currentPage) {
        case 'send_gifts_nonhelp.html':
            // ギフト選択ページの初期化
            initGiftSelection();
            break;
        case 'send_gifts_help.html':
            // ギフト提案ページの初期化
            initGiftSuggestion();
            break;
        case 'mypage.html':
            // マイページの初期化
            initMyPage();
            break;
        case 'history_send.html':
            // 履歴ページの初期化
            initHistoryPage();
            break;
    }
});

// ギフト選択ページの初期化
function initGiftSelection() {
    const giftContainer = document.getElementById('gift-container');
    if (!giftContainer) return;
    
    const giftHTML = giftData.gifts.map(gift => `
        <div class="gift-card" data-gift-id="${gift.id}" onclick="selectGift(${gift.id})">
            <div class="icon">${gift.icon}</div>
            <h3>${gift.name}</h3>
            <p>${gift.description}</p>
            <div class="price">¥${gift.price.toLocaleString()}</div>
        </div>
    `).join('');
    
    giftContainer.innerHTML = giftHTML;
    
    // フォーム送信処理
    handleFormSubmit('gift-form', (data) => {
        if (!selectedGift) {
            showAlert('ギフトを選択してください', 'warning');
            return;
        }
        
        console.log('送信データ:', { ...data, gift: selectedGift });
        processPayment();
    });
}

// ギフト提案ページの初期化
function initGiftSuggestion() {
    const form = document.getElementById('suggestion-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const answers = {
            age: formData.get('age'),
            healthFocus: formData.get('healthFocus'),
            budget: formData.get('budget')
        };
        
        const suggestions = suggestGifts(answers);
        displaySuggestions(suggestions);
    });
}

// 提案ギフト表示
function displaySuggestions(suggestions) {
    const container = document.getElementById('suggestions-container');
    if (!container) return;
    
    const suggestionsHTML = suggestions.map(gift => `
        <div class="gift-card" data-gift-id="${gift.id}" onclick="selectGift(${gift.id})">
            <div class="icon">${gift.icon}</div>
            <h3>${gift.name}</h3>
            <p>${gift.description}</p>
            <div class="price">¥${gift.price.toLocaleString()}</div>
        </div>
    `).join('');
    
    container.innerHTML = `
        <h2>おすすめのギフト</h2>
        <div class="grid grid-3">
            ${suggestionsHTML}
        </div>
        <div class="text-center">
            <button class="btn btn-success" onclick="navigateTo('send_gifts_nonhelp.html')">
                選択したギフトで進む
            </button>
        </div>
    `;
}

// マイページの初期化
function initMyPage() {
    // 最新の履歴を表示
    const recentHistory = giftData.history.slice(0, 2);
    const historyContainer = document.getElementById('recent-history');
    
    if (historyContainer) {
        const historyHTML = recentHistory.map(item => {
            const date = new Date(item.date).toLocaleDateString('ja-JP');
            const type = item.type === 'sent' ? '送信' : '受信';
            const partner = item.type === 'sent' ? item.recipient : item.sender;
            
            return `
                <div class="card">
                    <h3>${item.giftName}</h3>
                    <p>${type}: ${partner}</p>
                    <p>日付: ${date}</p>
                    <p>ステータス: ${item.status}</p>
                </div>
            `;
        }).join('');
        
        historyContainer.innerHTML = historyHTML;
    }
}

// 履歴ページの初期化
function initHistoryPage() {
    displayHistory('sent-history', 'sent');
    displayHistory('received-history', 'received');
}

// ユーザープロフィール表示
function displayProfile() {
    const profile = giftData.userProfile;
    const profileContainer = document.getElementById('profile-container');
    
    if (profileContainer) {
        profileContainer.innerHTML = `
            <div class="card">
                <h2>プロフィール情報</h2>
                <div class="form-group">
                    <label>お名前</label>
                    <p class="form-control">${profile.name}</p>
                </div>
                <div class="form-group">
                    <label>メールアドレス</label>
                    <p class="form-control">${profile.email}</p>
                </div>
                <div class="form-group">
                    <label>電話番号</label>
                    <p class="form-control">${profile.phone}</p>
                </div>
                <div class="form-group">
                    <label>住所</label>
                    <p class="form-control">${profile.address}</p>
                </div>
                <button class="btn btn-secondary">編集</button>
            </div>
        `;
    }
}

// バッジスタイル
const badgeStyles = `
    .badge {
        padding: 0.25rem 0.5rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
    }
    .badge-success {
        background-color: #d4edda;
        color: #155724;
    }
    .badge-warning {
        background-color: #fff3cd;
        color: #856404;
    }
`;

// スタイルを動的に追加
const style = document.createElement('style');
style.textContent = badgeStyles;
document.head.appendChild(style); 