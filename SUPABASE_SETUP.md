# Supabase セットアップガイド

## 📋 概要

GIFTSアプリでSupabaseを使用するためのセットアップ手順です。

## 🚀 1. Supabaseプロジェクト作成

### 1.1 Supabaseアカウント作成
1. [Supabase](https://supabase.com)にアクセス
2. GitHubアカウントでサインアップ
3. 新しいプロジェクトを作成

### 1.2 プロジェクト設定
- **プロジェクト名**: `gifts-app`
- **データベースパスワード**: 安全なパスワードを設定
- **リージョン**: `Asia Pacific (Tokyo)` を選択

## 🗄️ 2. データベーススキーマ作成

### 2.1 SQLエディタでスキーマ実行
1. Supabaseダッシュボードで「SQL Editor」を開く
2. `supabase-schema.sql`の内容をコピー＆ペースト
3. 「Run」ボタンをクリックして実行

### 2.2 確認事項
- テーブルが正常に作成されているか確認
- サンプルデータが挿入されているか確認
- RLSポリシーが設定されているか確認

## 🔑 3. 環境変数設定

### 3.1 Supabase設定取得
1. プロジェクト設定 → API
2. 以下の情報をコピー：
   - **Project URL**
   - **anon public key**
   - **service_role key** (注意: 機密情報)

### 3.2 フロントエンド環境変数
`vue-gift-app/.env.local`ファイルを作成：

```env
# Supabase設定
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# アプリケーション設定
VITE_APP_NAME=GIFTS
VITE_APP_VERSION=1.0.0
```

### 3.3 Lambda関数環境変数
AWS Lambda関数に以下の環境変数を設定：

```env
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_KEY=your_service_role_key
LINE_CHANNEL_SECRET=your_line_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
FRONTEND_URL=https://your-app-domain.com
```

## 🔐 4. 認証設定

### 4.1 Supabase認証設定
1. Authentication → Settings
2. Site URL: `http://localhost:5173` (開発環境)
3. Redirect URLs: `http://localhost:5173/**`
4. Email確認: 必要に応じて有効化

### 4.2 メール設定（オプション）
1. Authentication → Email Templates
2. 確認メールとパスワードリセットメールをカスタマイズ

## 📁 5. ストレージ設定

### 5.1 バケット作成
1. Storage → New bucket
2. バケット名: `gift-images`
3. Public bucket: チェック
4. File size limit: 5MB

### 5.2 ストレージポリシー
```sql
-- 誰でも画像を閲覧可能
CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'gift-images');

-- 認証済みユーザーのみアップロード可能
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gift-images' 
    AND auth.role() = 'authenticated'
  );
```

## 🧪 6. 動作確認

### 6.1 フロントエンド確認
```bash
cd vue-gift-app
npm install
npm run dev
```

1. http://localhost:5173 にアクセス
2. サインアップ機能をテスト
3. ログイン機能をテスト
4. ギフト一覧表示をテスト

### 6.2 データベース確認
1. Supabaseダッシュボード → Table Editor
2. 各テーブルのデータを確認
3. RLSポリシーが正常に動作しているか確認

## 🔧 7. トラブルシューティング

### 7.1 よくある問題

#### 認証エラー
- 環境変数が正しく設定されているか確認
- Supabase URLとキーが正しいか確認

#### RLSエラー
- テーブルのRLSが有効になっているか確認
- ポリシーが正しく設定されているか確認

#### ストレージエラー
- バケットが作成されているか確認
- ストレージポリシーが設定されているか確認

### 7.2 ログ確認
- Supabaseダッシュボード → Logs
- リアルタイムログでエラーを確認

## 📊 8. 監視・メトリクス

### 8.1 ダッシュボード確認
- Database → Usage
- API → Usage
- Storage → Usage

### 8.2 アラート設定
- 必要に応じてアラートを設定
- データベース容量、API使用量の監視

## 🚀 9. 本番環境準備

### 9.1 本番環境変数
```env
VITE_SUPABASE_URL=your_production_project_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### 9.2 ドメイン設定
1. Authentication → Settings
2. Site URL: 本番ドメイン
3. Redirect URLs: 本番ドメインのパス

### 9.3 バックアップ設定
- 定期的なバックアップを設定
- データベースのスナップショットを取得

## 📚 10. 参考資料

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage API](https://supabase.com/docs/reference/javascript/storage-createbucket)

## ✅ チェックリスト

- [ ] Supabaseプロジェクト作成
- [ ] データベーススキーマ実行
- [ ] 環境変数設定
- [ ] 認証設定
- [ ] ストレージ設定
- [ ] 動作確認
- [ ] 本番環境準備

これでSupabaseのセットアップは完了です！ 