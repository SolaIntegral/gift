#!/bin/bash

# LINE Webhookテストスクリプト
echo "🧪 LINE Webhookテストを開始します..."

# テスト用のメッセージ
TEST_MESSAGE='{
  "events": [
    {
      "type": "message",
      "message": {
        "type": "text",
        "text": "テストメッセージ"
      },
      "replyToken": "test-reply-token",
      "source": {
        "userId": "test-user-id",
        "type": "user"
      },
      "timestamp": 1234567890
    }
  ],
  "destination": "test-destination"
}'

# Webhook URL
WEBHOOK_URL="https://jquzcc3vd0.execute-api.us-west-2.amazonaws.com/prod/line-webhook"

echo "📤 テストメッセージを送信中..."
echo "URL: $WEBHOOK_URL"
echo ""

# テストリクエストを送信
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-line-signature: test-signature" \
  -d "$TEST_MESSAGE" \
  "$WEBHOOK_URL"

echo ""
echo ""
echo "📊 ログを確認中..."
echo "aws logs tail /aws/lambda/AwsInfrastructureStack-LineWebhookFunction --since 5m"
echo ""

# ログを確認
aws logs tail /aws/lambda/AwsInfrastructureStack-LineWebhookFunction --since 5m 