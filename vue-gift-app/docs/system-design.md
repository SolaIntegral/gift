# GIFTSアプリ システム設計書

## 📋 概要

### プロダクト名
**GIFTS** - 健康ギフト提案・購入プラットフォーム

### 目的
- ユーザーが健康に関するギフトを簡単に選択・購入できるプラットフォーム
- AIを活用したパーソナライズされたギフト推薦
- LINE連携によるシームレスなユーザー体験

---

## 🏗️ システムアーキテクチャ

### 全体構成図
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   フロントエンド   │    │   バックエンド     │    │   外部サービス     │
│                 │    │                 │    │                 │
│ ・Vue.js 3      │◄──►│ ・Supabase      │◄──►│ ・LINE API      │
│ ・TypeScript    │    │ ・認証・DB・API   │    │ ・PayPay API    │
│ ・Pinia         │    │ ・リアルタイム    │    │ ・医療機関API    │
│ ・Vercel        │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 技術スタック

#### フロントエンド ✅ 実装済み
- **フレームワーク**: Vue.js 3 + Composition API
- **言語**: TypeScript
- **状態管理**: Pinia
- **ルーティング**: Vue Router
- **UIライブラリ**: カスタムコンポーネント
- **ビルドツール**: Vite
- **ホスティング**: Vercel（本番環境）
- **本番URL**: https://vue-gift-app.vercel.app

#### バックエンド ✅ 実装済み（Supabase使用）
- **BaaS**: Supabase
- **認証**: Supabase Auth
- **データベース**: Supabase PostgreSQL
- **リアルタイム**: Supabase Realtime
- **API**: Supabase REST API
- **ファイルストレージ**: Supabase Storage
- **AI/ML**: Amazon Bedrock（将来実装予定）

#### 外部連携 ⚠️ 未実装
- **メッセージング**: LINE Messaging API
- **決済**: PayPay API
- **地図**: Google Maps API

---

## 🗄️ データベース設計 ✅ 実装済み（Supabase）

### ER図
```
Users (ユーザー) ✅ 実装済み
├── id (PK)
├── email
├── name
├── phone
├── line_user_id
├── created_at
└── updated_at

Gifts (ギフト) ✅ 実装済み
├── id (PK)
├── name
├── description
├── price
├── category
├── partner_id (FK)
├── status
├── image_url
└── created_at

GiftOrders (ギフト注文) ✅ 実装済み
├── id (PK)
├── gifter_id (FK -> Users)
├── gift_id (FK -> Gifts)
├── recipient_name
├── recipient_email
├── message
├── gift_url
├── status
├── payment_status
├── created_at
└── updated_at

GiftUsage (ギフト利用) ⚠️ 未実装
├── id (PK)
├── order_id (FK -> GiftOrders)
├── used_at
├── facility_id (FK -> Facilities)
└── status

Facilities (医療機関) ✅ 実装済み
├── id (PK)
├── name
├── address
├── phone
├── category
├── latitude
├── longitude
└── status

Partners (提携先) ✅ 実装済み
├── id (PK)
├── name
├── category
├── api_key
└── status

Consultations (相談履歴) ✅ 実装済み
├── id (PK)
├── user_id (FK -> Users)
├── answers (JSON)
├── recommendations (JSON)
└── created_at
```

### テーブル詳細

#### Users
| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | UUID | PK | ユーザーID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | メールアドレス |
| password_hash | VARCHAR(255) | NOT NULL | パスワードハッシュ |
| name | VARCHAR(100) | NOT NULL | 氏名 |
| phone | VARCHAR(20) | | 電話番号 |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | 更新日時 |

#### Gifts
| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | UUID | PK | ギフトID |
| name | VARCHAR(200) | NOT NULL | ギフト名 |
| description | TEXT | NOT NULL | 説明 |
| price | INTEGER | NOT NULL | 価格 |
| category | VARCHAR(50) | NOT NULL | カテゴリ |
| partner_id | UUID | FK | 提携先ID |
| status | VARCHAR(20) | NOT NULL | ステータス |
| image_url | VARCHAR(500) | | 画像URL |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |

#### GiftOrders
| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | UUID | PK | 注文ID |
| gifter_id | UUID | FK | 贈り主ID |
| gift_id | UUID | FK | ギフトID |
| recipient_name | VARCHAR(100) | NOT NULL | 受取人名 |
| recipient_email | VARCHAR(255) | NOT NULL | 受取人メール |
| message | TEXT | | メッセージ |
| gift_url | VARCHAR(500) | NOT NULL | ギフトURL |
| status | VARCHAR(20) | NOT NULL | 注文ステータス |
| payment_status | VARCHAR(20) | NOT NULL | 決済ステータス |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | 更新日時 |

---

## 🔐 セキュリティ設計 ✅ 実装済み（Supabase）

### 認証・認可
- **認証方式**: JWT + Supabase Auth
- **パスワードポリシー**: 8文字以上、大文字・小文字・数字・記号必須
- **セッション管理**: リフレッシュトークン方式
- **多要素認証**: オプション（SMS/メール）
- **Row Level Security (RLS)**: 実装済み

### データ保護 ✅ 実装済み
- **暗号化**: 転送時（TLS 1.3）、保存時（AES-256）
- **個人情報**: GDPR準拠
- **ログ管理**: Supabase Logs
- **監査**: Supabase Audit Logs

### API セキュリティ ✅ 実装済み
- **CORS**: 許可ドメイン制限
- **Rate Limiting**: Supabase制限
- **入力検証**: フロントエンド・バックエンド両方でバリデーション
- **SQL Injection対策**: Supabaseパラメータ化クエリ

---

## 🤖 AI機能設計 ⚠️ 未実装

### Amazon Bedrock活用（将来実装予定）
- **モデル**: Claude 3 Sonnet
- **用途**: ギフト推薦、メッセージ生成
- **プロンプト設計**: 構造化されたテンプレート
- **出力形式**: JSON形式での構造化データ

### 推薦アルゴリズム
1. **ユーザープロフィール分析**
   - 年齢、性別、健康関心事
   - 予算、関係性

2. **ギフトマッチング**
   - カテゴリ別フィルタリング
   - 価格帯フィルタリング
   - 人気度・評価スコア

3. **AI推薦生成**
   - パーソナライズされた説明
   - 健康効果の説明
   - 注意事項の提示

---

## 📱 LINE連携設計 ⚠️ 未実装

### 機能概要（将来実装予定）
- **LINE公式アカウント**: ユーザーとの接点
- **Webhook**: メッセージ受信・処理
- **リッチメニュー**: クイックアクセス
- **Flex Message**: リッチなメッセージ表示

### 連携フロー
1. **ユーザー登録**: LINE IDとアプリアカウント連携
2. **ギフト相談**: LINEから相談開始
3. **通知**: 注文状況、利用可能通知
4. **サポート**: チャットボット対応

### セキュリティ
- **署名検証**: LINE Webhook署名検証
- **アクセストークン**: 安全な保存・更新
- **ユーザー同意**: 明示的な連携同意

---

## 💳 決済設計 ⚠️ 未実装

### PayPay連携（将来実装予定）
- **決済方式**: PayPay API
- **決済フロー**: 事前承認 → 確定
- **エラーハンドリング**: 決済失敗時の処理
- **返金処理**: キャンセル・返金対応

### 決済ステータス管理
- `pending`: 決済待ち
- `paid`: 決済完了
- `failed`: 決済失敗
- `refunded`: 返金済み

---

## 📊 監視・ログ設計

### CloudWatch
- **メトリクス**: Lambda実行時間、エラー率
- **ログ**: アプリケーションログ
- **アラーム**: エラー率、レスポンス時間

### アプリケーションログ
- **構造化ログ**: JSON形式
- **ログレベル**: ERROR, WARN, INFO, DEBUG
- **トレーシング**: リクエストID追跡

---

## 🔄 CI/CD設計

### GitHub Actions
- **ビルド**: TypeScriptコンパイル
- **テスト**: ユニットテスト、E2Eテスト
- **デプロイ**: AWS CDKデプロイ
- **品質チェック**: ESLint、Prettier

### デプロイ環境
- **開発環境**: 開発用リソース
- **ステージング環境**: テスト用リソース
- **本番環境**: 本番用リソース

---

## 📈 スケーラビリティ設計

### 水平スケーリング
- **Lambda**: 自動スケーリング
- **Aurora**: 読み取りレプリカ
- **CloudFront**: グローバルCDN

### パフォーマンス最適化
- **キャッシュ**: CloudFront、Redis
- **データベース**: インデックス最適化
- **画像**: S3 + CloudFront

---

## 🛡️ 障害対策

### 可用性
- **マルチAZ**: Aurora、Lambda
- **バックアップ**: 自動バックアップ
- **復旧**: RTO 4時間、RPO 1時間

### 災害対策
- **リージョン間**: マルチリージョン展開
- **データ複製**: クロスリージョンレプリケーション
- **フェイルオーバー**: 自動フェイルオーバー

---

## 📊 実装状況サマリー

### ✅ 実装済み機能
- **フロントエンド**: Vue.js 3 + TypeScript + Vite
- **認証システム**: Supabase Auth（ログイン・登録・パスワードリセット）
- **データベース**: Supabase PostgreSQL（全テーブル・RLS設定済み）
- **API**: Supabase REST API
- **ホスティング**: Vercel（本番環境）
- **UI/UX**: レスポンシブデザイン、モダンなUI
- **ルーティング**: Vue Router（全ページ）
- **状態管理**: Pinia（認証・ギフト・注文）
- **セキュリティ**: RLS、CORS、入力検証

### ⚠️ 未実装機能
- **AI推薦システム**: Amazon Bedrock連携
- **LINE連携**: LINE Messaging API
- **決済システム**: PayPay API
- **ギフト利用管理**: 利用状況追跡
- **通知システム**: メール・プッシュ通知
- **分析機能**: ユーザー行動分析

### 🚀 本番環境
- **URL**: https://vue-gift-app.vercel.app
- **データベース**: Supabase（無料プラン）
- **認証**: Supabase Auth
- **デプロイ**: Vercel（自動デプロイ）

---

## 📋 コンプライアンス

### 個人情報保護
- **GDPR**: 欧州一般データ保護規則準拠
- **個人情報保護法**: 日本法準拠
- **データ最小化**: 必要最小限のデータ収集

### 医療関連
- **医療法**: 医療機関連携時の法規制
- **個人情報**: 医療情報の特別保護
- **同意管理**: 明示的な同意取得

---

## 🔮 将来拡張

### 短期（3ヶ月）
- **多言語対応**: 英語、中国語
- **モバイルアプリ**: React Native
- **分析機能**: QuickSight統合

### 中期（6ヶ月）
- **AI機能強化**: Personalize統合
- **サブスクリプション**: 定期ギフト
- **パートナー拡大**: 医療機関追加

### 長期（1年）
- **グローバル展開**: 海外市場
- **IoT連携**: 健康デバイス連携
- **ブロックチェーン**: ギフト履歴管理 