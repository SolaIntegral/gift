# Kotoba LLM APIキー設定ガイド

## 🔑 APIキー取得手順

### 1. Kotoba LLMアカウント作成
- https://kotoba.ai/ にアクセス
- 無料アカウントを作成
- メール認証を完了

### 2. APIキー生成
- ダッシュボードで「API Keys」を選択
- 新しいAPIキーを作成
- 権限: Chat Completions, Text Generation, Emotion Analysis

### 3. 環境変数設定

#### 開発環境（.env.local）
```bash
VITE_KOTOBA_API_KEY=sk-kotoba-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_KOTOBA_BASE_URL=https://api.kotoba.ai
VITE_KOTOBA_MODEL=kotoba-1.0
```

#### 本番環境（Vercel/AWS）
上記の環境変数を本番環境の設定画面で追加

### 4. 動作確認
- アプリ起動後、「🤖 AI状態」ボタンで接続テスト
- チャット機能で実際の応答を確認

## ⚠️ 重要事項
- APIキーは絶対にGitにコミットしない
- 無料枠: 月間1000リクエスト
- セキュリティのため定期的にキーをローテーション 