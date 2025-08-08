# 🚀 デプロイガイド - ネット公開の手順

## 📋 前提条件

### 1. Supabaseプロジェクトの作成
1. [Supabase](https://supabase.com)にアクセス
2. GitHubアカウントでサインアップ
3. 新しいプロジェクトを作成
   - プロジェクト名: `gifts-app`
   - リージョン: `Asia Pacific (Tokyo)`

### 2. データベーススキーマの設定
1. Supabaseダッシュボード → **SQL Editor**
2. `supabase-schema.sql`の内容をコピー＆ペースト
3. **Run**ボタンをクリック

### 3. 環境変数の取得
1. **Settings** → **API**
2. 以下の情報をコピー：
   - **Project URL**
   - **anon public key**

## 🌐 デプロイ方法

### 方法1: Vercel（推奨 - 無料・簡単）

#### 手順1: Vercel CLIインストール
```bash
npm install -g vercel
```

#### 手順2: 環境変数設定
```bash
cd vue-gift-app
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

#### 手順3: デプロイ
```bash
vercel --prod
```

#### メリット
- ✅ 無料プランあり
- ✅ 自動デプロイ（GitHub連携）
- ✅ 高速なCDN
- ✅ 簡単な設定

### 方法2: Netlify（無料・簡単）

#### 手順1: Netlify CLIインストール
```bash
npm install -g netlify-cli
```

#### 手順2: ビルドとデプロイ
```bash
cd vue-gift-app
npm run build
netlify deploy --prod --dir=dist
```

#### 手順3: 環境変数設定
Netlifyダッシュボードで以下を設定：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 方法3: AWS（有料・本格的なインフラ）

#### 手順1: AWS CLIインストール
```bash
# macOS
brew install awscli

# または公式サイトからダウンロード
# https://aws.amazon.com/cli/
```

#### 手順2: AWS認証情報設定
```bash
aws configure
```

#### 手順3: インフラデプロイ
```bash
cd aws-infrastructure
npm install
npm run build
npx cdk deploy
```

#### 手順4: フロントエンドデプロイ
```bash
cd ../vue-gift-app
npm run build
aws s3 sync dist s3://gift-app-website --delete
```

## 🔧 環境変数設定

### ローカル開発用
`vue-gift-app/.env.local`ファイルを作成：
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_NAME=GIFTS
VITE_APP_VERSION=1.0.0
```

### 本番環境用
各プラットフォームのダッシュボードで設定：
- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **AWS**: Lambda Functions → Environment Variables

## 📊 費用比較

| プラットフォーム | 無料プラン | 月額料金 | 特徴 |
|----------------|-----------|---------|------|
| **Vercel** | 100GB転送/月 | $20/月 | 開発者に最適 |
| **Netlify** | 100GB転送/月 | $19/月 | 静的サイト特化 |
| **AWS** | なし | 従量課金 | 本格的なインフラ |

## 🚀 クイックスタート（推奨）

### 1. Supabase設定
```bash
# 1. Supabaseプロジェクト作成（手動）
# 2. スキーマ実行（手動）
# 3. 環境変数取得（手動）
```

### 2. Vercelデプロイ
```bash
# 1. Vercel CLIインストール
npm install -g vercel

# 2. プロジェクトディレクトリに移動
cd vue-gift-app

# 3. デプロイ
vercel --prod

# 4. 環境変数設定（プロンプトに従う）
```

### 3. 動作確認
1. 提供されたURLにアクセス
2. ユーザー登録・ログインをテスト
3. ギフト一覧表示を確認

## 🔍 トラブルシューティング

### よくある問題

#### 1. 環境変数エラー
```
Error: Missing Supabase environment variables
```
**解決方法**: 環境変数が正しく設定されているか確認

#### 2. ビルドエラー
```
Build failed
```
**解決方法**: 
```bash
cd vue-gift-app
npm install
npm run build
```

#### 3. CORSエラー
```
CORS policy blocked
```
**解決方法**: Supabaseの認証設定でリダイレクトURLを追加

### ログ確認方法

#### Vercel
```bash
vercel logs
```

#### Netlify
```bash
netlify logs
```

#### AWS
```bash
aws logs describe-log-groups
```

## 📱 公開後の確認事項

### 1. 基本機能テスト
- [ ] ユーザー登録
- [ ] ログイン・ログアウト
- [ ] パスワードリセット
- [ ] ギフト一覧表示

### 2. セキュリティ確認
- [ ] HTTPS接続
- [ ] 環境変数の機密性
- [ ] CORS設定

### 3. パフォーマンス確認
- [ ] ページ読み込み速度
- [ ] 画像最適化
- [ ] キャッシュ設定

## 🎉 完了！

デプロイが完了すると、以下のようなURLが提供されます：
- **Vercel**: `https://your-app.vercel.app`
- **Netlify**: `https://your-app.netlify.app`
- **AWS**: `https://your-cloudfront-domain.cloudfront.net`

このURLを共有することで、世界中の誰でもあなたのサイトにアクセスできます！ 