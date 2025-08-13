# ギフトURL表示エラー解決ドキュメント

## 概要

フロントエンドからギフトを発行した際に、生成されたギフトURLにアクセスしても「ギフトが見つかりません」エラーが表示される問題を解決しました。

## 問題の詳細

### エラーの症状
- フロントエンドでギフトを選択して決済を実行
- ギフトURLが生成されて表示される
- 生成されたURLにアクセスすると「ギフトが見つかりません」エラーが表示
- ブラウザのコンソールで404エラーが確認される

### エラーの例
```
URL: https://dyshzc55luf52.cloudfront.net/gift/gift_mea0jm7q_df9dqk
エラー: ギフトが見つかりません
コンソール: Failed to load resource: 404 Not Found
```

## 根本原因の特定

### 1. フロントエンドの実装問題
**問題**: `GiftConsultation.vue` で実際のAPIを呼び出していない

**詳細**:
- `generateGiftId()` 関数でローカルでギフトIDを生成
- 実際の注文管理API（`/orders`）を呼び出していない
- データベースにギフトレコードが保存されていない

**該当コード**:
```javascript
// 問題のある実装
const generateGiftId = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `gift_${timestamp}_${random}`
}

// ローカルでURL生成（API呼び出しなし）
const generatedGiftId = generateGiftId()
const baseUrl = window.location.origin
giftUrl.value = `${baseUrl}/gift/${generatedGiftId}`
```

### 2. データベースの不整合
**問題**: 生成されたギフトIDがデータベースに存在しない

**詳細**:
- フロントエンドで生成されたギフトIDは `gift_orders` テーブルに保存されていない
- ギフト詳細取得APIが `gift_orders` テーブルを検索するが、該当レコードが見つからない

## 解決手順

### Step 1: フロントエンドの修正

**修正内容**: `processPayment` 関数で実際のAPIを呼び出すように変更

**修正前**:
```javascript
// ギフトURLを生成
const generatedGiftId = generateGiftId()
const baseUrl = window.location.origin
giftUrl.value = `${baseUrl}/gift/${generatedGiftId}`
```

**修正後**:
```javascript
// 実際のAPIを呼び出してギフト注文を作成
const orderData = {
  giftId: selectedGiftForPayment.value.id,
  recipientName: 'ギフト受取人',
  recipientEmail: 'recipient@example.com',
  message: '健康への想いを込めて贈ります',
  userId: 'test-user'
}

const response = await fetch('https://jquzcc3vd0.execute-api.us-west-2.amazonaws.com/prod/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(orderData)
})

if (!response.ok) {
  throw new Error('ギフト注文の作成に失敗しました')
}

const result = await response.json()

if (result.success && result.data) {
  // APIから返されたギフトURLを使用
  giftUrl.value = result.data.giftUrl
  giftId.value = result.data.id
} else {
  throw new Error('ギフト注文の作成に失敗しました')
}
```

### Step 2: エラーハンドリングの追加

**追加内容**:
```javascript
} catch (error) {
  console.error('Payment failed:', error)
  paymentProcessing.value = false
  alert('決済処理に失敗しました: ' + (error instanceof Error ? error.message : 'Unknown error'))
}
```

### Step 3: フロントエンドの再ビルド・デプロイ

```bash
# フロントエンドのビルド
cd vue-gift-app && npm run build

# S3へのデプロイ
aws s3 sync vue-gift-app/dist/ s3://gift-app-frontend-559050252647-us-west-2/ --delete

# CloudFrontキャッシュの無効化
aws cloudfront create-invalidation --distribution-id E39O1EJLII5DND --paths "/*"
```

## 修正後の動作確認

### 1. API呼び出しの確認
```bash
# ギフト注文の作成
curl -X POST "https://jquzcc3vd0.execute-api.us-west-2.amazonaws.com/prod/orders" \
  -H "Content-Type: application/json" \
  -d '{"giftId":"059405c7-7844-11f0-976e-0667bf342699","recipientName":"テスト受取人","recipientEmail":"test@example.com","message":"テストメッセージ","userId":"test-user"}'

# レスポンス例
{
  "success": true,
  "data": {
    "id": "gift_1755092226874_0urfmvoag",
    "giftUrl": "https://dyshzc55luf52.cloudfront.net/gift/gift_1755092226874_0urfmvoag",
    ...
  }
}
```

### 2. ギフト詳細取得の確認
```bash
# 生成されたギフトIDでAPIテスト
curl -X GET "https://jquzcc3vd0.execute-api.us-west-2.amazonaws.com/prod/gift/gift_1755092226874_0urfmvoag"

# 正常なレスポンス例
{
  "success": true,
  "data": {
    "id": "gift_1755092226874_0urfmvoag",
    "name": "オーガニックプロテイン",
    "description": "植物性プロテインで健康的な筋肉づくりをサポート",
    "price": "3500.00",
    "category": "サプリメント",
    "recipientName": "テスト受取人",
    "recipientEmail": "test@example.com",
    "message": "テストメッセージ"
  }
}
```

## 技術的な学び

### 1. フロントエンド・バックエンド連携の重要性
- フロントエンドでローカルにデータを生成するのではなく、バックエンドAPIを適切に呼び出す
- データの永続化は必ずバックエンドで行う

### 2. エラーハンドリングの重要性
- API呼び出しの失敗を適切にキャッチしてユーザーに通知
- デバッグ情報をコンソールに出力して問題の特定を容易にする

### 3. データベース整合性の確保
- フロントエンドで生成したIDとバックエンドで保存するIDの整合性を保つ
- 一意性と追跡可能性を確保する

## 関連ファイル

- `vue-gift-app/src/components/GiftConsultation.vue` - フロントエンドのギフト相談コンポーネント
- `aws-infrastructure/lambda/order-management/index.ts` - 注文管理Lambda関数
- `aws-infrastructure/lambda/gift-detail/index.ts` - ギフト詳細取得Lambda関数

## 今後の改善点

1. **ユーザー入力フォーム**: 受取人名、メールアドレス、メッセージをユーザーが入力できるようにする
2. **バリデーション**: 入力値の検証機能を追加
3. **エラーリトライ**: API呼び出し失敗時の自動リトライ機能
4. **ローディング状態**: より詳細なローディング表示

---

**解決日**: 2025年8月13日  
**担当者**: AI Assistant  
**ステータス**: 解決済み ✅ 