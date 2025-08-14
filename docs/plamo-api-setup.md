# Plamo API設定手順書

## 📋 概要

Preferred NetworksのPlamo APIを使用するための設定手順です。このAPIは高性能な日本語特化LLMで、GENIAC開発のLLMとして審査での加点対象となります。

## 🔑 APIキーの取得

### 1. Preferred Networksアカウント作成
1. [Preferred Networks](https://platform.preferredai.jp/)にアクセス
2. 「新規登録」をクリック
3. 必要な情報を入力してアカウントを作成

### 2. APIキーの生成
1. ログイン後、ダッシュボードに移動
2. 「API Keys」セクションを開く
3. 「New API Key」をクリック
4. APIキー名を入力（例：「GIFTS-Development」）
5. 生成されたAPIキーをコピーして安全に保存

## ⚙️ 環境変数の設定

### 1. .env.localファイルの作成
プロジェクトルート（`vue-gift-app/`）に`.env.local`ファイルを作成し、以下を追加：

```bash
# Supabase設定
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Plamo API設定
VITE_PLAMO_API_KEY=your_actual_plamo_api_key
VITE_PLAMO_BASE_URL=https://platform.preferredai.jp/api/completion
VITE_PLAMO_MODEL=plamo-2.0-prime

# Amazon Bedrock設定（フォールバック用）
VITE_BEDROCK_API_KEY=your_bedrock_api_key
VITE_BEDROCK_BASE_URL=https://jquzcc3vd0.execute-api.us-west-2.amazonaws.com/prod
VITE_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# アプリケーション設定
VITE_APP_NAME=GIFTS
VITE_APP_VERSION=1.0.0
```

### 2. 実際の値の設定
- `VITE_PLAMO_API_KEY`: 取得したAPIキーを設定
- `VITE_SUPABASE_URL`と`VITE_SUPABASE_ANON_KEY`: 既存のSupabase設定を使用
- その他の値は必要に応じて設定

## 🧪 API接続テスト

### 1. コマンドラインでのテスト
```bash
# 環境変数を設定
export PLAMO_API_KEY="your_actual_api_key"

# API接続テスト
curl -H "Authorization: Bearer ${PLAMO_API_KEY}" \
     -H "Content-Type: application/json" \
     "https://platform.preferredai.jp/api/completion/v1/chat/completions" \
     -d @- << EOF
{
  "messages": [
    {
      "role": "system",
      "content": "あなたは健康ギフトの専門アドバイザーです"
    },
    {
      "role": "user",
      "content": "健康診断の結果が良かった家族へのギフトを教えて下さい"
    }
  ],
  "model": "plamo-2.0-prime"
}
EOF
```

### 2. アプリケーションでのテスト
1. 開発サーバーを起動：`npm run dev`
2. ブラウザでアプリケーションにアクセス
3. ギフト相談機能をテスト
4. コンソールでエラーログを確認

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. API認証エラー
```
Error: Plamo API error: 401 Unauthorized
```
**解決方法**: APIキーが正しく設定されているか確認

#### 2. ネットワークエラー
```
Error: Plamo API error: 500 Internal Server Error
```
**解決方法**: 
- APIエンドポイントが正しいか確認
- ネットワーク接続を確認
- しばらく待ってから再試行

#### 3. モデル名エラー
```
Error: Plamo API error: 400 Bad Request
```
**解決方法**: モデル名が`plamo-2.0-prime`になっているか確認

#### 4. タイムアウトエラー
```
Error: Plamo API error: timeout
```
**解決方法**: 
- ネットワーク接続を確認
- タイムアウト設定を調整（必要に応じて）

## 📊 設定確認チェックリスト

- [ ] Preferred Networksアカウントを作成
- [ ] APIキーを生成
- [ ] `.env.local`ファイルを作成
- [ ] 環境変数を正しく設定
- [ ] API接続テストを実行
- [ ] アプリケーションでの動作確認
- [ ] エラーハンドリングの確認

## 🚀 次のステップ

設定が完了したら、以下の機能をテストできます：

1. **ギフト相談機能**: AIによる健康ギフト推薦
2. **感情分析機能**: ユーザーの感情理解
3. **フォールバック機能**: Amazon Bedrockへの自動切り替え

## 📞 サポート

問題が発生した場合は、以下を確認してください：

1. [Preferred Networks公式ドキュメント](https://platform.preferredai.jp/docs)
2. アプリケーションのコンソールログ
3. ネットワーク接続状況
4. APIキーの有効性 