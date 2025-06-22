// GIFT アプリ共通JavaScript - オレンジ基調・スマホ最適化

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
    initializeApp();
});

// アプリ初期化
function initializeApp() {
    setupNavigation();
    setupAnimations();
    setupFormValidation();
    setupGiftSelection();
    setupTabNavigation();
    setupMobileOptimizations();
    setupLoadingStates();
}

// ナビゲーション設定
function setupNavigation() {
    // フッターナビゲーションのアクティブ状態管理
    const currentPage = getCurrentPage();
    const footerNavItems = document.querySelectorAll('.footer-nav-item');
    
    footerNavItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && href.includes(currentPage)) {
            item.classList.add('active');
        }
        
        // タップ時のフィードバック
        item.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        item.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// 現在のページ名を取得
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    return filename.replace('.html', '') || 'index';
}

// アニメーション設定
function setupAnimations() {
    // フェードインアニメーション
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // アニメーション対象要素を監視
    const animatedElements = document.querySelectorAll('.card, .gift-card, .choice-card, .flow-card');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // ボタンのホバーアニメーション
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // タッチデバイス用
        btn.addEventListener('touchstart', function() {
            this.style.transform = 'translateY(0) scale(0.98)';
        });
        
        btn.addEventListener('touchend', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
    });
}

// フォームバリデーション
function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm(this)) {
                showSuccessMessage('送信が完了しました！');
                // 実際の送信処理をここに追加
                setTimeout(() => {
                    this.reset();
                }, 2000);
            }
        });
        
        // リアルタイムバリデーション
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    });
}

// フォーム全体のバリデーション
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// 個別フィールドのバリデーション
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.getAttribute('name') || field.getAttribute('id');
    
    // エラーメッセージをクリア
    clearFieldError(field);
    
    // 必須チェック
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, `${getFieldLabel(field)}は必須です`);
        return false;
    }
    
    // メールアドレスチェック
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, '有効なメールアドレスを入力してください');
            return false;
        }
    }
    
    // 電話番号チェック
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[0-9-+\s()]+$/;
        if (!phoneRegex.test(value)) {
            showFieldError(field, '有効な電話番号を入力してください');
            return false;
        }
    }
    
    return true;
}

// フィールドエラー表示
function showFieldError(field, message) {
    field.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#FF6B6B';
    errorDiv.style.fontSize = '0.85rem';
    errorDiv.style.marginTop = '0.5rem';
    
    field.parentNode.appendChild(errorDiv);
}

// フィールドエラークリア
function clearFieldError(field) {
    field.classList.remove('error');
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// フィールドラベル取得
function getFieldLabel(field) {
    const label = field.parentNode.querySelector('label');
    return label ? label.textContent.replace('*', '').trim() : 'この項目';
}

// ギフト選択機能
function setupGiftSelection() {
    const giftCards = document.querySelectorAll('.gift-card');
    
    giftCards.forEach(card => {
        card.addEventListener('click', function() {
            // 他のカードの選択を解除
            giftCards.forEach(c => c.classList.remove('selected'));
            
            // このカードを選択
            this.classList.add('selected');
            
            // 選択されたギフトの情報を保存
            const giftName = this.querySelector('h3').textContent;
            const giftPrice = this.querySelector('.price').textContent;
            
            // 選択情報を表示
            showGiftSelection(giftName, giftPrice);
            
            // 次のステップボタンを有効化
            enableNextStep();
        });
    });
}

// ギフト選択情報表示
function showGiftSelection(name, price) {
    let selectionInfo = document.getElementById('gift-selection-info');
    
    if (!selectionInfo) {
        selectionInfo = document.createElement('div');
        selectionInfo.id = 'gift-selection-info';
        selectionInfo.className = 'alert alert-info';
        selectionInfo.style.marginTop = '1rem';
        
        const container = document.querySelector('.gift-selection') || document.querySelector('.main-content');
        container.appendChild(selectionInfo);
    }
    
    selectionInfo.innerHTML = `
        <strong>選択されたギフト:</strong> ${name} - ${price}
        <button class="btn btn-secondary" onclick="clearGiftSelection()" style="margin-left: 1rem; padding: 0.5rem 1rem; font-size: 0.9rem;">
            選択をクリア
        </button>
    `;
}

// ギフト選択クリア
function clearGiftSelection() {
    const giftCards = document.querySelectorAll('.gift-card');
    giftCards.forEach(card => card.classList.remove('selected'));
    
    const selectionInfo = document.getElementById('gift-selection-info');
    if (selectionInfo) {
        selectionInfo.remove();
    }
    
    disableNextStep();
}

// 次のステップ有効化
function enableNextStep() {
    const nextButtons = document.querySelectorAll('.btn-next, .btn-primary');
    nextButtons.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    });
}

// 次のステップ無効化
function disableNextStep() {
    const nextButtons = document.querySelectorAll('.btn-next, .btn-primary');
    nextButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.style.cursor = 'not-allowed';
    });
}

// タブナビゲーション
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // アクティブ状態を切り替え
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // タブ切り替え時のアニメーション
            const activeContent = document.getElementById(targetTab);
            activeContent.style.opacity = '0';
            activeContent.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                activeContent.style.transition = 'all 0.3s ease';
                activeContent.style.opacity = '1';
                activeContent.style.transform = 'translateY(0)';
            }, 50);
        });
    });
}

// モバイル最適化
function setupMobileOptimizations() {
    // タッチデバイス判定
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
        // タッチデバイス用のスタイル調整
        document.body.classList.add('touch-device');
        
        // ダブルタップズーム無効化
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
    
    // スクロール位置の復元
    window.addEventListener('beforeunload', function() {
        sessionStorage.setItem('scrollPosition', window.scrollY);
    });
    
    window.addEventListener('load', function() {
        const scrollPosition = sessionStorage.getItem('scrollPosition');
        if (scrollPosition) {
            window.scrollTo(0, parseInt(scrollPosition));
            sessionStorage.removeItem('scrollPosition');
        }
    });
}

// ローディング状態管理
function setupLoadingStates() {
    // ボタンクリック時のローディング表示
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.disabled && !this.classList.contains('btn-secondary')) {
                const originalText = this.textContent;
                this.textContent = '処理中...';
                this.disabled = true;
                
                // ローディングアニメーション
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                
                const loadingBar = document.createElement('div');
                loadingBar.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    animation: loading 1.5s infinite;
                `;
                
                this.appendChild(loadingBar);
                
                // 3秒後に元に戻す（実際の処理では適切なタイミングで）
                setTimeout(() => {
                    this.textContent = originalText;
                    this.disabled = false;
                    if (loadingBar.parentNode) {
                        loadingBar.remove();
                    }
                }, 3000);
            }
        });
    });
}

// ローディングアニメーション
const loadingStyle = document.createElement('style');
loadingStyle.textContent = `
    @keyframes loading {
        0% { left: -100%; }
        100% { left: 100%; }
    }
`;
document.head.appendChild(loadingStyle);

// 成功メッセージ表示
function showSuccessMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success fade-in';
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.left = '50%';
    alertDiv.style.transform = 'translateX(-50%)';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.style.textAlign = 'center';
    
    document.body.appendChild(alertDiv);
    
    // 3秒後に自動削除
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 300);
    }, 3000);
}

// エラーメッセージ表示
function showErrorMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-warning fade-in';
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.left = '50%';
    alertDiv.style.transform = 'translateX(-50%)';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.style.textAlign = 'center';
    
    document.body.appendChild(alertDiv);
    
    // 5秒後に自動削除
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 300);
    }, 5000);
}

// ページ遷移
function navigateTo(page) {
    showLoading();
    setTimeout(() => {
        window.location.href = page;
    }, 300);
}

// ローディング表示
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'page-loading';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    
    loadingDiv.innerHTML = `
        <div style="text-align: center;">
            <div style="width: 50px; height: 50px; border: 3px solid #FF8C00; border-top: 3px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
            <p style="color: #333; font-weight: 600;">読み込み中...</p>
        </div>
    `;
    
    document.body.appendChild(loadingDiv);
}

// 履歴データの管理
const giftHistory = {
    sent: [
        { id: 1, recipient: '田中太郎', gift: '健康診断パックA', date: '2024-01-15', status: '完了' },
        { id: 2, recipient: '佐藤花子', gift: '健康診断パックB', date: '2024-01-10', status: '完了' },
        { id: 3, recipient: '鈴木一郎', gift: '健康診断パックC', date: '2024-01-05', status: '処理中' }
    ],
    received: [
        { id: 1, sender: '山田次郎', gift: '健康診断パックA', date: '2024-01-12', status: '完了' },
        { id: 2, sender: '高橋美咲', gift: '健康診断パックB', date: '2024-01-08', status: '完了' }
    ]
};

// 履歴表示
function displayHistory(type = 'sent') {
    const historyContainer = document.getElementById('history-content');
    if (!historyContainer) return;
    
    const data = giftHistory[type];
    let html = '';
    
    if (data.length === 0) {
        html = '<p style="text-align: center; color: #666; padding: 2rem;">履歴がありません</p>';
    } else {
        html = `
            <table class="history-table">
                <thead>
                    <tr>
                        <th>${type === 'sent' ? '受取人' : '送信者'}</th>
                        <th>ギフト</th>
                        <th>日付</th>
                        <th>ステータス</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        data.forEach(item => {
            const statusClass = item.status === '完了' ? 'badge-success' : 'badge-warning';
            html += `
                <tr>
                    <td>${type === 'sent' ? item.recipient : item.sender}</td>
                    <td>${item.gift}</td>
                    <td>${item.date}</td>
                    <td><span class="badge ${statusClass}">${item.status}</span></td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
    }
    
    historyContainer.innerHTML = html;
}

// ギフト提案機能
function suggestGift(answers) {
    const suggestions = {
        'health-conscious': '健康診断パックA',
        'busy-person': '健康診断パックB',
        'elderly': '健康診断パックC',
        'family': '健康診断パックD'
    };
    
    // 簡単なロジック（実際はより複雑な判定）
    const mostFrequent = Object.keys(answers).reduce((a, b) => 
        answers[a] > answers[b] ? a : b
    );
    
    return suggestions[mostFrequent] || '健康診断パックA';
}

// ユーティリティ関数
function formatPrice(price) {
    return `¥${price.toLocaleString()}`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('ja-JP');
}

// エクスポート機能
function exportHistory(type) {
    const data = giftHistory[type];
    const csvContent = "data:text/csv;charset=utf-8," + 
        "受取人,ギフト,日付,ステータス\n" +
        data.map(item => 
            `${type === 'sent' ? item.recipient : item.sender},${item.gift},${item.date},${item.status}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_history.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccessMessage('履歴をエクスポートしました');
}

// 検索機能
function searchHistory(query, type = 'sent') {
    const data = giftHistory[type];
    const filtered = data.filter(item => {
        const searchText = `${type === 'sent' ? item.recipient : item.sender} ${item.gift} ${item.date} ${item.status}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
    });
    
    return filtered;
}

// フィルター機能
function filterHistory(status, type = 'sent') {
    const data = giftHistory[type];
    if (status === 'all') return data;
    
    return data.filter(item => item.status === status);
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