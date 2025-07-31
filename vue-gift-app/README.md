# 🎁 GIFTS - 健康ギフト提案・購入プラットフォーム

## 📋 概要

GIFTSは、AIを活用した健康ギフトの提案・購入プラットフォームです。ユーザーの健康関心事や予算に基づいて、最適な健康ギフトを推薦し、LINE連携によるシームレスなユーザー体験を提供します。

## ✨ 主要機能

### 🎯 ギフト相談・推薦
- **AI推薦システム**: Amazon Bedrock（GENIAC LLM）を活用したパーソナライズされたギフト推薦
- **相談フロー**: 年齢、性別、健康関心事、予算に基づく最適化
- **リアルタイム推薦**: 即座にギフト提案を生成

### 💳 ギフト購入・管理
- **決済システム**: PayPay連携による安全な決済
- **注文管理**: 注文状況の追跡・管理
- **ギフトURL発行**: 受取人へのギフト詳細共有

### 📱 LINE連携
- **LINE公式アカウント**: ユーザーとの接点
- **Webhook**: メッセージ受信・処理
- **リッチメニュー**: クイックアクセス機能
- **通知システム**: 注文状況、利用可能通知

### 🔐 認証・セキュリティ
- **AWS Cognito**: 安全なユーザー認証
- **JWT認証**: セッション管理
- **データ暗号化**: 転送時・保存時の暗号化

## 🏗️ 技術スタック

### フロントエンド
- **Vue.js 3** + Composition API
- **TypeScript** - 型安全性
- **Pinia** - 状態管理
- **Vue Router** - ルーティング
- **Vite** - ビルドツール

### バックエンド
- **AWS Lambda** - サーバーレス関数
- **Amazon API Gateway** - RESTful API
- **Amazon Aurora PostgreSQL** - リレーショナルデータベース
- **Amazon S3** - ファイルストレージ
- **Amazon CloudFront** - CDN

### AI・外部連携
- **Amazon Bedrock** - GENIAC LLM
- **LINE Messaging API** - LINE連携
- **PayPay API** - 決済システム

## 🚀 セットアップ

### 前提条件
- Node.js 18.x以上
- npm または yarn
- AWS CLI（本番デプロイ用）
- Docker（ローカル開発用）

### 1. リポジトリクローン
```bash
git clone <repository-url>
cd vue-gift-app
```

### 2. 依存関係インストール
```bash
npm install
```

### 3. 環境変数設定
```bash
cp env.example .env.local
```

`.env.local`ファイルを編集して、必要な環境変数を設定してください：

```env
# API設定
VITE_API_BASE_URL=https://api.gift-app.com

# AWS Cognito設定
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# LINE設定
VITE_LINE_CHANNEL_ID=xxxxxxxxxx
VITE_LINE_CHANNEL_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# AWS Bedrock設定
VITE_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# S3設定
VITE_S3_BUCKET_NAME=gift-app-uploads

# 決済設定
VITE_PAYPAY_CLIENT_ID=xxxxxxxxxx
VITE_PAYPAY_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. 開発サーバー起動
```bash
npm run dev
```

アプリケーションが `http://localhost:5173` で起動します。

## 📁 プロジェクト構造

```
vue-gift-app/
├── src/
│   ├── components/          # Vueコンポーネント
│   ├── views/              # ページコンポーネント
│   ├── stores/             # Piniaストア
│   ├── services/           # APIサービス
│   ├── types/              # TypeScript型定義
│   ├── router/             # ルーティング設定
│   ├── assets/             # 静的アセット
│   └── main.ts             # エントリーポイント
├── docs/                   # ドキュメント
│   ├── system-design.md    # システム設計書
│   └── development-plan.md # 開発計画書
├── aws-infrastructure/     # AWS CDKスタック
├── public/                 # 公開ファイル
└── package.json
```

## 🧪 テスト

### ユニットテスト実行
```bash
npm run test
```

### E2Eテスト実行
```bash
npm run test:e2e
```

### テストカバレッジ確認
```bash
npm run test:coverage
```

## 🚀 デプロイ

### AWS環境へのデプロイ

#### 1. AWS CDKセットアップ
```bash
cd aws-infrastructure
npm install
```

#### 2. AWS認証情報設定
```bash
aws configure
```

#### 3. CDKデプロイ
```bash
npm run build
npx cdk deploy
```

### フロントエンドビルド
```bash
npm run build
```

ビルドされたファイルは `dist/` ディレクトリに出力されます。

## 📊 品質管理

### コード品質チェック
```bash
# ESLint実行
npm run lint

# Prettier実行
npm run format

# 型チェック
npm run type-check
```

### パフォーマンス監視
- **Lighthouse Score**: 90点以上を目標
- **Core Web Vitals**: 基準値達成
- **アクセシビリティ**: WCAG 2.1 AA準拠

## 🔧 開発ガイドライン

### コーディング規約
- **TypeScript**: 厳密な型定義
- **ESLint**: コード品質チェック
- **Prettier**: コードフォーマット統一
- **Conventional Commits**: コミットメッセージ規約

### ブランチ戦略
- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発
- `hotfix/*`: 緊急修正

### プルリクエスト
- レビュー必須
- テスト通過必須
- コードカバレッジ80%以上

## 📚 ドキュメント

- [システム設計書](./docs/system-design.md)
- [開発計画書](./docs/development-plan.md)
- [API仕様書](./docs/api-specification.md)
- [デザインシステム](./docs/design-system.md)

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## 📞 サポート

- **Issues**: [GitHub Issues](https://github.com/your-username/gift-app/issues)
- **ドキュメント**: [プロジェクトWiki](https://github.com/your-username/gift-app/wiki)
- **メール**: support@gift-app.com

## 🎯 ロードマップ

### 短期（3ヶ月）
- [ ] 多言語対応（英語、中国語）
- [ ] モバイルアプリ（React Native）
- [ ] 分析機能（QuickSight統合）

### 中期（6ヶ月）
- [ ] AI機能強化（Personalize統合）
- [ ] サブスクリプション機能
- [ ] パートナー拡大

### 長期（1年）
- [ ] グローバル展開
- [ ] IoT連携
- [ ] ブロックチェーン統合

---

**GIFTS** - 健康を贈る、新しい体験を。
