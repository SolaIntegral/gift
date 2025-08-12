# LINE設定実装手順

## 📋 Step 1: LINE Developers Console設定

### 1.1 プロバイダー作成
1. [LINE Developers Console](https://developers.line.biz/)にアクセス
2. 「新規プロバイダー作成」をクリック
3. プロバイダー名: `GIFTS Health Gift Platform`
4. 作成完了

### 1.2 チャンネル作成
1. 作成したプロバイダーを選択
2. 「新規チャンネル作成」をクリック
3. チャンネルタイプ: `Messaging API`
4. チャンネル名: `GIFTS Bot`
5. チャンネル説明: `健康ギフトプラットフォームのLINEボット`
6. 作成完了

### 1.3 チャンネル基本設定
1. **チャンネル基本設定**タブを開く
2. **Webhook URL**を設定:
   ```
   https://jquzcc3vd0.execute-api.us-west-2.amazonaws.com/prod/line-webhook
   ```
3. **Webhookの利用**: 有効
4. **検証**: 有効
5. **チャンネルシークレット**をコピー（後で使用）

### 1.4 Messaging API設定
1. **Messaging API設定**タブを開く
2. **チャンネルアクセストークン（長期）**を発行
3. トークンをコピー（後で使用）

## 🔧 Step 2: AWS Lambda環境変数更新

### 2.1 環境変数設定
```bash
# チャンネルシークレットとアクセストークンを設定
aws lambda update-function-configuration \
  --function-name AwsInfrastructureStack-LineWebhookFunction \
  --environment Variables='{
    "LINE_CHANNEL_SECRET":"YOUR_CHANNEL_SECRET_HERE",
    "LINE_CHANNEL_ACCESS_TOKEN":"YOUR_CHANNEL_ACCESS_TOKEN_HERE",
    "FRONTEND_URL":"https://dyshzc55luf52.cloudfront.net"
  }'
```

### 2.2 設定確認
```bash
# 現在の環境変数を確認
aws lambda get-function-configuration \
  --function-name AwsInfrastructureStack-LineWebhookFunction \
  --query 'Environment.Variables'
```

## 🧪 Step 3: 動作確認

### 3.1 LINEアプリでの確認
1. LINEアプリでボットを友達追加
2. QRコードまたはユーザーIDで追加
3. メッセージを送信して応答を確認

### 3.2 ログ確認
```bash
# CloudWatchログの確認
aws logs tail /aws/lambda/AwsInfrastructureStack-LineWebhookFunction --follow
```

## 🎯 期待される機能

### 基本機能
- **挨拶メッセージ**: 初回メッセージ時の歓迎
- **ヘルプ機能**: 利用可能なコマンドの説明
- **エラーハンドリング**: 適切なエラーメッセージ

### ギフト相談機能
- **AI相談**: Amazon Bedrockを使用したギフト推薦
- **質問形式**: 予算、相手、シーンなどの質問
- **推薦結果**: 適切なギフトの提案

### 注文管理機能
- **注文確認**: 注文IDによる状況確認
- **注文作成**: LINE経由での注文作成
- **支払い状況**: 支払い状況の確認

## 📝 メッセージ例

### 初回メッセージ
```
👋 こんにちは！GIFTSボットです。

健康をテーマにしたギフトプラットフォームです。
以下の機能をご利用いただけます：

🎁 ギフト相談
「ギフト相談」と送信してください

📋 注文確認
「注文確認 [注文ID]」と送信してください

❓ ヘルプ
「ヘルプ」と送信してください
```

### ギフト相談フロー
```
🎁 ギフト相談を開始します！

以下の質問にお答えください：

1️⃣ 予算はどのくらいですか？
- 5000-10000円
- 10000-20000円
- 20000-30000円
- 30000-50000円
- 50000円以上

「予算: [選択肢]」と送信してください
```

## 🔍 トラブルシューティング

### よくある問題
1. **Webhook URLエラー**: URLが正しく設定されているか確認
2. **署名検証エラー**: チャンネルシークレットが正しく設定されているか確認
3. **タイムアウトエラー**: Lambda関数のタイムアウト設定を確認

### ログ確認コマンド
```bash
# リアルタイムログ確認
aws logs tail /aws/lambda/AwsInfrastructureStack-LineWebhookFunction --follow

# 特定の時間範囲のログ確認
aws logs filter-log-events \
  --log-group-name /aws/lambda/AwsInfrastructureStack-LineWebhookFunction \
  --start-time $(date -d '1 hour ago' +%s)000
``` 