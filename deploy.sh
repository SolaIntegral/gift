#!/bin/bash

echo "🚀 GIFTSアプリのデプロイを開始します..."

# 1. Supabaseの設定確認
echo "📋 Supabaseの設定を確認中..."
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ 環境変数が設定されていません"
    echo "以下の手順でSupabaseを設定してください："
    echo "1. https://supabase.com でアカウント作成"
    echo "2. 新しいプロジェクトを作成"
    echo "3. Settings → API でURLとキーを取得"
    echo "4. .env.localファイルを作成"
    exit 1
fi

# 2. Vue.jsアプリのビルド
echo "🔨 Vue.jsアプリをビルド中..."
cd vue-gift-app
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "❌ ビルドに失敗しました"
    exit 1
fi

echo "✅ ビルド完了"

# 3. デプロイ方法の選択
echo "🌐 デプロイ方法を選択してください："
echo "1) Vercel (推奨 - 無料、簡単)"
echo "2) Netlify (無料、簡単)"
echo "3) AWS (有料、本格的なインフラ)"

read -p "選択してください (1-3): " choice

case $choice in
    1)
        echo "🚀 Vercelでデプロイします..."
        if ! command -v vercel &> /dev/null; then
            echo "📦 Vercel CLIをインストール中..."
            npm install -g vercel
        fi
        
        vercel --prod
        ;;
    2)
        echo "🚀 Netlifyでデプロイします..."
        if ! command -v netlify &> /dev/null; then
            echo "📦 Netlify CLIをインストール中..."
            npm install -g netlify-cli
        fi
        
        netlify deploy --prod --dir=dist
        ;;
    3)
        echo "🚀 AWSでデプロイします..."
        cd ../aws-infrastructure
        
        if ! command -v aws &> /dev/null; then
            echo "❌ AWS CLIがインストールされていません"
            echo "https://aws.amazon.com/cli/ からインストールしてください"
            exit 1
        fi
        
        npm install
        npm run build
        npx cdk deploy
        
        # S3にビルドファイルをアップロード
        echo "📤 S3にファイルをアップロード中..."
        aws s3 sync ../vue-gift-app/dist s3://gift-app-website --delete
        ;;
    *)
        echo "❌ 無効な選択です"
        exit 1
        ;;
esac

echo "🎉 デプロイ完了！"
echo "📱 サイトのURLを共有して、世界中の人にアクセスしてもらえます！" 