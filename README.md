# GIFTS - 健康ギフト提案・購入プラットフォーム

## 🎁 プロジェクト概要

GIFTSは、大切な人に健康を贈る革新的なプラットフォームです。健康診断、フィットネス、ウェルネス体験などをギフトとして贈り、家族や友人との絆を深めながら健康意識を高めることを目指しています。

## ✨ 主な機能

### 🤖 AI機能
- **Amazon Bedrock統合**: GENIAC LLMを使用したギフト推薦システム
- **チャットボット**: LINE連携による健康相談機能
- **メッセージ生成**: 贈り主へのパーソナライズされたメッセージ生成

### 📱 ユーザー機能
- **ギフト相談**: AIによる最適な健康ギフトの提案
- **ギフト購入**: 簡単な決済フロー
- **注文管理**: 購入履歴と利用状況の確認
- **LINE連携**: LINE公式アカウントでの通知・相談

### 🔐 認証・セキュリティ
- **AWS Cognito**: 安全なユーザー認証
- **JWT認証**: API Gatewayでの認証
- **データ暗号化**: RDSでのデータ保護

## 🏗️ アーキテクチャ

### AWS サーバーレス構成
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │    │   API Gateway   │    │   Lambda        │
│   (フロントエンド) │    │   (API管理)      │    │   (バックエンド)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   S3            │    │   Cognito       │    │   RDS MySQL     │
│   (静的ファイル)   │    │   (認証)        │    │   (データベース)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 技術スタック
- **フロントエンド**: Vue.js 3 + TypeScript + Vite
- **バックエンド**: AWS Lambda + Node.js + TypeScript
- **データベース**: AWS RDS MySQL
- **認証**: AWS Cognito
- **AI**: Amazon Bedrock (Claude 3 Sonnet)
- **ホスティング**: S3 + CloudFront
- **API**: API Gateway
- **メッセージング**: LINE Messaging API

## 🚀 デプロイ手順

### 前提条件
- AWS CLIがインストールされている
- AWS認証情報が設定されている
- Node.js 18以上がインストールされている

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd gift
```

### 2. 環境変数の設定
```bash
# AWS認証情報の設定
aws configure

# LINE設定（オプション）
export LINE_CHANNEL_SECRET=your_line_channel_secret
export LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
```

### 3. デプロイの実行
```bash
# デプロイスクリプトを実行
chmod +x deploy.sh
./deploy.sh
```

### 4. デプロイ後の設定
1. **LINE公式アカウントの設定**
   - LINE Developers ConsoleでWebhook URLを設定
   - URL: `{API_GATEWAY_URL}/line-webhook`

2. **環境変数の確認**
   - デプロイ完了時に表示されるURLとIDを確認
   - 必要に応じてフロントエンドの環境変数を更新

## 📁 プロジェクト構造

```
gift/
├── aws-infrastructure/          # AWS CDK インフラストラクチャ
│   ├── lambda/                  # Lambda関数
│   │   ├── gift-recommendation/ # ギフト推薦AI
│   │   ├── line-webhook/        # LINE連携
│   │   └── order-management/    # 注文管理
│   ├── database/                # データベーススキーマ
│   └── lib/                     # CDKスタック定義
├── vue-gift-app/                # Vue.jsフロントエンド
│   ├── src/
│   │   ├── components/          # Vueコンポーネント
│   │   ├── services/            # APIサービス
│   │   ├── stores/              # Piniaストア
│   │   └── views/               # ページビュー
│   └── package.json
├── deploy.sh                    # デプロイスクリプト
└── README.md
```

## 🔧 開発環境のセットアップ

### 1. 依存関係のインストール
```bash
# フロントエンド
cd vue-gift-app
npm install

# インフラストラクチャ
cd ../aws-infrastructure
npm install
```

### 2. 開発サーバーの起動
```bash
# フロントエンド開発サーバー
cd vue-gift-app
npm run dev
```

### 3. ローカル開発用の環境変数
```bash
# vue-gift-app/.env.local
VITE_AWS_API_GATEWAY_URL=http://localhost:3000
VITE_COGNITO_USER_POOL_ID=your_user_pool_id
VITE_COGNITO_CLIENT_ID=your_client_id
```

## 🧪 テスト

### ユニットテスト
```bash
cd vue-gift-app
npm run test
```

### E2Eテスト
```bash
cd vue-gift-app
npm run test:e2e
```

## 📊 監視・ログ

### CloudWatchログ
- Lambda関数のログはCloudWatchで確認可能
- エラー監視とアラート設定を推奨

### メトリクス
- API Gatewayのリクエスト数
- Lambda関数の実行時間
- RDSの接続数とクエリパフォーマンス

## 🔒 セキュリティ

### 実装済みセキュリティ対策
- JWT認証によるAPI保護
- RDSデータベースの暗号化
- S3バケットの公開アクセス制限
- CloudFrontでのHTTPS強制

### 推奨追加対策
- WAFの設定
- CloudTrailでのAPI監査
- Secrets Managerでの機密情報管理

## 💰 コスト最適化

### AWS無料枠活用
- RDS MySQL: 月750時間（db.t2.micro）
- Lambda: 月100万リクエスト
- S3: 5GBストレージ
- CloudFront: 1TB転送
- Cognito: 月50,000ユーザー

### コスト監視
- AWS Cost Explorerでの定期的な監視
- 予算アラートの設定
- 不要リソースの定期的な削除

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 サポート

- バグ報告: GitHub Issues
- 機能要望: GitHub Discussions
- 技術的な質問: GitHub Discussions

## 🎯 今後の開発予定

- [ ] モバイルアプリ（React Native）
- [ ] 決済システムの統合（Stripe/PayPay）
- [ ] 多言語対応
- [ ] 管理者ダッシュボード
- [ ] 分析・レポート機能
- [ ] パートナー向けAPI

---

**GIFTS** - 健康を贈る、想いを届ける 🎁
