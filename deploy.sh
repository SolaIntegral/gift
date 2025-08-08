#!/bin/bash

echo "🚀 GIFTSアプリのAWSデプロイを開始します..."

# 環境変数の確認
echo "📋 環境変数を確認中..."
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ AWS認証情報が設定されていません"
    echo "以下の手順でAWS認証情報を設定してください："
    echo "1. AWS CLIをインストール: https://aws.amazon.com/cli/"
    echo "2. aws configure で認証情報を設定"
    echo "3. または環境変数 AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY を設定"
    exit 1
fi

# LINE設定の確認
if [ -z "$LINE_CHANNEL_SECRET" ] || [ -z "$LINE_CHANNEL_ACCESS_TOKEN" ]; then
    echo "⚠️  LINE設定が不完全です。LINE連携機能が制限されます。"
    echo "LINE設定を有効にするには以下を設定してください："
    echo "export LINE_CHANNEL_SECRET=your_line_channel_secret"
    echo "export LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token"
fi

# 1. Lambda関数のビルド
echo "🔨 Lambda関数をビルド中..."
cd aws-infrastructure

# 各Lambda関数の依存関係をインストール
echo "📦 ギフト推薦Lambda関数の依存関係をインストール中..."
cd lambda/gift-recommendation
npm install
npm run build
cd ../..

echo "📦 LINE Webhook Lambda関数の依存関係をインストール中..."
cd lambda/line-webhook
npm install
npm run build
cd ../..

echo "📦 注文管理Lambda関数の依存関係をインストール中..."
cd lambda/order-management
npm install
npm run build
cd ../..

# 2. AWS CDKのビルドとデプロイ
echo "🏗️  AWS CDKをビルド中..."
npm install
npm run build

echo "🚀 AWS CDKでデプロイ中..."
npx cdk deploy --require-approval never

if [ $? -ne 0 ]; then
    echo "❌ AWS CDKデプロイに失敗しました"
    exit 1
fi

# 3. データベースの初期化
echo "🗄️  データベースを初期化中..."
# CDKの出力からデータベースエンドポイントを取得
DB_ENDPOINT=$(aws cloudformation describe-stacks --stack-name AwsInfrastructureStack --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' --output text)
DB_PASSWORD=$(aws secretsmanager get-secret-value --secret-id AwsInfrastructureStack-GiftAppDatabaseSecret --query 'SecretString' --output text | jq -r '.password')

echo "データベースエンドポイント: $DB_ENDPOINT"

# MySQLクライアントが利用可能かチェック
if command -v mysql &> /dev/null; then
    echo "📊 データベーススキーマを適用中..."
    mysql -h "$DB_ENDPOINT" -u admin -p"$DB_PASSWORD" < database/schema.sql
    echo "✅ データベース初期化完了"
else
    echo "⚠️  MySQLクライアントが見つかりません。手動でデータベースを初期化してください："
    echo "mysql -h $DB_ENDPOINT -u admin -p'$DB_PASSWORD' < database/schema.sql"
fi

# 4. Vue.jsアプリのビルド
echo "🔨 Vue.jsアプリをビルド中..."
cd ../vue-gift-app
npm install

# 環境変数ファイルの作成
echo "📝 環境変数ファイルを作成中..."
cat > .env.production << EOF
VITE_AWS_API_GATEWAY_URL=$(aws cloudformation describe-stacks --stack-name AwsInfrastructureStack --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' --output text)
VITE_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
VITE_APP_NAME=GIFTS
VITE_APP_VERSION=1.0.0
EOF

npm run build

if [ $? -ne 0 ]; then
    echo "❌ Vue.jsアプリのビルドに失敗しました"
    exit 1
fi

echo "✅ Vue.jsアプリのビルド完了"

# 5. S3にフロントエンドをデプロイ
echo "📤 S3にフロントエンドをアップロード中..."
S3_BUCKET=$(aws cloudformation describe-stacks --stack-name AwsInfrastructureStack --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' --output text)
aws s3 sync dist/ s3://$S3_BUCKET --delete

if [ $? -ne 0 ]; then
    echo "❌ S3アップロードに失敗しました"
    exit 1
fi

echo "✅ S3アップロード完了"

# 6. CloudFrontキャッシュの無効化
echo "🔄 CloudFrontキャッシュを無効化中..."
DISTRIBUTION_ID=$(aws cloudformation describe-stacks --stack-name AwsInfrastructureStack --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' --output text)
if [ "$DISTRIBUTION_ID" != "None" ]; then
    aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
    echo "✅ CloudFrontキャッシュ無効化完了"
fi

# 7. デプロイ完了情報の表示
echo ""
echo "🎉 デプロイ完了！"
echo ""
echo "📊 デプロイ情報:"
echo "🌐 フロントエンドURL: $(aws cloudformation describe-stacks --stack-name AwsInfrastructureStack --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontUrl`].OutputValue' --output text)"
echo "🔗 API Gateway URL: $(aws cloudformation describe-stacks --stack-name AwsInfrastructureStack --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' --output text)"
echo "👥 Cognito User Pool ID: $(aws cloudformation describe-stacks --stack-name AwsInfrastructureStack --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' --output text)"
echo "🗄️  データベースエンドポイント: $DB_ENDPOINT"
echo ""
echo "📝 次のステップ:"
echo "1. フロントエンドURLにアクセスしてアプリを確認"
echo "2. LINE公式アカウントのWebhook URLを設定: {API_GATEWAY_URL}/line-webhook"
echo "3. 必要に応じて環境変数を調整"
echo ""
echo "🔧 トラブルシューティング:"
echo "- CloudWatchログでLambda関数のログを確認"
echo "- AWSコンソールでリソースの状態を確認"
echo "- 必要に応じて手動でデータベーススキーマを適用" 