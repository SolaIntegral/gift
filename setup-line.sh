#!/bin/bash

# LINE設定スクリプト
echo "🚀 LINE設定を開始します..."

# 環境変数の入力
echo "📝 LINE Developers Consoleから取得した情報を入力してください"
echo ""

read -p "チャンネルシークレット: " LINE_CHANNEL_SECRET
read -p "チャンネルアクセストークン: " LINE_CHANNEL_ACCESS_TOKEN

# 入力確認
echo ""
echo "📋 入力内容確認:"
echo "チャンネルシークレット: ${LINE_CHANNEL_SECRET:0:10}..."
echo "チャンネルアクセストークン: ${LINE_CHANNEL_ACCESS_TOKEN:0:10}..."
echo ""

read -p "この内容で設定しますか？ (y/N): " confirm

if [[ $confirm != [yY] ]]; then
    echo "❌ 設定をキャンセルしました"
    exit 1
fi

# Lambda関数の環境変数を更新
echo "🔧 Lambda関数の環境変数を更新中..."

aws lambda update-function-configuration \
  --function-name AwsInfrastructureStack-LineWebhookFunction \
  --environment Variables="{
    \"LINE_CHANNEL_SECRET\":\"$LINE_CHANNEL_SECRET\",
    \"LINE_CHANNEL_ACCESS_TOKEN\":\"$LINE_CHANNEL_ACCESS_TOKEN\",
    \"FRONTEND_URL\":\"https://dyshzc55luf52.cloudfront.net\",
    \"DB_HOST\":\"awsinfrastructurestack-giftappdatabase41f43bc1-5xcf5xhwunzt.c1wsoywiegxo.us-west-2.rds.amazonaws.com\",
    \"DB_PORT\":\"3306\",
    \"DB_NAME\":\"giftapp\",
    \"DB_USER\":\"admin\",
    \"DB_PASSWORD\":\"$(aws secretsmanager get-secret-value --secret-id AwsInfrastructureStackGiftA-Ms1qIx1xXpJl --query 'SecretString' --output text | jq -r '.password')\",
    \"DB_SSL\":\"true\",
    \"BEDROCK_MODEL_ID\":\"anthropic.claude-3-sonnet-20240229-v1:0\"
  }"

if [ $? -eq 0 ]; then
    echo "✅ Lambda関数の環境変数更新が完了しました"
else
    echo "❌ Lambda関数の環境変数更新に失敗しました"
    exit 1
fi

# 設定確認
echo ""
echo "🔍 設定確認中..."
aws lambda get-function-configuration \
  --function-name AwsInfrastructureStack-LineWebhookFunction \
  --query 'Environment.Variables' \
  --output table

echo ""
echo "🎉 LINE設定が完了しました！"
echo ""
echo "📋 次のステップ:"
echo "1. LINE Developers ConsoleでWebhook URLを設定:"
echo "   https://jquzcc3vd0.execute-api.us-west-2.amazonaws.com/prod/line-webhook"
echo ""
echo "2. LINEアプリでボットを友達追加"
echo ""
echo "3. テストメッセージを送信して動作確認"
echo ""
echo "📊 ログ確認:"
echo "aws logs tail /aws/lambda/AwsInfrastructureStack-LineWebhookFunction --follow" 