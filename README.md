# GIFT - 健康を贈る、想いを届ける

「GIFT」は、大切な人の健康を贈ることができる革新的なWebアプリケーションです。健康診断、フィットネス、ウェルネス体験などを通じて、「いつまでも元気でいてほしい」という想いを形にします。

## 🎯 プロジェクト概要

### コンセプト
「もしも」のための「いつも」の贈り物として、健康を贈る新しいコミュニケーションの形を提案します。

### ターゲットユーザー
- **GIFTER（贈る人）**: 家族や友人の健康を気遣い、具体的な行動として健康ギフトを贈りたい人
- **SELECTER（受け取る人）**: 健康管理の必要性を感じているが、なかなか行動に移せない人

## ✨ 主要機能

### 👤 ユーザー向け機能

#### 🎁 ギフト相談システム
- 3つの質問（年代・予算・健康への関心）に基づく最適なギフト提案
- パーソナライズされたレコメンデーション
- 直感的なUI/UXでスムーズな選択体験

#### 📋 ギフト一覧・検索
- カテゴリー別フィルタリング（健康診断・フィットネス・ウェルネス）
- 価格帯での絞り込み
- 人気順・価格順・評価順でのソート機能
- キーワード検索

#### 💳 購入・決済システム
- 受取人情報とメッセージの入力
- 複数決済方法対応（PayPay・クレジットカード）
- セキュアな決済処理

#### 🔗 ギフト共有機能
- ユニークなギフトURL生成
- LINE・メールでの簡単共有
- QRコード表示

### 🎁 ギフト受取体験

#### 📱 ギフト受取画面
- 美しいアニメーション付きギフトオープン体験
- 送り主からのメッセージ表示
- ギフト詳細情報（内容・提携施設・有効期限）
- 利用方法の詳細説明

#### 📊 QRコード表示
- 施設での利用時に提示するQRコード
- ギフトコードの表示
- 有効期限の明確な表示

### 🏢 管理者・事業者向け機能

#### 📈 管理者ダッシュボード
- ギフト発行・利用状況の統計
- 売上データの可視化
- ユーザー行動分析

#### 🔍 ギフト管理システム
- 全ギフトの一覧表示・検索
- ステータス管理（有効・利用済み・期限切れ）
- 詳細情報の確認

#### 📱 QRコードスキャナー
- 事業者向けギフト確認システム
- リアルタイムでのギフト利用確認
- 利用済みステータスの更新

## 🛠 技術仕様

### フロントエンド
- **HTML5**: セマンティックなマークアップ
- **CSS3**: レスポンシブデザイン、アニメーション
- **JavaScript (ES6+)**: モダンな JavaScript 機能
- **Progressive Web App**: オフライン対応、インストール可能

### 設計原則
- **モバイルファースト**: スマートフォンでの利用を最優先
- **アクセシビリティ**: WCAG 2.1 AA準拠
- **セキュリティ**: XSS対策、CSP実装、入力値検証
- **パフォーマンス**: 最適化された画像、遅延読み込み

## 🎨 デザインシステム

### カラーパレット
- **プライマリ**: `#1ABC9C` (ターコイズグリーン) - 健康・安心感
- **セカンダリ**: `#3498DB` (ブルー) - 信頼性
- **アクセント**: `#E74C3C` (レッド) - 重要な情報
- **ニュートラル**: `#2C3E50`, `#7F8C8D`, `#ECF0F1` - テキスト・背景

### タイポグラフィ
- **見出し**: 游ゴシック、Hiragino Sans、sans-serif
- **本文**: システムフォント優先
- **アクセシビリティ**: 十分なコントラスト比確保

### コンポーネント
- **ボタン**: 明確なCTA、ホバー効果
- **カード**: 情報の整理、シャドウ効果
- **フォーム**: 使いやすい入力体験
- **モーダル**: 重要な情報の表示

## 🚀 セットアップ・使用方法

### 基本セットアップ
1. リポジトリをクローン
2. Webサーバーで静的ファイルを配信
3. HTTPS環境での動作を推奨

### 開発環境
\`\`\`bash
# ローカルサーバーの起動例
python -m http.server 8000
# または
npx serve .
\`\`\`

### 本番環境
- HTTPS必須
- セキュリティヘッダーの設定
- CDN経由での配信推奨

## 📱 使用シナリオ

### シナリオ1: 親の還暦祝い
**GIFTER**: 30代女性（娘）
**SELECTER**: 60代男性（父親）

1. 娘がアプリで「60代以上」「2万円以上」「全般的な健康チェック」を選択
2. 「プレミアム人間ドック」が提案される
3. 「お父さん、いつまでも健康でいてほしいから」のメッセージ付きで購入
4. 父親がギフトURLを受け取り、内容を確認
5. 提携クリニックで予約・受診

### シナリオ2: 出産後の友人へ
**GIFTER**: 30代女性（友人）
**SELECTER**: 30代女性（出産後）

1. 友人が「30代」「1-2万円」「運動・フィットネス」を選択
2. 「パーソナルフィットネス体験」が提案される
3. 「育児お疲れ様！自分の体も大切にしてね」のメッセージで贈る
4. 受取人が都合の良いタイミングでフィットネスジムを利用

## 🔒 セキュリティ対策

### 実装済み対策
- **XSS防止**: 入力値のサニタイゼーション
- **CSRF対策**: トークンベース認証
- **Content Security Policy**: 厳格なCSP設定
- **入力値検証**: クライアント・サーバー両側での検証
- **レート制限**: API呼び出し制限

### セキュリティヘッダー
\`\`\`
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
\`\`\`

## 🎯 カスタマイズ・拡張

### ギフトカテゴリーの追加
1. `script.js`の`giftOptions`にデータ追加
2. カテゴリー名の定義を`getCategoryName`に追加
3. 対応するアイコンとスタイルを設定

### 決済方法の追加
1. `selectPaymentMethod`関数に新しい決済方法を追加
2. 対応するUIコンポーネントを作成
3. 決済処理ロジックを実装

### 新機能の追加
- **ギフト履歴**: 購入・受取履歴の管理
- **レビューシステム**: 利用後の評価・感想
- **プッシュ通知**: 利用リマインダー
- **ソーシャル機能**: ギフト体験の共有

## 🌟 今後の展開

### 短期目標
- ユーザーフィードバックの収集・分析
- パフォーマンス最適化
- セキュリティ強化

### 中期目標
- 新機能の追加（レビュー、通知等）
- 提携施設の拡大
- 地域展開

### 長期目標
- 海外展開
- AI活用によるパーソナライゼーション強化
- コミュニティ機能の実装

## 📁 ファイル構造

```
gift/
├── index.html              # ホームページ
├── send_gifts.html         # ギフト選択ページ
├── package.json            # プロジェクト設定
├── README.md               # このファイル
├── assets/
│   ├── css/
│   │   └── styles.css      # メインスタイルシート
│   ├── js/
│   │   ├── script.js       # メインJavaScript
│   │   ├── admin.js        # 管理者機能
│   │   ├── gift-list.js    # ギフト一覧機能
│   │   ├── service-info.js # サービス紹介機能
│   │   └── security-fix.js # セキュリティ機能
│   └── images/             # 画像ファイル（未使用）
├── pages/
│   ├── admin.html          # 管理者ページ
│   ├── gift-list.html      # ギフト一覧ページ
│   ├── service-info.html   # サービス紹介ページ
│   └── meta-security.html  # セキュリティ情報ページ
└── .vscode/
    └── settings.json       # VSCode設定
```

## 🚀 セットアップ

### GitHub Pagesでの利用

このサイトはGitHub Pagesで直接利用できます。

1. リポジトリをGitHubにプッシュ
2. リポジトリの設定でGitHub Pagesを有効化
3. 以下のURLでアクセス可能になります：
   ```
   https://[username].github.io/[repository-name]/
   ```

### ローカル環境での利用

#### 前提条件
- モダンブラウザ（Chrome, Firefox, Safari, Edge）
- ローカルサーバー（推奨）

#### インストール手順

1. リポジトリをクローン
```bash
git clone [repository-url]
cd gift
```

2. ローカルサーバーを起動
```bash
# Python 3の場合
python -m http.server 8000

# Node.jsの場合
npx http-server

# PHPの場合
php -S localhost:8000
```

3. ブラウザでアクセス
```
http://localhost:8000
```

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 お問い合わせ

ご質問やご意見がございましたら、お気軽にお問い合わせください。

---

**GIFT** - 健康を贈る、想いを届ける
