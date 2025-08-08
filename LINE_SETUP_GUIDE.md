# LINE設定ガイド

## 📋 必要な情報

### 1. LINE Developers Console設定
- **Webhook URL**: `https://jquzcc3vd0.execute-api.us-west-2.amazonaws.com/prod/line-webhook`
- **チャンネルシークレット**: LINE Developers Consoleで取得
- **チャンネルアクセストークン**: LINE Developers Consoleで取得

### 2. AWS環境変数設定
以下の環境変数をLambda関数に設定する必要があります：

```bash
LINE_CHANNEL_SECRET=your_channel_secret_here
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
FRONTEND_URL=https://dyshzc55luf52.cloudfront.net
```

## 🔧 設定手順

### Step 1: LINE Developers Console設定
1. [LINE Developers Console](https://developers.line.biz/)にアクセス
2. 新しいプロバイダーを作成（または既存のプロバイダーを選択）
3. 新しいチャンネルを作成（Messaging API）
4. チャンネル基本設定で以下を設定：
   - **Webhook URL**: `https://jquzcc3vd0.execute-api.us-west-2.amazonaws.com/prod/line-webhook`
   - **Webhookの利用**: 有効
   - **検証**: 有効

### Step 2: チャンネル情報の取得
1. **チャンネルシークレット**: チャンネル基本設定から取得
2. **チャンネルアクセストークン**: Messaging API設定から取得

### Step 3: AWS Lambda環境変数更新
```bash
# AWS CLIで環境変数を更新
aws lambda update-function-configuration \
  --function-name AwsInfrastructureStack-LineWebhookFunction \
  --environment Variables='{
    "LINE_CHANNEL_SECRET":"your_channel_secret_here",
    "LINE_CHANNEL_ACCESS_TOKEN":"your_channel_access_token_here",
    "FRONTEND_URL":"https://dyshzc55luf52.cloudfront.net"
  }'
```

### Step 4: 動作確認
1. LINEアプリでボットを友達追加
2. メッセージを送信して応答を確認
3. ギフト相談機能のテスト

## 🎯 期待される機能

### LINE Bot機能
- **挨拶メッセージ**: 初回メッセージ時の歓迎メッセージ
- **ギフト相談**: AIによるギフト推薦
- **注文状況確認**: 注文IDによる状況確認
- **ヘルプ機能**: 利用可能なコマンドの説明

### メッセージ例
```
👋 こんにちは！GIFTSボットです。

以下の機能をご利用いただけます：

🎁 ギフト相談
「ギフト相談」と送信してください

📋 注文確認
「注文確認 [注文ID]」と送信してください

❓ ヘルプ
「ヘルプ」と送信してください
```

## 🔍 トラブルシューティング

### よくある問題
1. **Webhook URLエラー**: URLが正しく設定されているか確認
2. **署名検証エラー**: チャンネルシークレットが正しく設定されているか確認
3. **タイムアウトエラー**: Lambda関数のタイムアウト設定を確認

### ログ確認
```bash
# CloudWatchログの確認
aws logs tail /aws/lambda/AwsInfrastructureStack-LineWebhookFunction --follow
```

## 📞 サポート

問題が発生した場合は、以下を確認してください：
1. CloudWatchログでのエラー詳細
2. LINE Developers ConsoleでのWebhook設定
3. AWS Lambda関数の環境変数設定 